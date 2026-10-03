// ===== Общие данные =====
let todos = [];

function loadTodos() {
  return axios.get('https://dummyjson.com/todos?limit=0')
    .then(function (response) {
      todos = response.data.todos;
      return todos;
    });
}

// ===== Случайная задача (модальное окно) =====
function createModal() {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.id = 'randomModal';
  modal.innerHTML = `
    <div class="modal__box" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <button class="modal__close" type="button" aria-label="Закрыть">&times;</button>
      <p class="modal__title" id="modalTitle">Случайная задача</p>
      <p class="modal__text" id="modalText"></p>
      <div class="modal__meta">
        <span class="badge" id="modalStatus"></span>
        <span class="badge" id="modalUser"></span>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // крестик
  modal.querySelector('.modal__close').addEventListener('click', closeRandomModal);
  // клик по тёмному фону (но не по самому окну)
  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeRandomModal();
  });
  // клавиша Esc
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeRandomModal();
  });
}

function closeRandomModal() {
  document.getElementById('randomModal').classList.remove('open');
}

function showRandomTodo() {
  const btn = document.getElementById('randomBtn');
  btn.disabled = true;

  axios.get('https://dummyjson.com/todos/random')
    .then(function (response) {
      const task = response.data;

      document.getElementById('modalText').textContent = task.todo;
      document.getElementById('modalUser').textContent = 'User ' + task.userId;

      const status = document.getElementById('modalStatus');
      status.textContent = task.completed ? 'Выполнена' : 'Активна';
      status.classList.toggle('badge--done', task.completed);

      document.getElementById('randomModal').classList.add('open');
    })
    .catch(function () {
      alert('Не удалось получить задачу. Проверьте интернет и попробуйте ещё раз.');
    })
    .then(function () {
      btn.disabled = false;
    });
}

// ===== Запуск на любой странице =====
createModal();
document.getElementById('randomBtn').addEventListener('click', showRandomTodo);