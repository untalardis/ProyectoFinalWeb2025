// src/pages/Secciones.jsx
import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { slugify } from "../utils/slugify";
import useAuth from "../hooks/useAuth";

export default function Secciones() {
  const { userData } = useAuth();
  const isEditor = userData?.rol === "editor";

  const [items, setItems] = useState([]);
  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNombre, setEditNombre] = useState("");

  const cargar = async () => {
    const snap = await getDocs(collection(db, "secciones"));
    setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    cargar();
  }, []);

  const crear = async (e) => {
    e.preventDefault();
    if (!isEditor || !nombre.trim()) return;
    await addDoc(collection(db, "secciones"), {
      nombre: nombre.trim(),
      slug: slugify(nombre),
    });
    setNombre("");
    cargar();
  };

  const iniciarEdicion = (item) => {
    setEditId(item.id);
    setEditNombre(item.nombre);
  };

  const guardarEdicion = async () => {
    if (!editId || !editNombre.trim()) return;
    await updateDoc(doc(db, "secciones", editId), {
      nombre: editNombre.trim(),
      slug: slugify(editNombre),
    });
    setEditId(null);
    setEditNombre("");
    cargar();
  };

  const eliminar = async (id) => {
    if (!isEditor) return;
    if (!window.confirm("¿Eliminar esta sección?")) return;
    await deleteDoc(doc(db, "secciones", id));
    cargar();
  };

  if (!isEditor) {
    return (
      <div className="container mt-4">
        Solo los usuarios con rol <strong>editor</strong> pueden administrar secciones.
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 680 }}>
      <h3 className="mb-3">Administrar secciones</h3>

      <form onSubmit={crear} className="d-flex gap-2 mb-4">
        <input
          className="form-control"
          placeholder="Nombre de la sección (ej. Tecnología)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <button className="btn btn-primary">Agregar</button>
      </form>

      <ul className="list-group">
        {items.map((it) => (
          <li
            key={it.id}
            className="list-group-item d-flex justify-content-between align-items-center"
          >
            <div className="me-3" style={{ minWidth: 0 }}>
              {editId === it.id ? (
                <input
                  className="form-control"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                />
              ) : (
                <>
                  <strong>{it.nombre}</strong>
                  <span className="text-muted ms-2">/seccion/{it.slug}</span>
                </>
              )}
            </div>

            <div className="d-flex gap-2">
              {editId === it.id ? (
                <>
                  <button className="btn btn-sm btn-success" onClick={guardarEdicion}>
                    Guardar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => {
                      setEditId(null);
                      setEditNombre("");
                    }}
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => iniciarEdicion(it)}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => eliminar(it.id)}
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="list-group-item text-muted">No hay secciones.</li>
        )}
      </ul>
    </div>
  );
}
