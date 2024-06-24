let systemPrompts = [];
let userPrompts = [];
let columnDescriptions = {
  columnC: "독서 활동",
  columnD: "읽게 된 동기",
  columnE: "줄거리"
};

function addSystemPrompt() {
  const input = document.getElementById('systemPromptInput');
  if (input.value.trim() !== '') {
    systemPrompts.push(input.value);
    updatePromptList('systemPromptList', systemPrompts);
    input.value = '';
  }
}

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
  updatePromptList('userPromptList', userPrompts);
}

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

function removePrompt(listId, index) {
  if (listId === 'systemPromptList') {
    systemPrompts.splice(index, 1);
    updatePromptList('systemPromptList', systemPrompts);
  } else if (listId === 'userPromptList') {
    userPrompts.splice(index, 1);
    updatePromptList('userPromptList', userPrompts);
  }
}

function addColumn() {
  const newColumnName = document.getElementById('newColumnName').value.trim();
  const newColumnDescription = document.getElementById('newColumnDescription').value.trim();
  
  if (newColumnName && newColumnDescription) {
    if (!columnDescriptions[newColumnName]) { // 중복된 열 이름을 방지
      columnDescriptions[newColumnName] = newColumnDescription;
      const columnDiv = document.createElement('div');
      columnDiv.className = 'column-description';
      columnDiv.innerHTML = `
        <input type="text" id="${newColumnName}" value="${newColumnDescription}" class="input-field">
        <button class="button" style="background-color: #e74c3c;" onclick="removeColumn('${newColumnName}')">삭제</button>
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

function removeColumn(columnName) {
  delete columnDescriptions[columnName];
  const columnElement = document.getElementById(columnName).parentElement;
  document.getElementById('columnDescriptions').removeChild(columnElement);
}

function startProcess() {
  var spreadsheetUrl = document.getElementById('spreadsheetUrl').value;
  var sheetName = document.getElementById('sheetName').value;
  var apiKey = document.getElementById('apiKey').value;
  var startRow = document.getElementById('startRow').value;
  var endRow = document.getElementById('endRow').value;
  
  document.getElementById('progressBar').style.display = 'block';
  document.getElementById('status').innerHTML = '처리 중...';
  
  // Google Apps Script와 연동하는 부분
  // google.script.run
  //   .withSuccessHandler(onSuccess)
  //   .withFailureHandler(onFailure)
  //   .processData(spreadsheetUrl, sheetName, apiKey, parseInt(startRow), endRow ? parseInt(endRow) : null, systemPrompts, userPrompts);

  // Demonstration only: Simulate the processing
  setTimeout(() => {
    onSuccess('처리가 완료되었습니다.');
  }, 2000); // Simulating processing time
}

function onSuccess(result) {
  document.getElementById('status').innerHTML = result;
  document.getElementById('progressBarFill').style.width = '100%';
  document.getElementById('progressBarFill').innerHTML = '완료';
}

function onFailure(error) {
  document.getElementById('status').innerHTML = '오류: ' + error.message;
}

function updateProgressBar(progress) {
  var fill = document.getElementById('progressBarFill');
  fill.style.width = progress + '%';
  fill.innerHTML = Math.round(progress) + '%';
}

// 시스템 프롬프트 저장 기능
function saveSystemPrompts() {
  localStorage.setItem('savedSystemPrompts', JSON.stringify(systemPrompts));
  alert('시스템 프롬프트가 저장되었습니다.');
}

// 시스템 프롬프트 불러오기 기능
function loadSystemPrompts() {
  const savedSystemPrompts = localStorage.getItem('savedSystemPrompts');
  if (savedSystemPrompts) {
    systemPrompts = JSON.parse(savedSystemPrompts);
    updatePromptList('systemPromptList', systemPrompts);
    alert('시스템 프롬프트가 불러와졌습니다.');
  } else {
    alert('저장된 시스템 프롬프트가 없습니다.');
  }
}

// 사용자 프롬프트 템플릿 저장 기능
function saveUserPrompts() {
  const data = {
    userPrompts: userPrompts,
    columnDescriptions: columnDescriptions
  };
  localStorage.setItem('savedUserPrompts', JSON.stringify(data));
  alert('사용자 프롬프트 템플릿이 저장되었습니다.');
}

// 사용자 프롬프트 템플릿 불러오기 기능
function loadUserPrompts() {
  const savedData = localStorage.getItem('savedUserPrompts');
  if (savedData) {
    const data = JSON.parse(savedData);
    userPrompts = data.userPrompts || [];
    columnDescriptions = data.columnDescriptions || {};
    updatePromptList('userPromptList', userPrompts);
    updateColumnDescriptions();
    alert('사용자 프롬프트 템플릿이 불러와졌습니다.');
  } else {
    alert('저장된 사용자 프롬프트 템플릿이 없습니다.');
  }
}

// 컬럼 설명을 업데이트하여 불러온 후 UI에 반영
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
