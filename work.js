document.addEventListener('DOMContentLoaded', () => {
    // --- Element References ---
    const logoutButton = document.getElementById('logoutButton');
    const viewProjectsButton = document.getElementById('viewProjectsButton');
    const myProjectsSection = document.getElementById('myProjectsSection');
    const projectForm = document.getElementById('projectForm');
    const projectsList = document.getElementById('projectsList');
    const noProjectsMessage = document.getElementById('noProjectsMessage');

    // Message Modal Elements
    const messageModalOverlay = document.getElementById('messageModalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalCloseButton = document.getElementById('modalCloseButton');

    // Edit Project Modal Elements
    const editProjectModalOverlay = document.getElementById('editProjectModalOverlay');
    const editProjectForm = document.getElementById('editProjectForm');
    const editProjectId = document.getElementById('editProjectId');
    const editProjectName = document.getElementById('editProjectName');
    const editDueDate = document.getElementById('editDueDate');
    const editProjectDescription = document.getElementById('editProjectDescription');
    const editProjectStatus = document.getElementById('editProjectStatus');
    const cancelEditButton = document.getElementById('cancelEditButton');

    // --- Google Apps Script Web App URL ---
    // IMPORTANT: REPLACE THIS WITH YOUR ACTUAL DEPLOYED GOOGLE APPS SCRIPT WEB APP URL!
    const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwcktkPlpJKmzptLM6dPlyGsFmjDRAyOnUY_fHgRFGejD_WvY2dbkOhxhXBRlRoiu0R/exec'; // <--- Check this line carefully!

    // --- Helper Functions ---

    // Function to display a custom message modal
    function showMessageModal(title, message, callback = null) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        messageModalOverlay.classList.add('show');
        modalCloseButton.onclick = () => {
            hideMessageModal();
            if (callback) callback();
        };
    }

    // Function to hide the custom message modal
    function hideMessageModal() {
        messageModalOverlay.classList.remove('show');
    }

    // Function to check login status and redirect if not logged in
    function checkLoginStatus() {
        const isLoggedIn = sessionStorage.getItem('loggedIn');
        if (!isLoggedIn) {
            console.warn('Not logged in. Redirecting to login page.');
            window.location.href = 'admin.html';
        }
    }

    // --- Google Sheets Interaction Functions (via Apps Script) ---

    // Function to load projects from Google Sheet via Apps Script
    async function loadProjects() {
        try {
            if (APPS_SCRIPT_WEB_APP_URL === 'YOUR_DEPLOYED_APPS_SCRIPT_WEB_APP_URL_HERE') {
                console.warn("Apps Script URL not set. Cannot fetch projects from Google Sheet.");
                // Fallback to localStorage if URL not set for development/testing
                const projectsJSON = localStorage.getItem('adminProjects');
                return projectsJSON ? JSON.parse(projectsJSON) : [];
            }

            const response = await fetch(APPS_SCRIPT_WEB_APP_URL + '?action=getProjects'); // Added action parameter
            if (!response.ok) {
                // Try to read error message from response body
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
            }
            const data = await response.json();
            if (data.success) {
                return data.data || [];
            } else {
                showMessageModal('Error', `Failed to load projects from Google Sheet: ${data.message}`);
                return [];
            }
        } catch (error) {
            console.error('Error loading projects from Google Sheet:', error);
            showMessageModal('Error', 'Failed to load projects. Check console for details.');
            return [];
        }
    }

    // Function to send project data to Google Sheet via Apps Script (CREATE)
    async function sendProjectToSheet(projectData) {
        try {
            if (APPS_SCRIPT_WEB_APP_URL === 'YOUR_DEPLOYED_APPS_SCRIPT_WEB_APP_URL_HERE') {
                console.error("Apps Script URL not set. Cannot create project in Google Sheet.");
                showMessageModal('Error', 'Google Sheet integration not configured. Please set APPS_SCRIPT_WEB_APP_URL.');
                return { success: false, message: 'URL not set' };
            }

            const response = await fetch(APPS_SCRIPT_WEB_APP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'create', project: projectData }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
            }
            const result = await response.json();
            return result; // return the result object directly
        } catch (error) {
            console.error('Error sending project to Google Sheet:', error);
            showMessageModal('Error', 'Failed to create project. Check console for details.');
            return { success: false, message: error.message };
        }
    }

    // Function to update project data in Google Sheet via Apps Script (UPDATE)
    async function updateProjectInSheet(projectData) {
        try {
            if (APPS_SCRIPT_WEB_APP_URL === 'YOUR_DEPLOYED_APPS_SCRIPT_WEB_APP_URL_HERE') {
                console.error("Apps Script URL not set. Cannot update project in Google Sheet.");
                showMessageModal('Error', 'Google Sheet integration not configured. Please set APPS_SCRIPT_WEB_APP_URL.');
                return { success: false, message: 'URL not set' };
            }

            const response = await fetch(APPS_SCRIPT_WEB_APP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'update', project: projectData }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error updating project in Google Sheet:', error);
            showMessageModal('Error', 'Failed to update project. Check console for details.');
            return { success: false, message: error.message };
        }
    }

    // Function to delete a project from Google Sheet via Apps Script (DELETE)
    async function deleteProjectFromSheet(projectId) {
        try {
            if (APPS_SCRIPT_WEB_APP_URL === 'YOUR_DEPLOYED_APPS_SCRIPT_WEB_APP_URL_HERE') {
                console.error("Apps Script URL not set. Cannot delete project from Google Sheet.");
                showMessageModal('Error', 'Google Sheet integration not configured. Please set APPS_SCRIPT_WEB_APP_URL.');
                return { success: false, message: 'URL not set' };
            }

            const response = await fetch(APPS_SCRIPT_WEB_APP_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: 'delete', project: { id: projectId } }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! Status: ${response.status}. Message: ${errorText}`);
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error deleting project from Google Sheet:', error);
            showMessageModal('Error', 'Failed to delete project. Check console for details.');
            return { success: false, message: error.message };
        }
    }


    // Function to render projects in the list
    async function renderProjects() {
        const projects = await loadProjects(); // Await the projects from the sheet
        projectsList.innerHTML = ''; // Clear existing projects

        if (projects.length === 0) {
            noProjectsMessage.style.display = 'block'; // Show "No projects" message
        } else {
            noProjectsMessage.style.display = 'none'; // Hide "No projects" message
            projects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'bg-gray-700 rounded-lg p-4 shadow-md border border-gray-600';
                // Use project.ID as data-id if your sheet header is 'ID'
                projectCard.setAttribute('data-id', project.ID); // Assumes your sheet column header is 'ID'
                projectCard.innerHTML = `
                    <h4 class="text-xl font-semibold mb-2 text-indigo-200">${project.ProjectName}</h4>
                    <p class="text-gray-300 text-sm mb-2">${project.Description}</p>
                    <p class="text-gray-400 text-xs">Due: <span class="font-medium">${project.DueDate}</span></p>
                    <p class="text-gray-400 text-xs">Status: <span class="font-medium text-blue-300">${project.Status}</span></p>
                    <div class="mt-4 flex justify-end gap-2">
                        <button class="edit-btn px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-lg transition duration-300" data-id="${project.ID}">Edit</button>
                        <button class="delete-btn px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition duration-300" data-id="${project.ID}">Delete</button>
                    </div>
                `;
                projectsList.appendChild(projectCard);
            });

            // Add event listeners for new Edit/Delete buttons (delegation might be better for many items)
            document.querySelectorAll('.edit-btn').forEach(button => {
                button.addEventListener('click', handleEditProject);
            });
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', handleDeleteProject);
            });
        }
    }

    // Function to open the edit modal and pre-fill data
    async function handleEditProject(event) {
        const projectId = parseInt(event.target.dataset.id);
        const projects = await loadProjects(); // Load fresh data
        const projectToEdit = projects.find(p => p.ID === projectId); // Use project.ID

        if (projectToEdit) {
            editProjectId.value = projectToEdit.ID;
            editProjectName.value = projectToEdit.ProjectName;
            editDueDate.value = projectToEdit.DueDate;
            editProjectDescription.value = projectToEdit.Description;
            editProjectStatus.value = projectToEdit.Status;
            editProjectModalOverlay.classList.add('show');
        } else {
            showMessageModal('Error', 'Project not found for editing.');
        }
    }

    // Function to delete a project
    async function handleDeleteProject(event) {
        const projectId = parseInt(event.target.dataset.id);
        const confirmation = confirm("Are you sure you want to delete this project?"); // Simple confirmation
        if (confirmation) {
            const result = await deleteProjectFromSheet(projectId);
            if (result.success) {
                showMessageModal('Success', result.message);
                renderProjects(); // Re-render after successful deletion
            } else {
                showMessageModal('Error', result.message);
            }
        }
    }


    // --- Event Listeners ---

    // Enforce login status on page load
    checkLoginStatus();

    // Logout button click handler
    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('loggedIn'); // Clear login status
        localStorage.removeItem('rememberedUser'); // Optionally clear remembered user
        showMessageModal('Logged Out', 'You have been successfully logged out.', () => {
            window.location.href = 'admin.html';
        });
    });

    // View Projects button click handler (toggle visibility)
    viewProjectsButton.addEventListener('click', () => {
        myProjectsSection.classList.toggle('show');
        if (myProjectsSection.classList.contains('show')) {
            viewProjectsButton.textContent = 'Hide Projects';
            renderProjects(); // Re-render projects when shown
        } else {
            viewProjectsButton.textContent = 'View Projects';
        }
    });

    // Project creation form submission handler
    projectForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission

        const projectName = document.getElementById('projectName').value.trim();
        const dueDate = document.getElementById('dueDate').value.trim();
        const projectDescription = document.getElementById('projectDescription').value.trim();
        const projectStatus = document.getElementById('projectStatus').value;

        if (!projectName || !dueDate || !projectDescription || !projectStatus) {
            showMessageModal('Error', 'Please fill in all project fields.');
            return;
        }

        const newProject = {
            id: Date.now(), // Simple unique ID based on timestamp
            // Ensure these keys match your Google Sheet headers (cleaned: "Project Name" -> "ProjectName")
            ProjectName: projectName,
            DueDate: dueDate,
            Description: projectDescription,
            Status: projectStatus,
            CreatedAt: new Date().toISOString()
        };

        const result = await sendProjectToSheet(newProject);
        if (result.success) {
            showMessageModal('Success', result.message);
            projectForm.reset(); // Clear the form fields
            renderProjects(); // Re-render to show new project from sheet
        } else {
            showMessageModal('Error', result.message);
        }
    });

    // Edit project form submission handler
    editProjectForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = parseInt(editProjectId.value);
        const name = editProjectName.value.trim();
        const dueDate = editDueDate.value.trim();
        const description = editProjectDescription.value.trim();
        const status = editProjectStatus.value;

        if (!name || !dueDate || !description || !status) {
            showMessageModal('Error', 'Please fill in all fields for editing.');
            return;
        }

        const updatedProject = {
            id: id,
            ProjectName: name,
            DueDate: dueDate,
            Description: description,
            Status: status
        };

        const result = await updateProjectInSheet(updatedProject);
        if (result.success) {
            showMessageModal('Success', result.message);
            editProjectModalOverlay.classList.remove('show'); // Close the edit modal
            renderProjects(); // Re-render after successful update
        } else {
            showMessageModal('Error', result.message);
        }
    });

    // Cancel edit button handler
    cancelEditButton.addEventListener('click', () => {
        editProjectModalOverlay.classList.remove('show');
        editProjectForm.reset();
    });

    // Initial render of projects when the page loads
    renderProjects();
});