import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgk1Y6YjjaHrV1IbB3fpR5Dpui_kEWObU",
  authDomain: "project-superxmart.firebaseapp.com",
  databaseURL: "https://project-superxmart-default-rtdb.firebaseio.com",
  projectId: "project-superxmart",
  storageBucket: "project-superxmart.firebasestorage.app",
  messagingSenderId: "376252244846",
  appId: "1:376252244846:web:ec03bebd8ed222ee14577f",
  measurementId: "G-PBQBTCYSVD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, analytics, db, storage };
