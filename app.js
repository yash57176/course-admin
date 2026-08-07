// ==========================
// ADMIN PANEL APP
// ==========================

// All Screens
const screens = document.querySelectorAll(".screen");

function showScreen(id) {
    screens.forEach(screen => screen.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

// --------------------------
// Admin Login
// --------------------------

const adminLoginBtn = document.getElementById("adminLoginBtn");

adminLoginBtn.addEventListener("click", () => {

    const email = document.getElementById("adminEmail").value.trim();
    const password = document.getElementById("adminPassword").value.trim();

    if (email === "" || password === "") {
        alert("Enter Email & Password");
        return;
    }

    // अभी Demo Login
    showScreen("dashboard");

});

// --------------------------
// Logout
// --------------------------

document.getElementById("logoutBtn").addEventListener("click", () => {

    if (confirm("Logout?")) {
        showScreen("login");
    }

});

// --------------------------
// Menu Buttons
// --------------------------

document.getElementById("courseBtn").addEventListener("click", () => {
    alert("Course Management");
});

document.getElementById("ordersBtn").addEventListener("click", () => {
    alert("Orders List");
});

document.getElementById("usersBtn").addEventListener("click", () => {
    alert("Users List");
});

// --------------------------
// Add Course
// --------------------------

const addCourseBtn = document.getElementById("addCourse");

addCourseBtn.addEventListener("click", () => {

    const name = document.getElementById("courseName").value.trim();
    const price = document.getElementById("coursePrice").value.trim();
    const link = document.getElementById("courseLink").value.trim();
    const image = document.getElementById("courseImage").files[0];

    if (!name || !price || !link || !image) {
        alert("Please fill all fields");
        return;
    }

    // अभी Demo
    alert("Course Added Successfully");

    document.getElementById("courseName").value = "";
    document.getElementById("coursePrice").value = "";
    document.getElementById("courseLink").value = "";
    document.getElementById("courseImage").value = "";

});

// --------------------------
// Demo Orders
// --------------------------

const ordersList = document.getElementById("ordersList");

ordersList.innerHTML = `
<div class="order-card">
    <h4>Rahul Sharma</h4>
    <p>Email : rahul@gmail.com</p>
    <p>Mobile : 9876543210</p>
    <p>Course : Trading Course</p>
    <p>Status : <span class="pending">Pending</span></p>

    <button onclick="approveOrder()">
        Approve
    </button>

    <button onclick="rejectOrder()">
        Reject
    </button>

</div>
`;

window.approveOrder = function () {

    alert("Order Approved");

};

window.rejectOrder = function () {

    alert("Order Rejected");

};
