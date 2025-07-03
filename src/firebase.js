// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// ✅ Ta config
const firebaseConfig = {
  apiKey: "AIzaSyCVmditE1225JL7CPSQmwUPgnm8i-3jTyc",
  authDomain: "owl-timer-326a6.firebaseapp.com",
  projectId: "owl-timer-326a6",
  storageBucket: "owl-timer-326a6.firebasestorage.app",
  messagingSenderId: "75541357866",
  appId: "1:75541357866:web:2ada529e88edc5809a2a53",
  measurementId: "G-XF7EM1RPKH"
};

// ✅ Initialisation Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app); // ⬅️ Firestore
const analytics = getAnalytics(app);

// ✅ Exporte ce que tu veux utiliser ailleurs
export { db, analytics };
