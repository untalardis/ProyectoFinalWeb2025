// src/services/authService.js
import { auth, db } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function register({ nombre, email, password, rol }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, "usuarios", cred.user.uid), {
    uid: cred.user.uid,
    nombre,
    correo: email,
    rol, // "reportero" | "editor"
  });
  return cred;
}

export async function logout() {
  return signOut(auth);
}
