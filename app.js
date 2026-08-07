import { 
  auth, 
  db, 
  storage, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  serverTimestamp,
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "./firebase.js";

// STATE & PANELS NAVIGATION
window.switchPanel = function(panelId) {
  document.querySelectorAll("main section").forEach(s => s.style.display = "none");
  document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
  
  document.getElementById(`panel-${panelId}`).style.display = "block";
  event.target.classList.add("active");
};

// AUTHENTICATION
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Verify Security Access (Only Admin can Access)
    const adminDoc = await getDoc(doc(db, "admins", user.uid));
    if (adminDoc.exists() || user.email === "admin@courseplatform.com") {
      document.getElementById("admin-login-view").style.display = "none";
      document.getElementById("admin-main-view").style.display = "flex";
      initAdminDashboard();
    } else {
      alert("Access Denied: You are not authorized as Admin.");
      signOut(auth);
    }
  } else {
    document.getElementById("admin-login-view").style.display = "flex";
    document.getElementById("admin-main-view").style.display = "none";
  }
});

document.getElementById("admin-login-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("admin-email").value;
  const password = document.getElementById("admin-password").value;
  signInWithEmailAndPassword(auth, email, password).catch(err => alert(err.message));
});

document.getElementById("admin-logout-btn").addEventListener("click", () => signOut(auth));

// DASHBOARD INIT & REALTIME LISTENERS
function initAdminDashboard() {
  loadMetrics();
  loadCoursesTable();
  loadOrdersTable();
  loadUsersTable();
}

// METRICS
function loadMetrics() {
  onSnapshot(collection(db, "courses"), snap => {
    document.getElementById("metric-courses").innerText = snap.size;
  });

  onSnapshot(collection(db, "orders"), snap => {
    document.getElementById("metric-orders").innerText = snap.size;
    let pending = 0;
    let totalRev = 0;

    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.status === "Pending") pending++;
      if (data.status === "Approved") totalRev += Number(data.price || 0);
    });

    document.getElementById("metric-pending").innerText = pending;
    document.getElementById("metric-revenue").innerText = `₹${totalRev}`;
  });
}

// COURSES CRUD
function loadCoursesTable() {
  onSnapshot(collection(db, "courses"), snap => {
    const tbody = document.getElementById("courses-table-body");
    tbody.innerHTML = "";
    snap.forEach(docSnap => {
      const course = { id: docSnap.id, ...docSnap.data() };
      tbody.innerHTML += `
        <tr>
          <td><img src="${course.thumbnail}" width="50" height="35" style="object-fit:cover; border-radius:4px;"></td>
          <td><b>${course.courseName}</b></td>
          <td>₹${course.price}</td>
          <td><a href="${course.driveLink}" target="_blank">Drive Link</a></td>
          <td>
            <button class="btn btn-danger" onclick="deleteCourse('${course.id}')">Delete</button>
          </td>
        </tr>
      `;
    });
  });
}

window.openAddCourseModal = function() {
  document.getElementById("course-modal").style.display = "flex";
};

window.closeCourseModal = function() {
  document.getElementById("course-modal").style.display = "none";
};

document.getElementById("course-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("course-name").value;
  const price = document.getElementById("course-price").value;
  const desc = document.getElementById("course-desc").value;
  const driveLink = document.getElementById("course-drive-link").value;
  const file = document.getElementById("course-file").files[0];

  if (!file) return alert("Upload a course thumbnail!");

  try {
    const storageRef = ref(storage, `thumbnails/${Date.now()}_${file.name}`);
    const uploadRes = await uploadBytes(storageRef, file);
    const thumbnailUrl = await getDownloadURL(uploadRes.ref);

    await addDoc(collection(db, "courses"), {
      courseName: name,
      price: Number(price),
      description: desc,
      driveLink: driveLink,
      thumbnail: thumbnailUrl,
      createdAt: serverTimestamp()
    });

    closeCourseModal();
    alert("Course added successfully!");
  } catch (err) {
    alert(err.message);
  }
});

window.deleteCourse = async function(id) {
  if (confirm("Are you sure you want to delete this course?")) {
    await deleteDoc(doc(db, "courses", id));
  }
};

// ORDERS MANAGEMENT
function loadOrdersTable() {
  onSnapshot(collection(db, "orders"), snap => {
    const tbody = document.getElementById("orders-table-body");
    tbody.innerHTML = "";
    snap.forEach(docSnap => {
      const order = { id: docSnap.id, ...docSnap.data() };
      tbody.innerHTML += `
        <tr>
          <td>${order.customerName}<br><small>${order.email}</small></td>
          <td>${order.courseName}</td>
          <td>₹${order.price}</td>
          <td><b>${order.utr}</b></td>
          <td><a href="${order.paymentScreenshot}" target="_blank">View Proof</a></td>
          <td><span style="font-weight:bold;">${order.status}</span></td>
          <td>
            ${order.status === 'Pending' ? `
              <button class="btn btn-success" onclick="openApproveModal('${order.id}', '${order.courseId}')">Approve</button>
              <button class="btn btn-danger" onclick="rejectOrder('${order.id}')">Reject</button>
            ` : 'Completed'}
          </td>
        </tr>
      `;
    });
  });
}

window.openApproveModal = async function(orderId, courseId) {
  document.getElementById("approve-order-id").value = orderId;
  
  // Auto-fetch default course drive link if present
  if (courseId) {
    const courseSnap = await getDoc(doc(db, "courses", courseId));
    if (courseSnap.exists()) {
      document.getElementById("approve-drive-link").value = courseSnap.data().driveLink || "";
    }
  }
  
  document.getElementById("order-modal").style.display = "flex";
};

window.closeOrderModal = function() {
  document.getElementById("order-modal").style.display = "none";
};

document.getElementById("order-approve-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const orderId = document.getElementById("approve-order-id").value;
  const driveLink = document.getElementById("approve-drive-link").value;

  await updateDoc(doc(db, "orders", orderId), {
    status: "Approved",
    driveLink: driveLink
  });

  closeOrderModal();
  alert("Order Approved and Google Drive Link sent!");
});

window.rejectOrder = async function(orderId) {
  if (confirm("Are you sure you want to reject this order?")) {
    await updateDoc(doc(db, "orders", orderId), {
      status: "Rejected"
    });
  }
};

// USERS MANAGEMENT
function loadUsersTable() {
  onSnapshot(collection(db, "orders"), snap => {
    const tbody = document.getElementById("users-table-body");
    tbody.innerHTML = "";
    const usersMap = new Map();

    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.email && !usersMap.has(data.email)) {
        usersMap.set(data.email, data.userId || "N/A");
      }
    });

    usersMap.forEach((userId, email) => {
      tbody.innerHTML += `
        <tr>
          <td>${email}</td>
          <td>${userId}</td>
        </tr>
      `;
    });
  });
}

// SETTINGS (PHONEPE QR CODE UPLOAD)
document.getElementById("settings-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = document.getElementById("settings-qr-file").files[0];

  try {
    let qrUrl = "";
    if (file) {
      const storageRef = ref(storage, `settings/phonepe_qr_${Date.now()}`);
      const uploadRes = await uploadBytes(storageRef, file);
      qrUrl = await getDownloadURL(uploadRes.ref);
    }

    const payload = {
      appName: document.getElementById("settings-app-name").value,
      updatedAt: serverTimestamp()
    };

    if (qrUrl) payload.qrImage = qrUrl;

    await setDoc(doc(db, "settings", "global"), payload, { merge: true });
    alert("Platform Settings Saved Successfully!");
  } catch (err) {
    alert(err.message);
  }
});
