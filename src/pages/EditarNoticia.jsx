import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../services/firebase";
import {
  doc, getDoc, updateDoc, serverTimestamp, collection, getDocs,
} from "firebase/firestore";
import useAuth from "../hooks/useAuth";
import { slugify } from "../utils/slugify";

export default function EditarNoticia() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userData } = useAuth();

  const [secciones, setSecciones] = useState([]);
  const [aviso, setAviso] = useState("");
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    titulo: "", subtitulo: "", contenido: "",
    seccionSlug: "", imagen: "", estado: "Edición",
  });

  useEffect(() => {
    (async () => {
      const secs = await getDocs(collection(db, "secciones"));
      setSecciones(secs.docs.map(d => ({id:d.id, ...d.data()})));
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const ref = doc(db, "noticias", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) { setAviso("❌ La noticia no existe."); setLoading(false); return; }
        const data = snap.data();

        const esEditor = userData?.rol === "editor";
        const esDueno = userData?.uid === data.autorUid;
        if (!esEditor && !esDueno) { setAviso("⛔ Sin permisos."); setLoading(false); return; }

        const seccionSlug = data.seccionSlug || slugify(data.categoria || "");
        setForm({
          titulo: data.titulo || "",
          subtitulo: data.subtitulo || "",
          contenido: data.contenido || "",
          seccionSlug,
          imagen: data.imagen || "",
          estado: data.estado || "Edición",
        });
      } catch (e) {
        console.error(e); setAviso("❌ Error cargando la noticia.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, userData]);

  const guardar = async (e) => {
    e.preventDefault();
    if (!form.seccionSlug) return setAviso("Selecciona una sección.");
    const sec = secciones.find(s => s.slug === form.seccionSlug);
    try {
      await updateDoc(doc(db, "noticias", id), {
        titulo: form.titulo,
        subtitulo: form.subtitulo,
        contenido: form.contenido,
        categoria: sec?.nombre || "",
        seccionNombre: sec?.nombre || "",
        seccionSlug: form.seccionSlug,
        imagen: form.imagen,
        estado: form.estado,
        fechaActualizacion: serverTimestamp(),
      });
      navigate("/dashboard");
    } catch (e2) {
      console.error(e2); setAviso("❌ No se pudieron guardar los cambios.");
    }
  };

  if (loading) return <p className="text-center mt-5">Cargando...</p>;

  const esEditor = userData?.rol === "editor";

  return (
    <div className="container mt-4" style={{ maxWidth: 760 }}>
      <div className="card shadow-soft p-4">
        <h3 className="mb-2">Editar noticia</h3>
        {aviso && <div className="alert alert-warning">{aviso}</div>}

        <form onSubmit={guardar}>
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

          <div className="d-flex gap-2 mt-3">
            <button className="btn btn-primary">Guardar cambios</button>
            <button type="button" className="btn btn-outline-secondary" onClick={()=>navigate(-1)}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
