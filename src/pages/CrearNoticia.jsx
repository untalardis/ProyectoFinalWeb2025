import React, { useEffect, useState } from "react";
import { db } from "../services/firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function CrearNoticia() {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [secciones, setSecciones] = useState([]);
  const [aviso, setAviso] = useState("");

  const [form, setForm] = useState({
    titulo: "", subtitulo: "", contenido: "",
    seccionSlug: "", imagen: "", estado: "Edición",
  });

  useEffect(() => {
    (async () => {
      const secs = await getDocs(collection(db, "secciones"));
      if (secs.empty) setAviso("⚠️ Crea secciones en /secciones (rol editor) o desde Firestore.");
      setSecciones(secs.docs.map(d => ({id:d.id, ...d.data()})));
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.seccionSlug) return setAviso("Selecciona una sección.");
    const sec = secciones.find(s => s.slug === form.seccionSlug);
    try {
      await addDoc(collection(db, "noticias"), {
        titulo: form.titulo,
        subtitulo: form.subtitulo,
        contenido: form.contenido,
        categoria: sec?.nombre || "",     // RF-06 compat
        seccionNombre: sec?.nombre || "",
        seccionSlug: form.seccionSlug,
        imagen: form.imagen,
        estado: form.estado,              // reportero: Edición/Terminado; editor: puede Publicar/Desactivar
        autorNombre: userData?.nombre,
        autorUid: userData?.uid,
        fechaCreacion: serverTimestamp(),
        fechaActualizacion: serverTimestamp(),
      });
      navigate("/dashboard");
    } catch (e2) {
      console.error(e2);
      setAviso("❌ No se pudo crear la noticia.");
    }
  };

  const esEditor = userData?.rol === "editor";

  return (
    <div className="container mt-4" style={{ maxWidth: 760 }}>
      <div className="card shadow-soft p-4">
        <h3 className="mb-2">Crear noticia</h3>
        {aviso && <div className="alert alert-warning">{aviso}</div>}

        <form onSubmit={submit}>
          <input className="form-control mb-2" placeholder="Título" required
                 value={form.titulo} onChange={e=>setForm({...form, titulo:e.target.value})} />
          <input className="form-control mb-2" placeholder="Subtítulo / Bajante"
                 value={form.subtitulo} onChange={e=>setForm({...form, subtitulo:e.target.value})} />
          <textarea className="form-control mb-2" rows={6} placeholder="Contenido (HTML o texto)"
                    value={form.contenido} onChange={e=>setForm({...form, contenido:e.target.value})} />

          <div className="row g-2">
            <div className="col-md-6">
              <select className="form-select" required
                      value={form.seccionSlug}
                      onChange={e=>setForm({...form, seccionSlug:e.target.value})}>
                <option value="">Seleccione sección</option>
                {secciones.map(s => (
                  <option key={s.id} value={s.slug}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <input className="form-control" placeholder="URL de imagen" required
                     value={form.imagen} onChange={e=>setForm({...form, imagen:e.target.value})} />
            </div>
          </div>

          <div className="mt-2">
            <label className="form-label">Estado</label>
            <select className="form-select"
                    value={form.estado}
                    onChange={e=>setForm({...form, estado:e.target.value})}>
              <option>Edición</option>
              <option>Terminado</option>
              {esEditor && <option>Publicado</option>}
              {esEditor && <option>Desactivado</option>}
            </select>
          </div>

          <button className="btn btn-success mt-3">Guardar</button>
        </form>
      </div>
    </div>
  );
}
