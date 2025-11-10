// src/pages/Noticia.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../services/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Noticia() {
  const { id } = useParams();
  const [n, setN] = useState(null);

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "noticias", id));
      if (snap.exists()) setN(snap.data());
    })();
  }, [id]);

  if (!n) {
    return (
      <div className="container mt-4">
        <div className="skeleton skeleton-text w-25 mb-2" />
        <div className="skeleton skeleton-text w-50 mb-4" />
        <div className="skeleton skeleton-img mb-3" style={{height:260}} />
        <div className="skeleton skeleton-text w-100 mb-2" />
        <div className="skeleton skeleton-text w-100 mb-2" />
        <div className="skeleton skeleton-text w-75" />
      </div>
    );
  }
  if (n.estado !== "Publicado") return <p className="text-center mt-5">No disponible.</p>;

  return (
    <div className="container mt-4">
      <div className="article-header mb-3">
        <h2 className="mb-1">{n.titulo}</h2>
        <p className="text-muted">{n.subtitulo}</p>
        {n.imagen && <img src={n.imagen} alt={n.titulo} className="img-fluid mb-3" />}
        <div className="article-meta">Categoría: {n.categoria} · Autor: {n.autorNombre}</div>
      </div>
      <div className="article-content" dangerouslySetInnerHTML={{__html: n.contenido}} />
    </div>
  );
}
