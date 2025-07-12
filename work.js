// --- Constants & Elements ---
const MAX_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
const loginTime = Number(sessionStorage.getItem('loginTime'));
const role = sessionStorage.getItem('userRole') || 'Viewer';

const logoutButton = document.getElementById('logoutButton');
const projectsList = document.getElementById('projectsList');
const noProjectsMessage = document.getElementById('noProjectsMessage');
const notificationBox = document.getElementById('notifications');
const userRoleDisplay = document.getElementById('userRole');
const filterStatusSelect = document.getElementById('filterStatus');

const stats = {
  total: document.getElementById('statTotal'),
  completed: document.getElementById('statCompleted'),
  inProgress: document.getElementById('statInProgress'),
  toDo: document.getElementById('statToDo'),
};

const progressBars = {
  total: document.getElementById('progressTotal'),
  completed: document.getElementById('progressCompleted'),
  inProgress: document.getElementById('progressInProgress'),
  toDo: document.getElementById('progressToDo'),
};

const toast = document.getElementById('toast');
const loadingProgressBar = document.getElementById('loadingProgressBar');
const sessionTimerDisplay = document.getElementById('sessionTimer');
const themeToggle = document.getElementById('themeToggle');

let projects = [];
let filteredProjects = [];

// --- Session Handling ---
if (!sessionStorage.getItem('loggedIn') || !loginTime || (Date.now() - loginTime) > MAX_SESSION_DURATION) {
  sessionStorage.clear();
  window.location.href = 'admin.html';
}

// --- Display user role ---
userRoleDisplay.textContent = role;

// --- Logout ---
logoutButton.onclick = () => {
  sessionStorage.clear();
  window.location.href = 'admin.html';
};

// --- Toast Notification ---
function showToast(msg, duration = 3000) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// --- Loading Progress Bar ---
function showLoadingBar() {
  loadingProgressBar.style.width = '30%';
  loadingProgressBar.style.opacity = '1';
  let width = 30;
  const interval = setInterval(() => {
    if (width >= 90) clearInterval(interval);
    else {
      width += Math.random() * 10;
      loadingProgressBar.style.width = `${width}%`;
    }
  }, 300);
  return interval;
}
function hideLoadingBar(interval) {
  clearInterval(interval);
  loadingProgressBar.style.width = '100%';
  setTimeout(() => {
    loadingProgressBar.style.opacity = '0';
    loadingProgressBar.style.width = '0';
  }, 300);
}

// --- Escape HTML (XSS protection) ---
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// --- Fetch projects from API or fallback ---
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwNnz_pJjTiE0o-ZbBi5QFwGkHNVHqLpE_gTfTf_zQDAv2-u43jJPQeyejfme0jTAmr2Q/exec';

