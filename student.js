// student.js

// List of students with their email, name, grade, course, and password
const students = [
    { email: '28438635638@stu.rohail.com', name: 'Student 1', grade: 'A', course: 'Math', password: 'student1234!@#$' },
    { email: '59227717242@stu.rohail.com', name: 'Student 2', grade: 'B+', course: 'Science', password: 'student1234!@#$' },
    { email: '46505998863@stu.rohail.com', name: 'Student 3', grade: 'A-', course: 'History', password: 'student1234!@#$' },
    { email: '64405296569@stu.rohail.com', name: 'Student 4', grade: 'B', course: 'Chemistry', password: 'student1234!@#$' },
    { email: '86378727090@stu.rohail.com', name: 'Student 5', grade: 'A+', course: 'Biology', password: 'student1234!@#$' },
    { email: '26585942224@stu.rohail.com', name: 'Student 6', grade: 'B', course: 'Physics', password: 'student1234!@#$' },
    { email: '86836494796@stu.rohail.com', name: 'Student 7', grade: 'C+', course: 'English', password: 'student1234!@#$' },
    { email: '62580145876@stu.rohail.com', name: 'Student 8', grade: 'A', course: 'Math', password: 'student1234!@#$' },
    { email: '37300497891@stu.rohail.com', name: 'Student 9', grade: 'B-', course: 'Geography', password: 'student1234!@#$' },
    { email: '10969619005@stu.rohail.com', name: 'Student 10', grade: 'A', course: 'Computer Science', password: 'student1234!@#$' },
    // Add more students as needed in the same format
    { email: '79263522852@stu.rohail.com', name: 'Student 11', grade: 'B+', course: 'Art', password: 'student1234!@#$' },
    { email: '30890854615@stu.rohail.com', name: 'Student 12', grade: 'A', course: 'Math', password: 'student1234!@#$' },
    { email: '34417550585@stu.rohail.com', name: 'Student 13', grade: 'C', course: 'Biology', password: 'student1234!@#$' },
    { email: '47861151804@stu.rohail.com', name: 'Student 14', grade: 'B+', course: 'Physics', password: 'student1234!@#$' },
    { email: '69591755406@stu.rohail.com', name: 'Student 15', grade: 'A-', course: 'Math', password: 'student1234!@#$' },
    // Continue adding more students...
];

// Function to extract the student ID from the URL query string
function getStudentIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Function to get student details by student ID
function getStudentDetailsById(studentId) {
    return students.find(student => student.email.split('@')[0] === studentId);
}

// Function to display the student's information on the page
function displayStudentInfo(student) {
    document.getElementById('emailDisplay').textContent = student.email;
    document.getElementById('studentId').textContent = student.email.split('@')[0];  // Use email prefix as student ID
    document.getElementById('studentName').textContent = student.name;
    document.getElementById('studentGrade').textContent = student.grade;
    document.getElementById('studentCourse').textContent = student.course;
    document.getElementById('studentPassword').textContent = student.password; // Display the default password
}

// Function to handle the logout action
function logout() {
    sessionStorage.clear();
    window.location.href = 'index.html';  // Redirect to the login page
}

// Main logic
window.onload = function () {
    // Get the student ID from the URL
    const studentId = getStudentIdFromUrl();
    
    // If no student ID is provided, show an error and redirect to the login page
    if (!studentId) {
        alert('No student ID found in the URL.');
        window.location.href = 'index.html';
        return;
    }

    // Find the student by the ID
    const student = getStudentDetailsById(studentId);

    // If the student is found, display their information, else show an error
    if (student) {
        displayStudentInfo(student);
    } else {
        alert('Student not found.');
        window.location.href = 'index.html';  // Redirect to the login page
    }
}
