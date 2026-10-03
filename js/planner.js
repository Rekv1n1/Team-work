const plannerState = { filter: 'all', search: '' };

// ===== Фильтрация: вкладка + поиск через одну функцию =====
function getVisibleTasks() {
  let result = todos;

  if (plannerState.filter === 'active') {
    result = result.filter(t => t.completed === false);
  }
  if (plannerState.filter === 'done') {
    result = result.filter(t => t.completed === true);
  }
  if (plannerState.search !== '') {
    result = result.filter(t =>
      t.todo.toLowerCase().includes(plannerState.search.toLowerCase())
    );
  }

  return result;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ===== Список =====
function renderList(list) {
  let html = '';

  for (let i = 0; i < list.length; i++) {
    const task = list[i];
    html = html + `
      <article class="task-row ${task.completed ? 'done' : ''}" onclick="toggleTodo(${task.id})">
        <span class="task-check" aria-hidden="true">${task.completed ? '✓' : ''}</span>
        <p class="task-text" title="${escapeHtml(task.todo)}">${escapeHtml(task.todo)}</p>
        <span class="task-user">User ${task.userId}</span>
      </article>`;
  }

  if (list.length === 0) {
    html = '<div class="task-row"><p class="task-text">Ничего не найдено</p></div>';
  }

  document.getElementById('taskList').innerHTML = html;
  document.getElementById('taskFooter').textContent =
    'Показано ' + list.length + ' из ' + todos.length;
}

// ===== Счётчики вкладок =====
function getDoneCount() {
  let done = 0;
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].completed) done = done + 1;
  }
  return done;
}

function updateCounters() {
  const total = todos.length;
  const done = getDoneCount();

  document.querySelector('[data-filter="all"]').textContent = 'Все (' + total + ')';
  document.querySelector('[data-filter="active"]').textContent = 'Активные (' + (total - done) + ')';
  document.querySelector('[data-filter="done"]').textContent = 'Выполненные (' + done + ')';
}

// ===== Прогресс-бар =====
function updateProgress() {
  const total = todos.length;
  const done = getDoneCount();
  const percent = total === 0 ? 0 : Math.round(done / total * 100);

  document.getElementById('progressPercent').textContent = percent + '%';
  document.getElementById('progressCount').textContent = '(' + done + ' из ' + total + ')';
  document.getElementById('progressFill').style.width = percent + '%';
}

function renderPlanner() {
  renderList(getVisibleTasks());
  updateCounters();
  updateProgress();
}

// ===== Клик по задаче =====
// Данные меняются только в памяти браузера: DummyJSON ничего не сохраняет.
function toggleTodo(id) {
  const task = todos.find(t => t.id === id);
  task.completed = !task.completed;
  renderPlanner();
}

// ===== Обработчики =====
document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    plannerState.filter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(b => b.classList.toggle('active', b === button));
    renderPlanner();
  });
});

document.getElementById('searchInput').addEventListener('input', event => {
  plannerState.search = event.target.value.trim();
  renderPlanner();
});

// ===== Старт =====
loadTodos()
  .then(function () {
    renderPlanner();
  })
  .catch(function () {
    document.getElementById('taskList').innerHTML =
      '<div class="task-row"><p class="task-text">Не удалось загрузить задачи. Обновите страницу.</p></div>';
    document.getElementById('progressCount').textContent = '(ошибка загрузки)';
  });