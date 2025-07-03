document.addEventListener('DOMContentLoaded', () => {
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwNnz_pJjTiE0o-ZbBi5QFwGkHNVHqLpE_gTfTf_zQDAv2-u43jJPQeyejfme0jTAmr2Q/exec';
  const logoutButton = document.getElementById('logoutButton');
  const projectsList = document.getElementById('projectsList');
  const noProjectsMessage = document.getElementById('noProjectsMessage');
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

  let projects = [];

  function showMsg(t, m) {
    mTitle.textContent = t;
    mMsg.textContent = m;
    modOverlay.classList.add('show');
    mClose.focus();
  }
  mClose.onclick = () => modOverlay.classList.remove('show');

  logoutButton.onclick = () => {
    sessionStorage.removeItem('loggedIn');
    window.location.href = 'admin.html';
  };

  async function fetchJSON() {
    const res = await fetch('projects.json');
    if (!res.ok) throw new Error('JSON load failed');
    return res.json();
  }

  async function loadProjects() {
    projectsList.innerHTML = '';
    noProjectsMessage.style.display = 'block';
    // Try backend
    try {
      const res = await fetch(APPS_SCRIPT_URL + '?action=getProjects');
      const data = await res.json();
      projects = (data.success && data.data.length) ? data.data : [];
    } catch {
      try { projects = await fetchJSON(); }
      catch { projects = []; }
    }
    render();
  }

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
      card.innerHTML = `<h4 class="font-bold text-indigo-200">${p.ProjectName}</h4>
        <p class="text-sm">${p.Description}</p>
        <p class="text-xs">Due: ${p.DueDate}</p>
        <p class="text-xs">Status: ${p.Status}</p>
        <p class="text-xs">Order#: ${p.ID}</p>
        <div class="mt-2 flex justify-end gap-2">
          <button data-id="${p.ID}" class="edit-btn px-2 py-1 bg-yellow-500 rounded">Edit</button>
          <button data-id="${p.ID}" class="del-btn px-2 py-1 bg-red-600 rounded">Delete</button>
        </div>`;
      projectsList.appendChild(card);
    });
    document.querySelectorAll('.edit-btn').forEach(b => b.onclick = onEdit);
    document.querySelectorAll('.del-btn').forEach(b => b.onclick = onDelete);
  }

  async function onDelete(evt) {
    const id = evt.currentTarget.dataset.id;
    if (!confirm('Delete this project?')) return;
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({action:'delete', project:{ID:id}})
      });
      const r = await res.json();
      if (r.success) showMsg('Deleted', r.message);
      else showMsg('Error', r.message);
    } catch {
      projects = projects.filter(p => p.ID != id);
      showMsg('Deleted', 'Deleted locally fallback');
    }
    loadProjects();
  }

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

  editForm.onsubmit = async e => {
    e.preventDefault();
    const u = {
      ID: fID.value,
      ProjectName: fName.value.trim(),
      DueDate: fDate.value,
      Description: fDesc.value.trim(),
      Status: fStatus.value
    };
    try {
      const res = await fetch(APPS_SCRIPT_URL, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({action:'update', project:u})
      });
      const r = await res.json();
      showMsg(r.success?'Success':'Error', r.message);
    } catch {
      const idx = projects.findIndex(x=>x.ID==u.ID);
      if(idx>=0) projects[idx] = u;
      showMsg('Updated', 'Saved locally fallback');
    }
    editOverlay.classList.remove('show');
    loadProjects();
  };

  document.getElementById('cancelEditButton').onclick = () => {
    editOverlay.classList.remove('show');
  };

  loadProjects();
});
