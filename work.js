// work.js

document.addEventListener('DOMContentLoaded', () => {
  const logoutButton = document.getElementById('logoutButton');
  const projectsList = document.getElementById('projectsList');
  const noProjectsMessage = document.getElementById('noProjectsMessage');

  const messageModalOverlay = document.getElementById('messageModalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalCloseButton = document.getElementById('modalCloseButton');

  const editProjectModalOverlay = document.getElementById('editProjectModalOverlay');
  const editProjectForm = document.getElementById('editProjectForm');
  const editProjectId = document.getElementById('editProjectId');
  const editProjectName = document.getElementById('editProjectName');
  const editDueDate = document.getElementById('editDueDate');
  const editProjectDescription = document.getElementById('editProjectDescription');
  const editProjectStatus = document.getElementById('editProjectStatus');
  const cancelEditButton = document.getElementById('cancelEditButton');

  const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwNnz_pJjTiE0o-ZbBi5QFwGkHNVHqLpE_gTfTf_zQDAv2-u43jJPQeyejfme0jTAmr2Q/exec';

  // Show modal message
  function showMessage(title, message) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    messageModalOverlay.classList.add('show');
  }

  modalCloseButton.addEventListener('click', () => {
    messageModalOverlay.classList.remove('show');
  });

  // Logout functionality
  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('loggedIn');
    localStorage.removeItem('rememberedUser');
    window.location.href = 'admin.html';
  });

  // Load and render projects
  async function loadProjects() {
    try {
      const response = await fetch(APPS_SCRIPT_WEB_APP_URL + '?action=getProjects');
      const result = await response.json();

      if (result.success) {
        renderProjects(result.data);
      } else {
        showMessage('Error', result.message);
      }
    } catch (error) {
      console.error(error);
      showMessage('Error', 'Could not load projects.');
    }
  }

  function renderProjects(projects) {
    projectsList.innerHTML = '';

    if (!projects.length) {
      noProjectsMessage.style.display = 'block';
      return;
    }
    noProjectsMessage.style.display = 'none';

    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'bg-gray-700 rounded-lg p-4 shadow-md border border-gray-600';
      card.innerHTML = `
        <h4 class="text-xl font-semibold mb-2 text-indigo-200">${project.ProjectName}</h4>
        <p class="text-gray-300 text-sm mb-2">${project.Description}</p>
        <p class="text-gray-400 text-xs">Due: <span class="font-medium">${project.DueDate}</span></p>
        <p class="text-gray-400 text-xs">Status: <span class="font-medium text-blue-300">${project.Status}</span></p>
        <p class="text-gray-400 text-xs">Payment Method: <span class="font-medium">${project.PaymentMethod || 'N/A'}</span></p>
        <p class="text-gray-400 text-xs">Customer: <span class="font-medium">${project.CustomerName || 'N/A'} (${project.CustomerDetails || ''})</span></p>
        <div class="mt-4 flex justify-end gap-2">
          <button class="edit-btn px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-lg" data-id="${project.ID}">Edit</button>
          <button class="delete-btn px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg" data-id="${project.ID}">Delete</button>
        </div>
      `;
      projectsList.appendChild(card);
    });

    // Attach edit and delete events
    document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEdit));
    document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDelete));
  }

  // Handle editing
  function handleEdit(event) {
    const projectId = event.target.dataset.id;
    fetch(APPS_SCRIPT_WEB_APP_URL + '?action=getProjects')
      .then(res => res.json())
      .then(data => {
        const project = data.data.find(p => p.ID == projectId);
        if (project) {
          editProjectId.value = project.ID;
          editProjectName.value = project.ProjectName;
          editDueDate.value = project.DueDate;
          editProjectDescription.value = project.Description;
          editProjectStatus.value = project.Status;
          editProjectModalOverlay.classList.add('show');
        }
      });
  }

  // Handle save edit
  editProjectForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const updated = {
      id: editProjectId.value,
      ProjectName: editProjectName.value,
      DueDate: editDueDate.value,
      Description: editProjectDescription.value,
      Status: editProjectStatus.value
    };

    const response = await fetch(APPS_SCRIPT_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', project: updated })
    });
    const result = await response.json();
    if (result.success) {
      editProjectModalOverlay.classList.remove('show');
      loadProjects();
    } else {
      showMessage('Error', result.message);
    }
  });

  cancelEditButton.addEventListener('click', () => {
    editProjectModalOverlay.classList.remove('show');
  });

  // Handle delete
  async function handleDelete(event) {
    const projectId = event.target.dataset.id;
    if (!confirm('Are you sure you want to delete this project?')) return;

    const response = await fetch(APPS_SCRIPT_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', project: { id: projectId } })
    });

    const result = await response.json();
    if (result.success) {
      loadProjects();
    } else {
      showMessage('Error', result.message);
    }
  }

  loadProjects();
});