async function fetchLocalProjects() {
  try {
    const res = await fetch('projects.json');
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

async function loadProjects() {
  let loadingInterval = showLoadingBar();
  showSkeletons(6);
  noProjectsMessage.classList.add('hidden');
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getProjects`);
    const data = await res.json();
    projects = data.success && Array.isArray(data.data) ? data.data : [];
  } catch {
    projects = await fetchLocalProjects();
  }
  filteredProjects = projects;
  renderProjects(true);
  updateStats();
  checkReminders();
  hideLoadingBar(loadingInterval);
}

// --- Show skeleton loaders ---
function showSkeletons(count = 6) {
  projectsList.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton col-span-1 rounded-lg';
    projectsList.appendChild(skeleton);
  }
}

// --- Filter projects ---
filterStatusSelect.addEventListener('change', () => {
  const filter = filterStatusSelect.value.toLowerCase();
  if (filter === 'all') filteredProjects = projects;
  else filteredProjects = projects.filter(p => p.Status?.toLowerCase() === filter);
  renderProjects(true);
});

// --- Animate count-up for stats ---
function animateCount(el, target) {
  let current = 0;
  const duration = 800;
  const stepTime = Math.max(Math.floor(duration / target), 20);
  clearInterval(el._timer);
  el._timer = setInterval(() => {
    current++;
    el.textContent = current;
    if (current >= target) clearInterval(el._timer);
  }, stepTime);
}

// --- Update stats and progress bars ---
function updateStats() {
  const normalize = status => status?.trim().toLowerCase();
  const total = projects.length;
  const completed = projects.filter(p => normalize(p.Status) === 'completed').length;
  const inProgress = projects.filter(p => normalize(p.Status) === 'in progress').length;
  const toDo = projects.filter(p => normalize(p.Status) === 'to do').length;

  animateCount(stats.total, total);
  animateCount(stats.completed, completed);
  animateCount(stats.inProgress, inProgress);
  animateCount(stats.toDo, toDo);

  const percent = (part, whole) => (whole === 0 ? 0 : (part / whole) * 100);

  progressBars.total.style.width = '100%';
  progressBars.completed.style.width = `${percent(completed, total)}%`;
  progressBars.inProgress.style.width = `${percent(inProgress, total)}%`;
  progressBars.toDo.style.width = `${percent(toDo, total)}%`;
}

// --- Render projects with flip cards ---
function renderProjects(animated = false) {
  projectsList.innerHTML = '';
  if (filteredProjects.length === 0) {
    noProjectsMessage.classList.remove('hidden');
    return;
  }
  noProjectsMessage.classList.add('hidden');

  filteredProjects.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'project-card';

    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';

    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.innerHTML = `
      <h4 class="font-bold text-indigo-300 text-lg">${escapeHtml(p.ProjectName)}</h4>
      <p class="text-gray-300 truncate">${escapeHtml(p.Description)}</p>
      <div class="flex justify-between text-xs mt-3 text-gray-400">
        <span>Due: ${p.DueDate}</span>
        <span>Status: ${p.Status}</span>
      </div>
      <div class="text-xs mt-2 text-gray-400">Order#: ${p.ID}</div>
    `;

    const cardBack = document.createElement('div');
    cardBack.className = 'card-back flex flex-col justify-between';
    cardBack.innerHTML = `
      <div>
        <p><strong>Description:</strong><br>${escapeHtml(p.Description)}</p>
        <p><strong>Status:</strong> ${p.Status}</p>
        <p><strong>Due Date:</strong> ${p.DueDate}</p>
      </div>
      <div class="mt-3 flex justify-end gap-2">
        ${
          role !== 'Viewer'
            ? `<button data-id="${p.ID}" class="edit-btn px-3 py-1 bg-yellow-500 rounded hover:bg-yellow-600 text-gray-900">Edit</button>`
            : ''
        }
        ${
          role === 'Super Admin'
            ? `<button data-id="${p.ID}" class="del-btn px-3 py-1 bg-red-600 rounded hover:bg-red-700 text-white">Delete</button>`
            : ''
        }
      </div>
    `;

    cardInner.appendChild(cardFront);
    cardInner.appendChild(cardBack);
    card.appendChild(cardInner);
    projectsList.appendChild(card);

    if (animated) {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 100);
    }
  });

  // Attach event listeners on buttons
  document.querySelectorAll('.edit-btn').forEach(b => (b.onclick = onEdit));
  document.querySelectorAll('.del-btn').forEach(b => (b.onclick = onDelete));

  attachSwipeListeners();
}

// --- Swipe gesture support for mobile ---
function attachSwipeListeners() {
  const threshold = 50;
  let startX = 0;
  let currentCard = null;

  projectsList.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
      currentCard = card;
      card.style.transition = 'none';
    });
    card.addEventListener('touchmove', e => {
      if (!currentCard) return;
      const touchX = e.touches[0].clientX;
      const deltaX = touchX - startX;
      if (Math.abs(deltaX) > 5) {
        e.preventDefault();
        currentCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX / 15}deg)`;
      }
    });
    card.addEventListener('touchend', e => {
      if (!currentCard) return;
      const endX = e.changedTouches[0].clientX;
      const deltaX = endX - startX;
      currentCard.style.transition = 'transform 0.3s ease';

      if (deltaX > threshold) {
        const editBtn = currentCard.querySelector('.edit-btn');
        if (editBtn) editBtn.click();
        currentCard.style.transform = 'translateX(0)';
      } else if (deltaX < -threshold) {
        const delBtn = currentCard.querySelector('.del-btn');
        if (delBtn) delBtn.click();
        currentCard.style.transform = 'translateX(0)';
      } else {
        currentCard.style.transform = 'translateX(0)';
      }
      currentCard = null;
    });
  });
}

// --- Check and display reminders ---
function checkReminders() {
  const today = new Date().toISOString().split('T')[0];
  const normalize = status => status?.trim().toLowerCase();
  const upcoming = projects.filter(p => p.DueDate > today && normalize(p.Status) !== 'completed');
  const overdue = projects.filter(p => p.DueDate < today && normalize(p.Status) !== 'completed');

  notificationBox.innerHTML = '';
  if (upcoming.length) {
    notificationBox.innerHTML += `⚠️ ${upcoming.length} project(s) due soon.<br>`;
  }
  if (overdue.length) {
    notificationBox.innerHTML += `❗ ${overdue.length} project(s) overdue!`;
  }
}

