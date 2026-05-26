import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, addDoc, onSnapshot, query, orderBy, where, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { getDatabase, ref as dbRef, push, set, get, onChildAdded, onValue, update, off } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

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
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { 
  app, 
  auth, 
  db,
  storage,
  rtdb,
  dbRef, push, set, get, onChildAdded, onValue, update, off,
  googleProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  sendEmailVerification,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  doc, setDoc, getDoc, collection, getDocs, updateDoc, addDoc, onSnapshot, query, orderBy, where, serverTimestamp, deleteDoc,
  ref, uploadBytes, getDownloadURL
};
