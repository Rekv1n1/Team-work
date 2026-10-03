const state = {
  filter: 'all',   // all | active | completed
  query: ''
};
 
// ===== Фильтрация: вкладка + поиск через одну функцию =====
function getFilteredTodos() {
  let result = todos;
 
  if (state.filter === 'active') {
    result = result.filter(t => t.completed === false);
  }
  if (state.filter === 'completed') {
    result = result.filter(t => t.completed === true);
  }
  if (state.query !== '') {
    result = result.filter(t =>
      t.todo.toLowerCase().includes(state.query.toLowerCase())
    );
  }
 
  return result;
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
// ===== Список =====
function renderList(items) {
  let html = '';
 
  for (let i = 0; i < items.length; i++) {
    const task = items[i];
    html = html + `
      <div class="task ${task.completed ? 'done' : ''}"
           onclick="toggleTodo(${task.id})">
        <span class="check"></span>
        <p>${escapeHtml(task.todo)}</p>
        <span class="user">User ${task.userId}</span>
        <button class="remove" type="button" aria-label="Удалить"
                onclick="removeTodo(event, ${task.id})">&times;</button>
      </div>
    `;
  }
 
  if (items.length === 0) {
    html = '<div class="empty">Ничего не найдено</div>';
  }
 
  document.getElementById('list').innerHTML = html;
  document.getElementById('shown').textContent =
    'Показано ' + items.length + ' из ' + todos.length;
}
 
// ===== Счётчики вкладок =====
function updateCounters() {
  let done = 0;
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].completed) done = done + 1;
  }
 
  document.getElementById('countAll').textContent = todos.length;
  document.getElementById('countActive').textContent = todos.length - done;
  document.getElementById('countCompleted').textContent = done;
}
 
// ===== Прогресс-бар =====
function updateProgress() {
  let done = 0;
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].completed) done = done + 1;
  }
 
  const percent = todos.length === 0 ? 0 : Math.round(done / todos.length * 100);
 
  document.getElementById('progressFill').style.width = percent + '%';
  document.getElementById('progressText').textContent =
    'Выполнено ' + percent + '% (' + done + ' из ' + todos.length + ')';
}
 
function render() {
  renderList(getFilteredTodos());
  updateCounters();
  updateProgress();
}
 
// ===== Действия =====
function toggleTodo(id) {
  const task = todos.find(t => t.id === id);
  task.completed = !task.completed;
  render();
}
 
function removeTodo(event, id) {
  event.stopPropagation(); // чтобы клик по × не отмечал задачу
  todos = todos.filter(t => t.id !== id);
  render();
}
 
function addTodo() {
  const input = document.getElementById('addInput');
  const text = input.value.trim();
  if (text === '') return;
 
  todos.unshift({
    id: Date.now(),
    todo: text,
    completed: false,
    userId: 1
  });
 
  input.value = '';
  render();
}
 
// ===== Обработчики =====
document.getElementById('tabs').addEventListener('click', function (e) {
  const tab = e.target.closest('.tab');
  if (!tab) return;
 
  state.filter = tab.dataset.filter;
 
  const tabs = document.querySelectorAll('.tab');
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].classList.toggle('active', tabs[i] === tab);
  }
 
  render();
});
 
document.getElementById('searchInput').addEventListener('input', function (e) {
  state.query = e.target.value.trim();
  render();
});
 
document.getElementById('addBtn').addEventListener('click', addTodo);
document.getElementById('addInput').addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addTodo();
});
 
// ===== Старт =====
loadTodos()
  .then(function () {
    render();
  })
  .catch(function () {
    document.getElementById('list').innerHTML =
      '<div class="empty">Не удалось загрузить задачи. Обновите страницу.</div>';
    document.getElementById('progressText').textContent = 'Ошибка загрузки';
  });