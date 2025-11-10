// src/services/firebase.js
import { initializeApp, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTA5WQbDe8MTc6lo7HTeZiLsZL1_5OLow",
  authDomain: "cms-noticias-a1396.firebaseapp.com",
  projectId: "cms-noticias-a1396",
  // 👇 ESTE es el valor correcto
  storageBucket: "cms-noticias-a1396.appspot.com",
  messagingSenderId: "608169683673",
  appId: "1:608169683673:web:44f41d9926fed2bc3facc8",
  // measurementId opcional; no lo usamos en dev
};

// Inicializa UNA sola vez
const app = initializeApp(firebaseConfig);

// Exporta servicios que usa tu app
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
