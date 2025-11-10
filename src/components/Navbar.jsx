// src/components/Navbar.jsx
import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { db } from "../services/firebase";
import { collection, onSnapshot } from "firebase/firestore";

export default function Navbar() {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();

  const [secciones, setSecciones] = useState([]);
  const [loadingSecs, setLoadingSecs] = useState(true);
  const [errorSecs, setErrorSecs] = useState("");

  useEffect(() => {
    // Suscripción en tiempo real a la colección "secciones"
    const unsub = onSnapshot(
      collection(db, "secciones"),
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setSecciones(rows);
        setLoadingSecs(false);
        setErrorSecs("");
      },
      (err) => {
        console.error("Error cargando secciones:", err);
        setErrorSecs("No se pudieron cargar las secciones.");
        setLoadingSecs(false);
      }
    );
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light glass-nav sticky-top shadow-sm">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="brand-gradient">CMS Noticias</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div id="mainNav" className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link hover-underline">
                Inicio
              </NavLink>
            </li>

            {/* Dropdown Secciones */}
            <li className="nav-item dropdown">
              {/* IMPORTANTE: usa <button> como toggle en Bootstrap 5 */}
              <button
                className="nav-link dropdown-toggle btn btn-link hover-underline"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ textDecoration: "none" }}
              >
                Secciones
              </button>

              <ul className="dropdown-menu">
                {loadingSecs && (
                  <li>
                    <span className="dropdown-item text-muted">Cargando…</span>
                  </li>
                )}

                {!loadingSecs && errorSecs && (
                  <li>
                    <span className="dropdown-item text-danger">{errorSecs}</span>
                  </li>
                )}

                {!loadingSecs && !errorSecs && secciones.length === 0 && (
                  <li>
                    <span className="dropdown-item text-muted">Sin secciones</span>
                  </li>
                )}

                {!loadingSecs &&
                  !errorSecs &&
                  secciones.map((s) => (
                    <li key={s.id}>
                      <Link className="dropdown-item" to={`/seccion/${s.slug}`}>
                        {s.nombre}
                      </Link>
                    </li>
                  ))}
              </ul>
            </li>

            {user && (
              <li className="nav-item">
                <NavLink to="/dashboard" className="nav-link hover-underline">
                  Dashboard
                </NavLink>
              </li>
            )}

            {userData?.rol === "editor" && (
              <li className="nav-item">
                <NavLink to="/secciones" className="nav-link hover-underline">
                  Admin. secciones
                </NavLink>
              </li>
            )}
          </ul>

          <ul className="navbar-nav">
            {user ? (
              <>
                <li className="nav-item">
                  <span className="navbar-text me-2">
                    {userData?.nombre || user.email} · {userData?.rol || "usuario"}
                  </span>
                </li>
                <li className="nav-item">
                  <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                    Cerrar sesión
                  </button>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <NavLink to="/login" className="nav-link hover-underline">
                    Ingresar
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/register" className="nav-link hover-underline">
                    Registrarse
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
