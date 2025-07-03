document.addEventListener('DOMContentLoaded', () => {
  // Element references
  const logoutButton = document.getElementById('logoutButton');
  const tabAllProjects = document.getElementById('tabAllProjects');
  const tabInProgress = document.getElementById('tabInProgress');

  const allProjectsSection = document.getElementById('allProjectsSection');
  const inProgressProjectsSection = document.getElementById('inProgressProjectsSection');

  const projectsList = document.getElementById('projectsList');
  const noProjectsMessage = document.getElementById('noProjectsMessage');

  const inProgressProjectsList = document.getElementById('inProgressProjectsList');
  const noInProgressMessage = document.getElementById('noInProgressMessage');

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

  let projectsData = [];

  // Helper: Show message modal
  function showMessageModal(title, message, callback = null) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    messageModalOverlay.classList.add('show');
    modalCloseButton.focus();
    modalCloseButton.onclick = () => {
      messageModalOverlay.classList.remove('show');
      if (callback) callback();
    };
  }

  // Load projects from JSON file
  async function loadProjects() {
    try {
      const response = await fetch('projects.json');
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      const data = await response.json();
      projectsData = data.projects || [];
      renderProjects();
    } catch (error) {
      console.error('Failed to load projects:', error);
      showMessageModal('Error', 'Failed to load projects data.');
      projectsData = [];
      renderProjects();
    }
  }

  // Render projects to given container
  function renderProjects() {
    // Render All Projects
    if (projectsData.length === 0) {
      noProjectsMessage.style.display = 'block';
      projectsList.innerHTML = '';
    } else {
      noProjectsMessage.style.display = 'none';
      projectsList.innerHTML = '';
      projectsData.forEach(project => {
        const card = createProjectCard(project);
        projectsList.appendChild(card);
      });
    }

    // Render In Progress Projects
    const inProgressProjects = projectsData.filter(p => p.Status === 'In Progress');
    if (inProgressProjects.length === 0) {
      noInProgressMessage.style.display = 'block';
      inProgressProjectsList.innerHTML = '';
    } else {
      noInProgressMessage.style.display = 'none';
      inProgressProjectsList.innerHTML = '';
      inProgressProjects.forEach(project => {
        const card = createProjectCard(project);
        inProgressProjectsList.appendChild(card);
      });
    }

    // Add event listeners for Edit buttons dynamically
    document.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', openEditModal);
    });
  }

  // Create project card element
  function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'bg-gray-700 rounded-lg p-4 shadow-md border border-gray-600';

    card.innerHTML = `
      <h4 class="text-xl font-semibold mb-2 text-indigo-200">${project.ProjectName}</h4>
      <p class="text-gray-300 text-sm mb-2">${project.Description}</p>
      <p class="text-gray-400 text-xs mb-1">Due: <span class="font-medium">${project.DueDate}</span></p>
      <p class="text-gray-400 text-xs mb-1">Status: <span class="font-medium text-blue-300">${project.Status}</span></p>
      <p class="text-gray-400 text-xs mb-3">Order Number: <span class="font-medium">${project.ID}</span></p>
      <p class="text-gray-400 text-xs mb-3">Payment Method: <span class="font-medium">${project.PaymentMethod || 'N/A'}</span></p>
      <p class="text-gray-400 text-xs mb-3">Customer: <span class="font-medium">${project.CustomerName || 'N/A'}</span></p>
      <p class="text-gray-400 text-xs mb-3">Customer Details: <span class="font-medium">${project.CustomerDetails || 'N/A'}</span></p>
      <div class="flex justify-end">
        <button class="edit-btn px-3 py-1 bg-blue-600 rounded text-white hover:bg-blue-700" data-id="${project.ID}">Edit</button>
      </div>
    `;
    return card;
  }

  // Handle tab switching
  function switchTab(tabName) {
    if (tabName === 'all') {
      allProjectsSection.classList.add('active');
      tabAllProjects.classList.add('bg-blue-500');
      tabAllProjects.classList.remove('bg-gray-700');
      tabAllProjects.setAttribute('aria-selected', 'true');

      inProgressProjectsSection.classList.remove('active');
      tabInProgress.classList.remove('bg-yellow-600');
      tabInProgress.classList.add('bg-gray-700');
      tabInProgress.setAttribute('aria-selected', 'false');
    } else {
      allProjectsSection.classList.remove('active');
      tabAllProjects.classList.remove('bg-blue-500');
      tabAllProjects.classList.add('bg-gray-700');
      tabAllProjects.setAttribute('aria-selected', 'false');

      inProgressProjectsSection.classList.add('active');
      tabInProgress.classList.add('bg-yellow-600');
      tabInProgress.classList.remove('bg-gray-700');
      tabInProgress.setAttribute('aria-selected', 'true');
    }
  }

  // Open edit modal and populate form
  function openEditModal(event) {
    const projectId = event.target.getAttribute('data-id');
    const project = projectsData.find(p => p.ID === projectId);
    if (!project) {
      showMessageModal('Error', 'Project not found!');
      return;
    }
    editProjectId.value = project.ID;
    editProjectName.value = project.ProjectName;
    editDueDate.value = project.DueDate;
    editProjectDescription.value = project.Description;
    editProjectStatus.value = project.Status;
    editProjectModalOverlay.classList.add('show');
    editProjectName.focus();
  }

  // Close edit modal
  function closeEditModal() {
    editProjectModalOverlay.classList.remove('show');
    editProjectForm.reset();
  }

  // Save changes from edit modal
  function saveProjectChanges(event) {
    event.preventDefault();
    const id = editProjectId.value;
    const projectIndex = projectsData.findIndex(p => p.ID === id);
    if (projectIndex === -1) {
      showMessageModal('Error', 'Project not found for saving!');
      closeEditModal();
      return;
    }

    // Update project data
    projectsData[projectIndex].ProjectName = editProjectName.value.trim();
    projectsData[projectIndex].DueDate = editDueDate.value;
    projectsData[projectIndex].Description = editProjectDescription.value.trim();
    projectsData[projectIndex].Status = editProjectStatus.value;

    renderProjects();
    showMessageModal('Success', 'Project updated successfully!');
    closeEditModal();
  }

  // Logout logic
  function logout() {
    // For demo: clear localStorage/sessionStorage or redirect
    // Example redirect to login page
    // window.location.href = 'login.html';

    // Or clear localStorage/sessionStorage tokens
    localStorage.clear();
    sessionStorage.clear();

    // Show logout confirmation and redirect (simulate)
    showMessageModal('Logged Out', 'You have been logged out.', () => {
      // Redirect after modal close
      window.location.href = 'admin.html'; // Change to your actual login page
    });
  }

  // Event listeners
  logoutButton.addEventListener('click', logout);
  tabAllProjects.addEventListener('click', () => switchTab('all'));
  tabInProgress.addEventListener('click', () => switchTab('inprogress'));

  modalCloseButton.addEventListener('click', () => {
    messageModalOverlay.classList.remove('show');
  });

  cancelEditButton.addEventListener('click', closeEditModal);
  editProjectForm.addEventListener('submit', saveProjectChanges);

  // Initialize default tab
  switchTab('all');

  // Load projects on start
  loadProjects();
});
