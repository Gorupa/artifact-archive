// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDXsyjzQJg0wbzrG3qcg10BxUFI1rbFJ2Q",
    authDomain: "kaboom-card-tracker.firebaseapp.com",
    projectId: "kaboom-card-tracker",
    storageBucket: "kaboom-card-tracker.firebasestorage.app",
    messagingSenderId: "678271916501",
    appId: "1:678271916501:web:1c7845f555ef432344055c",
    measurementId: "G-JM1W2JZV52"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

export { auth, provider, db };
