// --- Session Handling ---
const MAX_SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
const loginTime = sessionStorage.getItem('loginTime');
const role = sessionStorage.getItem('userRole') || 'Viewer';

if (!sessionStorage.getItem('loggedIn') || !loginTime || (Date.now() - loginTime) > MAX_SESSION_DURATION) {
  sessionStorage.clear();
  window.location.href = 'admin.html';
}

// --- Session Countdown Timer ---
const sessionTimerDisplay = document.getElementById('sessionTimer');
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

// --- DOM Elements ---
const logoutButton = document.getElementById('logoutButton');
const projectsList = document.getElementById('projectsList');
const noProjectsMessage = document.getElementById('noProjectsMessage');
const stats = {
  total: document.getElementById('statTotal'),
  completed: document.getElementById('statCompleted'),
  inProgress: document.getElementById('statInProgress'),
  toDo: document.getElementById('statToDo')
};
const userRoleDisplay = document.getElementById('userRole');
const notificationBox = document.getElementById('notifications');

// --- Modals ---
const modOverlay = document.getElementById('messageModalOverlay');
const mTitle = document.getElementById('modalTitle');
const mMsg = document.getElementById('modalMessage');
const mClose = document.getElementById('modalCloseButton');

const editOverlay = document.getElementById('editProjectModalOverlay');
const editForm = document.getElementById('editProjectForm');
const fID = document.getElementById('editProjectId');
const fName = document.getElementById('editProjectName');
const fDate = document.getElementById('editDueDate');
const fDesc = document.getElementById('editProjectDescription');
const fStatus = document.getElementById('editProjectStatus');
const cancelEditButton = document.getElementById('cancelEditButton');

// --- Role Display ---
userRoleDisplay.textContent = role;


// --- Logout ---
logoutButton.onclick = () => {
  sessionStorage.clear();
  window.location.href = 'admin.html';
};

// --- Show Modal Message ---
function showMsg(title, msg) {
  mTitle.textContent = title;
  mMsg.textContent = msg;
  modOverlay.classList.add('show');
  mClose.focus();
}
mClose.onclick = () => modOverlay.classList.remove('show');

// --- Load Projects ---
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwNnz_pJjTiE0o-ZbBi5QFwGkHNVHqLpE_gTfTf_zQDAv2-u43jJPQeyejfme0jTAmr2Q/exec';
let projects = [];

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
  projectsList.innerHTML = '';
  noProjectsMessage.style.display = 'block';
  try {
    const res = await fetch(`${APPS_SCRIPT_URL}?action=getProjects`);
    const data = await res.json();
    projects = (data.success && data.data.length) ? data.data : [];
  } catch {
    projects = await fetchLocalProjects();
  }
  render();
  updateStats();
  checkReminders();
}

// --- Render Projects ---
function render() {
  projectsList.innerHTML = '';
  if (!projects.length) {
    noProjectsMessage.style.display = 'block';
    return;
  }
  noProjectsMessage.style.display = 'none';

  projects.forEach(p => {
    const card = document.createElement('div');
    card.className = 'bg-gray-700 p-4 rounded shadow';
    card.innerHTML = `
      <h4 class="font-bold text-indigo-200">${p.ProjectName}</h4>
      <p class="text-sm">${p.Description}</p>
      <p class="text-xs">Due: ${p.DueDate}</p>
      <p class="text-xs">Status: ${p.Status}</p>
      <p class="text-xs">Order#: ${p.ID}</p>
      <div class="mt-2 flex justify-end gap-2">
        ${role !== 'Viewer' ? `<button data-id="${p.ID}" class="edit-btn px-2 py-1 bg-yellow-500 rounded">Edit</button>` : ''}
        ${role === 'Super Admin' ? `<button data-id="${p.ID}" class="del-btn px-2 py-1 bg-red-600 rounded">Delete</button>` : ''}
      </div>
    `;
    projectsList.appendChild(card);
  });

  document.querySelectorAll('.edit-btn').forEach(b => b.onclick = onEdit);
  document.querySelectorAll('.del-btn').forEach(b => b.onclick = onDelete);
}

// --- Project Statistics (fixed with normalization) ---
function updateStats() {
  const normalize = status => status?.trim().toLowerCase();
  stats.total.textContent = projects.length;
  stats.completed.textContent = projects.filter(p => normalize(p.Status) === 'completed').length;
  stats.inProgress.textContent = projects.filter(p => normalize(p.Status) === 'in progress').length;
  stats.toDo.textContent = projects.filter(p => normalize(p.Status) === 'to do').length;
}

// --- Notifications for Upcoming / Overdue ---
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

// --- Edit Project ---
function onEdit(evt) {
  const id = evt.currentTarget.dataset.id;
  const p = projects.find(x => x.ID == id);
  if (!p) return showMsg('Error','Project not found');
  fID.value = p.ID;
  fName.value = p.ProjectName;
  fDate.value = p.DueDate;
  fDesc.value = p.Description;
  fStatus.value = p.Status;
  editOverlay.classList.add('show');
}
cancelEditButton.onclick = () => editOverlay.classList.remove('show');

editForm.onsubmit = async e => {
  e.preventDefault();
  const updated = {
    ID: fID.value,
    ProjectName: fName.value.trim(),
    DueDate: fDate.value,
    Description: fDesc.value.trim(),
    Status: fStatus.value
  };
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({action:'update', project:updated})
    });
    const r = await res.json();
    showMsg(r.success ? 'Success' : 'Error', r.message);
  } catch {
    const idx = projects.findIndex(p => p.ID === updated.ID);
    if (idx >= 0) projects[idx] = updated;
    showMsg('Updated', 'Saved locally (offline fallback)');
  }
  editOverlay.classList.remove('show');
  loadProjects();
};

// --- Delete Project ---
async function onDelete(evt) {
  const id = evt.currentTarget.dataset.id;
  if (!confirm('Delete this project?')) return;
  try {
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({action:'delete', project:{ID:id}})
    });
    const r = await res.json();
    showMsg(r.success ? 'Deleted' : 'Error', r.message);
  } catch {
    projects = projects.filter(p => p.ID !== id);
    showMsg('Deleted', 'Deleted locally fallback');
  }
  loadProjects();
}

// --- Init ---
loadProjects();
