// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCWcZMF4Yty2aX7vAHUs_LI5R6N0S8NRy4",
  authDomain: "bingoinec.firebaseapp.com",
  projectId: "bingoinec",
  storageBucket: "bingoinec.firebasestorage.app",
  messagingSenderId: "483007152008",
  appId: "1:483007152008:web:6347c02216e162c0a3c43d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
const db = getFirestore(app);

// Inicializar Auth
const auth = getAuth(app);

// Para desenvolvimento local, descomente as linhas abaixo:
// if (location.hostname === 'localhost') {
//   connectFirestoreEmulator(db, 'localhost', 8080);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

export { db, auth };