// --- Edit Modal Setup ---
const editOverlay = document.createElement('div');
editOverlay.className = 'modal-overlay fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 hidden';
editOverlay.style.zIndex = 9999;
editOverlay.innerHTML = `
  <div class="modal-content bg-gray-900 rounded-lg p-6 max-w-md w-full text-left">
    <h3 class="text-blue-400 text-xl mb-4">Edit Project</h3>
    <form id="editProjectForm" class="space-y-4">
      <input type="hidden" id="editProjectId" />
      <div>
        <label class="block mb-1 font-semibold">Project Name</label>
        <input id="editProjectName" required class="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded" />
      </div>
      <div>
        <label class="block mb-1 font-semibold">Due Date</label>
        <input id="editDueDate" type="date" required class="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded" />
      </div>
      <div>
        <label class="block mb-1 font-semibold">Description</label>
        <textarea id="editProjectDescription" required class="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded"></textarea>
      </div>
      <div>
        <label class="block mb-1 font-semibold">Status</label>
        <select id="editProjectStatus" class="w-full px-3 py-2 bg-gray-800 text-gray-100 rounded">
          <option>To Do</option>
          <option>In Progress</option>
          <option>Completed</option>
          <option>On Hold</option>
        </select>
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" id="cancelEditButton" class="px-4 py-2 bg-gray-600 text-white rounded">Cancel</button>
        <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
      </div>
    </form>
  </div>
`;
document.body.appendChild(editOverlay);

const editForm = document.getElementById('editProjectForm');
const fID = document.getElementById('editProjectId');
const fName = document.getElementById('editProjectName');
const fDate = document.getElementById('editDueDate');
const fDesc = document.getElementById('editProjectDescription');
const fStatus = document.getElementById('editProjectStatus');
const cancelEditButton = document.getElementById('cancelEditButton');

function showEditModal(project) {
  fID.value = project.ID;
  fName.value = project.ProjectName;
  fDate.value = project.DueDate;
  fDesc.value = project.Description;
  fStatus.value = project.Status;
  editOverlay.classList.remove('hidden');
}

function hideEditModal() {
  editOverlay.classList.add('hidden');
  editForm.classList.remove('shake');
}

cancelEditButton.onclick = () => hideEditModal();

// --- Edit form submit ---
editForm.onsubmit = async e => {
  e.preventDefault();
  if (!fName.value.trim() || !fDate.value || !fDesc.value.trim()) {
    editForm.classList.add('shake');
    showToast('Please fill out all fields.', 2500);
    return;
  }

  const updated = {
    ID: fID.value,
    ProjectName: fName.value.trim(),
    DueDate: fDate.value,
    Description: fDesc.value.trim(),
    Status: fStatus.value,
  };

  try {
    const loadingInt = showLoadingBar();
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', project: updated }),
    });
    const r = await res.json();
    showToast(r.success ? 'Project updated successfully!' : 'Error updating project.', 3500);
    hideLoadingBar(loadingInt);
  } catch {
    const idx = projects.findIndex(p => p.ID === updated.ID);
    if (idx >= 0) projects[idx] = updated;
    showToast('Saved locally (offline fallback).', 3500);
  }
  hideEditModal();
  loadProjects();
};

// --- Edit button handler ---
function onEdit(evt) {
  const id = evt.currentTarget.dataset.id;
  const project = projects.find(p => p.ID == id);
  if (!project) {
    showToast('Project not found.');
    return;
  }
  showEditModal(project);
}

// --- Delete button handler ---
async function onDelete(evt) {
  const id = evt.currentTarget.dataset.id;
  if (!confirm('Are you sure you want to delete this project?')) return;

  try {
    const loadingInt = showLoadingBar();
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', project: { ID: id } }),
    });
    const r = await res.json();
    showToast(r.success ? 'Project deleted.' : 'Error deleting project.', 3500);
    hideLoadingBar(loadingInt);
  } catch {
    projects = projects.filter(p => p.ID !== id);
    showToast('Deleted locally (offline fallback).', 3500);
  }
  loadProjects();
}

// --- Session countdown timer ---
function updateSessionCountdown() {
  const remaining = MAX_SESSION_DURATION - (Date.now() - loginTime);
  if (remaining <= 0) {
    sessionStorage.clear();
    window.location.href = 'admin.html';
    return;
  }
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  sessionTimerDisplay.textContent = `Session expires in ${minutes}:${seconds.toString().padStart(2, '0')}`;
}
setInterval(updateSessionCountdown, 1000);
updateSessionCountdown();

// --- Dark/Light Mode Toggle ---
themeToggle.addEventListener('click', () => {
  const body = document.body;
  if (body.classList.contains('dark')) {
    body.classList.remove('dark');
    sessionStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark');
    sessionStorage.setItem('theme', 'dark');
  }
});
(function applySavedTheme() {
  const saved = sessionStorage.getItem('theme');
  if (saved === 'dark') document.body.classList.add('dark');
  else document.body.classList.remove('dark');
})();

// --- Initialization ---
loadProjects();
