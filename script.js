let systemPrompts = [];
let userPrompts = [];
let columnDescriptions = {
  columnC: "독서 활동",
  columnD: "읽게 된 동기",
  columnE: "줄거리"
};
let jsonFileContent = null; // JSON 파일의 내용 저장

// JSON 파일 업로드 핸들러
function handleFileUpload(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    jsonFileContent = e.target.result; // JSON 파일의 내용을 저장
    alert("JSON 파일이 업로드되었습니다.");
  };

  reader.readAsText(file);
}

// 시스템 프롬프트 추가
function addSystemPrompt() {
  const input = document.getElementById('systemPromptInput');
  if (input.value.trim() !== '') {
    systemPrompts.push(input.value);
    updatePromptList('systemPromptList', systemPrompts);
    input.value = '';
  }
}

// 프롬프트 템플릿 생성
function generateTemplate() {
  const templateParts = Object.keys(columnDescriptions).map(key => {
    return `${columnDescriptions[key]}: \${${key}}`;
  });

  const template = templateParts.join('\n');
  const userPrompt = {
    template: template,
    columnDescriptions: { ...columnDescriptions }
  };

  userPrompts.push(userPrompt);
  updatePromptList('userPromptList', userPrompt);
}

// 프롬프트 리스트 업데이트
function updatePromptList(listId, prompts) {
  const list = document.getElementById(listId);
  if (listId === 'userPromptList') {
    list.innerHTML = prompts.map((prompt, index) => 
      `<div class="prompt-item">템플릿: <pre>${prompt.template}</pre> <button class="button" style="background-color: #e74c3c;" onclick="removePrompt('${listId}', ${index})">삭제</button></div>`
    ).join('');
  } else if (listId === 'systemPromptList') {
    list.innerHTML = prompts.map((prompt, index) => 
      `<div class="prompt-item">${prompt} <button class="button" style="background-color: #e74c3c;" onclick="removePrompt('${listId}', ${index})">삭제</button></div>`
    ).join('');
  }
}

// 프롬프트 삭제
function removePrompt(listId, index) {
  if (listId === 'systemPromptList') {
    systemPrompts.splice(index, 1);
    updatePromptList('systemPromptList', systemPrompts);
  } else if (listId === 'userPromptList') {
    userPrompts.splice(index, 1);
    updatePromptList('userPromptList', userPrompts);
  }
}

// 새 열 추가
function addColumn() {
  const newColumnName = document.getElementById('newColumnName').value.trim();
  const newColumnDescription = document.getElementById('newColumnDescription').value.trim();
  
  if (newColumnName && newColumnDescription) {
    const formattedColumnName = formatColumnName(newColumnName);
    if (!columnDescriptions[formattedColumnName]) { // 중복된 열 이름을 방지
      columnDescriptions[formattedColumnName] = newColumnDescription;
      const columnDiv = document.createElement('div');
      columnDiv.className = 'column-description';
      columnDiv.innerHTML = `
        <input type="text" id="${formattedColumnName}" value="${newColumnDescription}" class="input-field">
        <button class="button" style="background-color: #e74c3c;" onclick="removeColumn('${formattedColumnName}')">삭제</button>
      `;
      document.getElementById('columnDescriptions').appendChild(columnDiv);
      document.getElementById('newColumnName').value = '';
      document.getElementById('newColumnDescription').value = '';
    } else {
      alert('같은 이름의 열이 이미 존재합니다.');
    }
  } else {
    alert('새 열 이름과 설명을 입력하세요.');
  }
}

// 열 이름 형식화
function formatColumnName(name) {
  // "F" -> "columnF"
  return name.match(/^column/i) ? name : `column${name.toUpperCase()}`;
}

// 새 열 이름 자동 변환
function updateNewColumnName() {
  const input = document.getElementById('newColumnName');
  input.value = formatColumnName(input.value);
}

// 열 삭제
function removeColumn(columnName) {
  delete columnDescriptions[columnName];
  const columnElement = document.getElementById(columnName).parentElement;
  document.getElementById('columnDescriptions').removeChild(columnElement);
}

// 스프레드시트 데이터 처리 시작
function startProcess() {
  var spreadsheetUrl = document.getElementById('spreadsheetUrl').value;
  var sheetName = document.getElementById('sheetName').value;
  var apiKey = document.getElementById('apiKey').value;
  var startRow = document.getElementById('startRow').value;
  var endRow = document.getElementById('endRow').value;

  if (!jsonFileContent) {
    alert("JSON 파일을 업로드해주세요.");
    return;
  }

  document.getElementById('progressBar').style.display = 'block';
  document.getElementById('status').innerHTML = '처리 중...';

  google.script.run
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onFailure)
    .processData(spreadsheetUrl, sheetName, apiKey, jsonFileContent, parseInt(startRow), endRow ? parseInt(endRow) : null, systemPrompts, userPrompts);
}

// 처리 성공 핸들러
function onSuccess(result) {
  document.getElementById('status').innerHTML = result;
  document.getElementById('progressBarFill').style.width = '100%';
  document.getElementById('progressBarFill').innerHTML = '완료';
}

// 처리 실패 핸들러
function onFailure(error) {
  document.getElementById('status').innerHTML = '오류: ' + error.message;
}

// 진행 상황 업데이트
function updateProgressBar(progress) {
  var fill = document.getElementById('progressBarFill');
  fill.style.width = progress + '%';
  fill.innerHTML = Math.round(progress) + '%';
}

// 시스템 프롬프트 저장
function saveSystemPrompts() {
  const fileName = document.getElementById('saveSystemPromptName').value || 'system_prompts';
  const data = JSON.stringify(systemPrompts, null, 2);
  downloadFile(data, `${fileName}.json`);
}

// 시스템 프롬프트 불러오기
function loadSystemPrompts(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      systemPrompts = JSON.parse(e.target.result);
      updatePromptList('systemPromptList', systemPrompts);
      alert('시스템 프롬프트가 불러와졌습니다.');
    };
    reader.readAsText(file);
  }
}

// 사용자 프롬프트 템플릿 저장
function saveUserPrompts() {
  const fileName = document.getElementById('saveUserPromptName').value || 'user_prompts';
  const data = JSON.stringify({ userPrompts, columnDescriptions }, null, 2);
  downloadFile(data, `${fileName}.json`);
}

// 사용자 프롬프트 템플릿 불러오기
function loadUserPrompts(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const data = JSON.parse(e.target.result);
      userPrompts = data.userPrompts || [];
      columnDescriptions = data.columnDescriptions || {};
      updatePromptList('userPromptList', userPrompts);
      updateColumnDescriptions();
      alert('사용자 프롬프트 템플릿이 불러와졌습니다.');
    };
    reader.readAsText(file);
  }
}

// 파일 다운로드
function downloadFile(content, fileName) {
  const blob = new Blob([content], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 열 설명을 업데이트하여 UI에 반영
function updateColumnDescriptions() {
  const columnDescriptionsDiv = document.getElementById('columnDescriptions');
  columnDescriptionsDiv.innerHTML = '';
  for (const [columnName, columnDesc] of Object.entries(columnDescriptions)) {
    const columnDiv = document.createElement('div');
    columnDiv.className = 'column-description';
    columnDiv.innerHTML = `
      <input type="text" id="${columnName}" value="${columnDesc}" class="input-field">
      <button class="button" style="background-color: #e74c3c;" onclick="removeColumn('${columnName}')">삭제</button>
    `;
    columnDescriptionsDiv.appendChild(columnDiv);
  }
}
