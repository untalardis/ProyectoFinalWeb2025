import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../services/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { slugify } from "../utils/slugify";

export default function Home() {
  const [secciones, setSecciones] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sSnap = await getDocs(collection(db, "secciones"));
        const secc = sSnap.docs.map(d => ({id:d.id, ...d.data()}));
        setSecciones(secc);

        const qPub = query(collection(db, "noticias"), where("estado", "==", "Publicado"));
        const nSnap = await getDocs(qPub);
        const data = nSnap.docs.map(d => ({id:d.id, ...d.data()}));
        setNoticias(data);
        if (!data.length) setMsg("No hay noticias publicadas.");
      } catch (e) {
        console.error(e); setMsg("❌ No se pudo cargar el contenido.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="hero mb-4">
          <div className="kicker">Portal corporativo</div>
          <h1 className="mb-1">Noticias <span className="brand-gradient">actualizadas</span></h1>
          <p className="muted mb-0">Gestión moderna con roles y publicación por secciones.</p>
        </div>
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
      </div>
    );
  }

  const mapBySlug = noticias.reduce((acc, n) => {
    const s = n.seccionSlug || slugify(n.categoria || "otras");
    acc[s] = acc[s] ? [...acc[s], n] : [n];
    return acc;
  }, {});

  const slugsConocidos = new Set(secciones.map(s => s.slug));

  return (
    <div className="container mt-4">
      <div className="hero mb-4">
        <div className="kicker">Portal corporativo</div>
        <h1 className="mb-1">Noticias <span className="brand-gradient">corporativas</span></h1>
        <p className="muted mb-0">Explora publicaciones aprobadas por el equipo editorial.</p>
      </div>
      {msg && <div className="alert alert-info">{msg}</div>}

      {secciones.map(sec => {
        const lista = mapBySlug[sec.slug] || [];
        if (lista.length === 0) return null;
        return (
          <div key={sec.id} className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2 section-title">
              <span className="bar" />
              <h4 className="mb-0 flex-grow-1">{sec.nombre}</h4>
              <Link to={`/seccion/${sec.slug}`} className="btn btn-sm btn-outline-secondary">Ver más</Link>
            </div>
            <div className="row">
              {lista.map(n => (
                <div key={n.id} className="col-md-4 mb-3">
                  <div className="card h-100">
                    {n.imagen && <img src={n.imagen} alt={n.titulo} className="card-img-top" style={{height:180, objectFit:"cover"}}/>}
                    <div className="card-body d-flex flex-column">
                      <h6 className="card-title">{n.titulo}</h6>
                      <p className="text-muted small mb-2">{n.subtitulo || ""}</p>
                      <div className="d-flex gap-2 mb-2">
                        {n.categoria && (
                          <span className="chip"><span className="dot"/> {n.categoria}</span>
                        )}
                      </div>
                      <Link className="btn btn-sm btn-outline-primary mt-auto" to={`/noticia/${n.id}`}>Leer más</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {Object.keys(mapBySlug).some(sl => !slugsConocidos.has(sl)) && (
        <div className="mb-4">
          <div className="section-title"><span className="bar" /><h4 className="mb-0">Otras</h4></div>
          <div className="row">
            {Object.entries(mapBySlug)
              .filter(([sl]) => !slugsConocidos.has(sl))
              .flatMap(([, arr]) => arr)
              .map((n) => (
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
        </div>
      )}

      {noticias.length === 0 && <div className="alert alert-light border">Sin publicaciones.</div>}
    </div>
  );
}
