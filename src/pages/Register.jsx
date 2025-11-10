// src/pages/Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Register() {
  const { register, loading } = useAuth(); // <-- viene de src/hooks/useAuth.js
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim()) {
      setError("Escribe tu nombre.");
      return;
    }
    if (form.password !== form.password2) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await register({
        nombre: form.nombre.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      // registrado + doc en /usuarios; te llevo al dashboard
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      // Mensajes de error más amigables
      switch (err?.code) {
        case "auth/email-already-in-use":
          setError("Ese correo ya está en uso.");
          break;
        case "auth/invalid-email":
          setError("Correo inválido.");
          break;
        case "auth/weak-password":
          setError("La contraseña debe tener al menos 6 caracteres.");
          break;
        case "auth/operation-not-allowed":
          setError("Habilita Email/Password en Firebase Auth → Sign-in method.");
          break;
        default:
          setError(err?.message || "No se pudo registrar.");
      }
    }
  };

return (
    <div className="container" style={{ maxWidth: 520 }}>
      <div className="card shadow-soft p-4 mt-4">
        <h3 className="mb-3">Crear cuenta</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Correo</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Repite la contraseña</label>
            <input
              type="password"
              className="form-control"
              value={form.password2}
              onChange={(e) => setForm({ ...form, password2: e.target.value })}
              required
              minLength={6}
            />
          </div>

          <button className="btn btn-primary w-100" disabled={loading}>
            {loading ? "Creando cuenta..." : "Registrarse"}
          </button>
        </form>
        <p className="mt-3 text-muted mb-0">
          ¿Ya tienes cuenta? <Link to="/login">Ingresar</Link>
        </p>
      </div>
    </div>
  );
}
