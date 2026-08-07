// ==========================
// FIREBASE IMPORTS
// ==========================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-storage.js";

// ==========================
// FIREBASE CONFIG
// ==========================

const firebaseConfig = {

    apiKey: "AIzaSyDjeVzy3FXGcS7-iyCWNtIgrjEPDPFAim0",

    authDomain: "printex-c59f6.firebaseapp.com",

    databaseURL: "https://printex-c59f6-default-rtdb.firebaseio.com",

    projectId: "printex-c59f6",

    storageBucket: "printex-c59f6.firebasestorage.app",

    messagingSenderId: "635263652250",

    appId: "1:635263652250:web:878f4321eeffb7d1e6aa23"

};

// ==========================

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getFirestore(app);

export const storage = getStorage(app);

// ==========================
// ADMIN LOGIN
// ==========================

export async function adminLogin(email,password){

    return await signInWithEmailAndPassword(

        auth,

        email,

        password

    );

}

// ==========================
// LOGOUT
// ==========================

export async function logout(){

    return await signOut(auth);

}

// ==========================
// UPLOAD COURSE IMAGE
// ==========================

export async function uploadCourseImage(file){

    const fileName=Date.now()+"_"+file.name;

    const storageRef=ref(

        storage,

        "course_images/"+fileName

    );

    await uploadBytes(storageRef,file);

    return await getDownloadURL(storageRef);

}

// ==========================
// ADD COURSE
// ==========================

export async function addCourse(data){

    return await addDoc(

        collection(db,"courses"),

        data

    );

}

// ==========================
// LOAD COURSES
// ==========================

export async function loadCourses(){

    const snapshot=await getDocs(

        collection(db,"courses")

    );

    return snapshot;

}

// ==========================
// LOAD ORDERS
// ==========================

export async function loadOrders(){

    const snapshot=await getDocs(

        collection(db,"orders")

    );

    return snapshot;

}

// ==========================
// APPROVE ORDER
// ==========================

export async function approveOrder(id,driveLink){

    await updateDoc(

        doc(db,"orders",id),

        {

            status:"Approved",

            driveLink:driveLink

        }

    );

}

// ==========================
// REJECT ORDER
// ==========================

export async function rejectOrder(id){

    await updateDoc(

        doc(db,"orders",id),

        {

            status:"Rejected"

        }

    );

}

// ==========================
// DELETE COURSE
// ==========================

export async function deleteCourse(id){

    await deleteDoc(

        doc(db,"courses",id)

    );

}
