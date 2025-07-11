// dashboard.js

// Firebase Configuration (REPLACE with YOUR actual config from Firebase Console)
const firebaseConfig = {
   apiKey: "AIzaSyBgz4GkCfMNzn7_nV4P7yry-MilTDDNbbI",
  authDomain: "login-d7f88.firebaseapp.com",
  projectId: "login-d7f88",
  appId: "1:179833264327:web:f405fc98edf2c2fe4f06e2",
};

// Initialize Firebase (check if already initialized)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Get Firebase Auth instance (Firestore is no longer needed here)
const auth = firebase.auth();

const logoutButton = document.getElementById('logoutButton');
const userEmailSpan = document.getElementById('userEmail');
const loginTimeSpan = document.getElementById('loginTime');
const learningContentDiv = document.getElementById('learningContent'); // Get the learning content container

// --- HARDCODED LEARNING RESOURCES ---
const learningResources = [
    {
        title: "Html and Css  (PDF)",
        type: "pdf",
        url: "html-css.pdf", // PDF URL
        description: "A comprehensive guide to get you started."
    },
    {
        title: "Javascript (PDF)",
        type: "pdf",
        url: "js.pdf", // Another example PDF URL
        description: "Dive deeper into advanced functionalities."
    }
];
// -------------------------------------


// Function to display hardcoded learning resources
function displayLearningResources() {
    learningContentDiv.innerHTML = '<p>Loading learning resources...</p>'; // Show loading message

    if (learningResources.length === 0) {
        learningContentDiv.innerHTML = '<p>No learning resources available yet.</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.classList.add('learning-content-list'); // Apply the list styling

    learningResources.forEach(data => { // Loop through the hardcoded array
        const li = document.createElement('li');
        li.classList.add('learning-content-item');

        let iconClass = '';
        let contentHtml = '';

        switch (data.type) {
            case 'pdf':
                iconClass = 'fa-file-pdf';
                contentHtml = `<a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.title}</a>`;
                break;
            case 'image':
                iconClass = 'fa-image';
                contentHtml = `<a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.title}</a>
                               <img src="${data.url}" alt="${data.title}" style="max-width:100%; height:auto; display:block; margin-top:5px;">`;
                break;
            case 'video':
                iconClass = 'fa-video';
                // Check if it's a YouTube embed URL (you can adjust this check)
                if (data.url.includes('https://www.google.com/search?q=https://www.youtube.com/embed/YOUR_YOUTUBE_VIDEO_ID')) { // Example check for YouTube embed
                     contentHtml = `<a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.title}</a>
                                    <iframe src="${data.url}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%; height:180px; margin-top:5px;"></iframe>`;
                } else {
                    // Assuming a direct video file (e.g., .mp4 hosted publicly)
                    contentHtml = `<a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.title}</a>
                                   <video controls src="${data.url}" style="width:100%; height:auto; margin-top:5px;"></video>`;
                }
                break;
            case 'link':
                iconClass = 'fa-link';
                contentHtml = `<a href="${data.url}" target="_blank" rel="noopener noreferrer">${data.title}</a>`;
                break;
            default:
                iconClass = 'fa-question-circle';
                contentHtml = `<span>${data.title} (Unknown type)</span>`;
        }

        li.innerHTML = `<i class="fa ${iconClass}"></i> ${contentHtml}`;
        ul.appendChild(li);
    });

    learningContentDiv.innerHTML = ''; // Clear loading message
    learningContentDiv.appendChild(ul);
}


// --- Existing Dashboard JS Logic ---

// Logic to update user email and login time, and protect the route
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in, update UI
        userEmailSpan.textContent = user.email;
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        loginTimeSpan.textContent = timeString;

        // Display learning resources when user is authenticated
        displayLearningResources(); // Call the new function

    } else {
        // No user is signed in, redirect to login page
        console.log("No user signed in on dashboard, redirecting to Newlogin.html");
        window.location.href = 'Newlogin.html';
    }
});

// Logout functionality
logoutButton.addEventListener('click', async () => {
    try {
        await auth.signOut();
        console.log('User logged out successfully.');
        window.location.href = 'Newlogin.html'; // Redirect to login page after logout
    } catch (error) {
        console.error('Logout Error:', error.code, error.message);
        alert('Failed to log out. Please try again.');
    }
});
