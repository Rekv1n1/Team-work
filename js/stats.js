const state = {
  sort: 'total',      // total | percent
  selectedUser: null  // id выбранного пользователя
};

// ===== Карточки-метрики =====
function renderCards() {
  let done = 0;
  for (let i = 0; i < todos.length; i++) {
    if (todos[i].completed) done = done + 1;
  }

  const total = todos.length;
  const percent = total === 0 ? 0 : Math.round(done / total * 100);

  const cards = [
    { value: total, label: 'Всего задач', cls: '' },
    { value: done, label: 'Выполнено', cls: '' },
    { value: total - done, label: 'Активных', cls: '' },
    { value: percent + '%', label: 'Процент', cls: 'card--accent' }
  ];

  let html = '';
  for (let i = 0; i < cards.length; i++) {
    html = html + `
      <div class="card ${cards[i].cls}">
        <div class="card__icon card__icon--${i === 0 ? 'total' : i === 1 ? 'done' : i === 2 ? 'active' : 'percent'}" aria-hidden="true">${i === 0 ? '☷' : i === 1 ? '✓' : i === 2 ? '◷' : '⌁'}</div>
        <p class="card__value">${cards[i].value}</p>
        <p class="card__label">${cards[i].label}</p>
      </div>
    `;
  }

  document.getElementById('cards').innerHTML = html;
}

// ===== Группировка по userId (объект-счётчик) =====
function countByUser() {
  const counts = {};

  for (let i = 0; i < todos.length; i++) {
    const id = todos[i].userId;

    // Встретили пользователя впервые — заводим запись
    if (counts[id] === undefined) {
      counts[id] = { total: 0, done: 0 };
    }

    counts[id].total = counts[id].total + 1;

    if (todos[i].completed) {
      counts[id].done = counts[id].done + 1;
    }
  }

  return counts;
}

function getPercent(item) {
  return Math.round(item.done / item.total * 100);
}

// ===== Рейтинг =====
function renderRating() {
  const counts = countByUser();
  const userIds = Object.keys(counts);

  userIds.sort(function (a, b) {
    if (state.sort === 'percent') {
      const diff = getPercent(counts[b]) - getPercent(counts[a]);
      if (diff !== 0) return diff;
    }
    return counts[b].total - counts[a].total; // по убыванию задач
  });

  const top = userIds.slice(0, 10);

  let html = '';
  for (let i = 0; i < top.length; i++) {
    const id = top[i];
    const item = counts[id];
    const percent = getPercent(item);
    const selected = Number(id) === state.selectedUser ? 'selected' : '';

    html = html + `
      <div class="rating__row ${selected}" tabindex="0" onclick="selectUser(${id})"
           onkeydown="if (event.key === 'Enter') selectUser(${id})">
        <span class="rating__place">${i + 1}</span>
        <span class="rating__user">User ${id}</span>
        <div class="bar"><div class="bar__fill" style="width: ${percent}%"></div></div>
        <span class="rating__count">${item.done} из ${item.total} · ${percent}%</span>
      </div>
    `;
  }

  document.getElementById('rating').innerHTML = html;
}

// ===== Задачи выбранного пользователя =====
function selectUser(id) {
  state.selectedUser = id;
  renderRating();
  renderUserTasks();
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderUserTasks() {
  const box = document.getElementById('userTasks');

  if (state.selectedUser === null) {
    box.innerHTML = '';
    return;
  }

  const list = todos.filter(t => t.userId === state.selectedUser);

  let html = '<div class="user-tasks__head"><h2 class="section-title">Задачи User ' + state.selectedUser +
    '</h2><span class="user-tasks__count">(' + list.length + ')</span></div>';

  for (let i = 0; i < list.length; i++) {
    html = html + `
      <div class="utask ${list[i].completed ? 'done' : ''}">
        <span class="utask__check" aria-hidden="true">${list[i].completed ? '✓' : ''}</span>
        <p>${escapeHtml(list[i].todo)}</p>
        <span class="badge ${list[i].completed ? 'badge--done' : ''}">
          ${list[i].completed ? 'Выполнена' : 'Активна'}
        </span>
      </div>
    `;
  }

  box.innerHTML = html;
}

// ===== Главная функция страницы =====
function renderStats() {
  renderCards();
  renderRating();
  if (state.selectedUser === null) {
    const counts = countByUser();
    const top = Object.keys(counts).sort(function (a, b) {
      return counts[b].total - counts[a].total;
    });
    if (top.length) state.selectedUser = Number(top[0]);
  }
  renderRating();
  renderUserTasks();
}

// ===== Переключатель сортировки (бонус) =====
document.getElementById('sort').addEventListener('click', function (e) {
  const btn = e.target.closest('.sort__btn');
  if (!btn) return;

  state.sort = btn.dataset.sort;

  const buttons = document.querySelectorAll('.sort__btn');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle('active', buttons[i] === btn);
  }

  renderRating();
});

// ===== Старт =====
loadTodos()
  .then(function () {
    renderStats();
  })
  .catch(function () {
    document.getElementById('rating').textContent =
      'Не удалось загрузить данные. Обновите страницу.';
  });