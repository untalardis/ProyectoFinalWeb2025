// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../services/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);

// Hook interno (por si quieres importarlo directo desde aquí)
export const useAuthCtx = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); // {nombre, rol, uid, correo}
  const [loading, setLoading] = useState(true);

  // Cargar datos de usuario en Firestore
  const loadUserData = async (uid) => {
    try {
      const ref = doc(db, "usuarios", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setUserData(snap.data());
      } else {
        setUserData(null);
      }
    } catch (e) {
      console.error("loadUserData error:", e);
      setUserData(null);
    }
  };

  // Observador de sesión
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u?.uid) {
        await loadUserData(u.uid);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Métodos de auth
  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const register = async ({ nombre, email, password }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (nombre) {
      await updateProfile(cred.user, { displayName: nombre });
    }
    // crear doc en Firestore con rol por defecto
    await setDoc(doc(db, "usuarios", cred.user.uid), {
      uid: cred.user.uid,
      nombre: nombre || cred.user.displayName || "",
      correo: email,
      rol: "reportero", // por defecto
    });
    await loadUserData(cred.user.uid);
    return cred.user;
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
