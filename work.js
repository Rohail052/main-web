document.addEventListener('DOMContentLoaded', () => {
  // --- Element references ---
  const logoutButton = document.getElementById('logoutButton');
  const tabAllProjects = document.getElementById('tabAllProjects');
  const tabInProgress = document.getElementById('tabInProgress');
  const myProjectsSection = document.getElementById('myProjectsSection');
  const inProgressProjectsSection = document.getElementById('inProgressProjectsSection');
  const projectsList = document.getElementById('projectsList');
  const inProgressProjectsList = document.getElementById('inProgressProjectsList');
  const noProjectsMessage = document.getElementById('noProjectsMessage');
  const noInProgressMessage = document.getElementById('noInProgressMessage');

  // Edit Project Modal Elements
  const editProjectModalOverlay = document.getElementById('editProjectModalOverlay');
  const editProjectForm = document.getElementById('editProjectForm');
  const editProjectId = document.getElementById('editProjectId');
  const editProjectName = document.getElementById('editProjectName');
  const editDueDate = document.getElementById('editDueDate');
  const editProjectDescription = document.getElementById('editProjectDescription');
  const editProjectStatus = document.getElementById('editProjectStatus');
  const cancelEditButton = document.getElementById('cancelEditButton');

  // Message Modal Elements
  const messageModalOverlay = document.getElementById('messageModalOverlay');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalCloseButton = document.getElementById('modalCloseButton');

  // Constants
  const PROJECTS_JSON_PATH = 'projects.json'; // Your JSON file path

  // Utility: Show message modal
  function showMessageModal(title, message, callback = null) {
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    messageModalOverlay.classList.add('show');
    modalCloseButton.onclick = () => {
      messageModalOverlay.classList.remove('show');
      if (callback) callback();
    };
  }

  // Check if logged in
  function checkLoginStatus() {
    if (!sessionStorage.getItem('loggedIn')) {
      window.location.href = 'admin.html';
    }
  }

  // Fetch projects from JSON file
  async function loadProjects() {
    try {
      const response = await fetch(PROJECTS_JSON_PATH + '?t=' + Date.now()); // prevent cache
      if (!response.ok) throw new Error('Failed to load projects JSON');
      const data = await response.json();
      return data.projects || [];
    } catch (error) {
      console.error('Error loading projects:', error);
      showMessageModal('Error', 'Failed to load projects. See console for details.');
      return [];
    }
  }

  // Save projects back to localStorage as fallback (optional)
  function saveProjectsToLocalStorage(projects) {
    localStorage.setItem('adminProjectsBackup', JSON.stringify(projects));
  }

  // Load projects from localStorage backup (optional fallback)
  function loadProjectsFromLocalStorage() {
    const data = localStorage.getItem('adminProjectsBackup');
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  // Render projects list (All Projects tab)
  function renderAllProjects(projects) {
    projectsList.innerHTML = '';
    if (projects.length === 0) {
      noProjectsMessage.style.display = 'block';
    } else {
      noProjectsMessage.style.display = 'none';
      projects.forEach(p => {
        const card = createProjectCard(p);
        projectsList.appendChild(card);
      });
    }
  }

  // Render In Progress projects only
  function renderInProgressProjects(projects) {
    inProgressProjectsList.innerHTML = '';
    const inProgressProjects = projects.filter(p => p.Status === 'In Progress');
    if (inProgressProjects.length === 0) {
      noInProgressMessage.style.display = 'block';
    } else {
      noInProgressMessage.style.display = 'none';
      inProgressProjects.forEach(p => {
        const card = createProjectCard(p);
        inProgressProjectsList.appendChild(card);
      });
    }
  }

  // Create project card element
  function createProjectCard(project) {
    const projectCard = document.createElement('div');
    projectCard.className = 'bg-gray-700 rounded-lg p-4 shadow-md border border-gray-600';
    projectCard.dataset.id = project.id;

    projectCard.innerHTML = `
      <h4 class="text-xl font-semibold mb-2 text-indigo-200">${project.ProjectName}</h4>
      <p class="text-gray-300 text-sm mb-2">${project.Description}</p>
      <p class="text-gray-400 text-xs">Due: <span class="font-medium">${project.DueDate}</span></p>
      <p class="text-gray-400 text-xs">Status: <span class="font-medium text-blue-300">${project.Status}</span></p>
      <p class="text-gray-300 text-xs mt-2"><strong>Payment Method:</strong> ${project.PaymentMethod}</p>
      <p class="text-gray-300 text-xs"><strong>Customer Name:</strong> ${project.CustomerName}</p>
      <p class="text-gray-300 text-xs"><strong>Customer Details:</strong> ${project.CustomerDetails}</p>
      <div class="mt-4 flex justify-end gap-2">
        <button class="edit-btn px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-lg transition duration-300" data-id="${project.id}">Edit</button>
        <button class="delete-btn px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition duration-300" data-id="${project.id}">Delete</button>
      </div>
    `;

    return projectCard;
  }

  // Open edit modal and fill data
  function openEditModal(project) {
    editProjectId.value = project.id;
    editProjectName.value = project.ProjectName;
    editDueDate.value = project.DueDate;
    editProjectDescription.value = project.Description;
    editProjectStatus.value = project.Status;
    editProjectModalOverlay.classList.add('show');
  }

  // Close edit modal and clear form
  function closeEditModal() {
    editProjectModalOverlay.classList.remove('show');
    editProjectForm.reset();
  }

  // Get all projects, render based on selected tab
  async function refreshProjects() {
    let projects = await loadProjects();
    // If failed to load JSON, fallback to localStorage backup
    if (projects.length === 0) {
      projects = loadProjectsFromLocalStorage();
    }
    saveProjectsToLocalStorage(projects);

    if (tabAllProjects.classList.contains('active')) {
      renderAllProjects(projects);
      myProjectsSection.classList.add('show');
      inProgressProjectsSection.classList.remove('show');
    } else {
      renderInProgressProjects(projects);
      myProjectsSection.classList.remove('show');
      inProgressProjectsSection.classList.add('show');
    }

    // Attach event listeners for edit and delete buttons
    attachProjectButtonsListeners();
  }

  // Attach listeners for Edit/Delete buttons
  function attachProjectButtonsListeners() {
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        let projects = await loadProjects();
        if (projects.length === 0) projects = loadProjectsFromLocalStorage();
        const project = projects.find(p => p.id == id);
        if (project) openEditModal(project);
        else showMessageModal('Error', 'Project not found');
      };
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.onclick = async () => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        const id = btn.dataset.id;
        let projects = await loadProjects();
        if (projects.length === 0) projects = loadProjectsFromLocalStorage();

        const filtered = projects.filter(p => p.id != id);
        saveProjectsToLocalStorage(filtered);

        showMessageModal('Success', 'Project deleted successfully');
        refreshProjects();
      };
    });
  }

  // Edit project form submission handler
  editProjectForm.addEventListener('submit', async e => {
    e.preventDefault();

    const id = editProjectId.value;
    const updatedProject = {
      id,
      ProjectName: editProjectName.value.trim(),
      DueDate: editDueDate.value,
      Description: editProjectDescription.value.trim(),
      Status: editProjectStatus.value,
      PaymentMethod: '', // Keep empty or add UI for editing if you want
      CustomerName: '',
      CustomerDetails: ''
    };

    if (!updatedProject.ProjectName || !updatedProject.DueDate || !updatedProject.Description || !updatedProject.Status) {
      showMessageModal('Error', 'Please fill all fields');
      return;
    }

    let projects = await loadProjects();
    if (projects.length === 0) projects = loadProjectsFromLocalStorage();

    const index = projects.findIndex(p => p.id == id);
    if (index === -1) {
      showMessageModal('Error', 'Project not found');
      return;
    }

    // Preserve existing Payment/Customer info if exists
    updatedProject.PaymentMethod = projects[index].PaymentMethod || '';
    updatedProject.CustomerName = projects[index].CustomerName || '';
    updatedProject.CustomerDetails = projects[index].CustomerDetails || '';

    projects[index] = updatedProject;
    saveProjectsToLocalStorage(projects);

    showMessageModal('Success', 'Project updated successfully', () => {
      closeEditModal();
      refreshProjects();
    });
  });

  // Cancel edit button handler
  cancelEditButton.addEventListener('click', () => {
    closeEditModal();
  });

  // Tabs click handlers
  tabAllProjects.addEventListener('click', () => {
    tabAllProjects.classList.add('active');
    tabInProgress.classList.remove('active');
    refreshProjects();
  });

  tabInProgress.addEventListener('click', () => {
    tabInProgress.classList.add('active');
    tabAllProjects.classList.remove('active');
    refreshProjects();
  });

  // Logout button handler
  logoutButton.addEventListener('click', () => {
    sessionStorage.removeItem('loggedIn');
    localStorage.removeItem('rememberedUser');
    window.location.href = 'admin.html';
  });

  // Initial setup
  checkLoginStatus();
  // Activate All Projects tab by default
  tabAllProjects.classList.add('active');
  refreshProjects();
});
