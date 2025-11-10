import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function Seccion() {
  const { slug } = useParams();
  const [seccion, setSeccion] = useState(null);
  const [noticias, setNoticias] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sSnap = await getDocs(collection(db, "secciones"));
        const s = sSnap.docs.map(d => ({id:d.id, ...d.data()})).find(x => x.slug === slug);
        setSeccion(s || { nombre: slug });

        const qPub = query(collection(db, "noticias"), where("estado", "==", "Publicado"));
        const nSnap = await getDocs(qPub);
        const all = nSnap.docs.map(d => ({id:d.id, ...d.data()}));
        const filtered = all.filter(n => (n.seccionSlug || "").trim() === slug);
        setNoticias(filtered);
        if (filtered.length === 0) setMsg("No hay publicaciones en esta sección.");
      } catch (e) {
        console.error(e); setMsg("❌ No se pudo cargar la sección.");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return (
    <div className="container mt-4">
      <div className="section-title"><span className="bar" /><h3 className="mb-0">{seccion?.nombre || "Sección"}</h3></div>
      {msg && <div className="alert alert-info">{msg}</div>}

      {loading ? (
        <div className="row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="col-md-4 mb-3">
              <div className="card h-100 skeleton-card">
                <div className="skeleton skeleton-img" />
                <div className="card-body">
                  <div className="skeleton skeleton-text w-75 mb-2" />
                  <div className="skeleton skeleton-text w-50" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          {noticias.map(n => (
            <div key={n.id} className="col-md-4 mb-3">
              <div className="card h-100">
                {n.imagen && <img src={n.imagen} alt={n.titulo} className="card-img-top" style={{height:180, objectFit:"cover"}}/>}
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title">{n.titulo}</h6>
                  <p className="text-muted small mb-2">{n.subtitulo || ""}</p>
                  <Link className="btn btn-sm btn-outline-primary mt-auto" to={`/noticia/${n.id}`}>Leer más</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
