// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { db } from "../services/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

export default function Dashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const [noticias, setNoticias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [view, setView] = useState("auto"); // auto|mias|todas

  const isEditor = userData?.rol === "editor";
  const isReportero = userData?.rol === "reportero";

  useEffect(() => {
    if (!userData) return;

    const cargar = async () => {
      setLoading(true);
      try {
        let snap;

        if (isReportero) {
          try {
            const q1 = query(
              collection(db, "noticias"),
              where("autorUid", "==", userData.uid),
              orderBy("fechaCreacion", "desc")
            );
            snap = await getDocs(q1);
          } catch (e) {
            if (e.code === "failed-precondition") {
              const q2 = query(
                collection(db, "noticias"),
                where("autorUid", "==", userData.uid)
              );
              snap = await getDocs(q2);
              setMensaje(
                "Falta índice para ordenar por fecha. Se está usando orden alterno."
              );
            } else {
              throw e;
            }
          }
        } else {
          const q = query(
            collection(db, "noticias"),
            orderBy("fechaCreacion", "desc")
          );
          snap = await getDocs(q);
        }

        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setNoticias(data);
      } catch (err) {
        console.error("Error cargando noticias:", err);
        setMensaje("No se pudieron cargar las noticias.");
      } finally {
        setLoading(false);
      }
    };

    cargar();
  }, [userData, isEditor, isReportero]);

  const eliminarNoticia = async (id) => {
    if (!window.confirm("¿Eliminar esta noticia?")) return;
    try {
      await deleteDoc(doc(db, "noticias", id));
      setNoticias((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      console.error(e);
      setMensaje("No se pudo eliminar.");
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await updateDoc(doc(db, "noticias", id), { estado });
      setNoticias((prev) =>
        prev.map((n) => (n.id === id ? { ...n, estado } : n))
      );
    } catch (e) {
      console.error(e);
      setMensaje("No se pudo actualizar el estado.");
    }
  };

  // KPIs
  const kpis = useMemo(() => {
    const total = noticias.length;
    const porEstado = (s) => noticias.filter((n) => (n.estado || "").trim() === s).length;
    return {
      total,
      publicados: porEstado("Publicado"),
      edicion: porEstado("Edición"),
      terminado: porEstado("Terminado"),
      desactivado: porEstado("Desactivado"),
    };
  }, [noticias]);

  // Filtros y búsqueda
  const filtered = useMemo(() => {
    let arr = [...noticias];
    // vista
    if (isEditor) {
      if (view === "mias") arr = arr.filter((n) => n.autorUid === userData?.uid);
      // view === "todas" mantiene arr igual
    } else {
      arr = arr.filter((n) => n.autorUid === userData?.uid);
    }
    // estado
    if (statusFilter !== "todos") arr = arr.filter((n) => (n.estado || "").trim() === statusFilter);
    // búsqueda simple en título, subtítulo y categoría
    const q = search.trim().toLowerCase();
    if (q) {
      arr = arr.filter((n) =>
        (n.titulo || "").toLowerCase().includes(q) ||
        (n.subtitulo || "").toLowerCase().includes(q) ||
        (n.categoria || "").toLowerCase().includes(q)
      );
    }
    // orden por fechaActualizacion o fechaCreacion desc (si existen)
    const ts = (x) => x?.seconds ? x.seconds : x?.toMillis ? x.toMillis() : 0;
    arr.sort((a,b) => (ts(b.fechaActualizacion)||ts(b.fechaCreacion)) - (ts(a.fechaActualizacion)||ts(a.fechaCreacion)));
    return arr;
  }, [noticias, search, statusFilter, view, isEditor, userData]);

  if (loading) return <p className="text-center mt-5">Cargando noticias...</p>;

  const StatusBadge = ({ estado }) => {
    const key = (estado || "").toLowerCase();
    const cls =
      key === "publicado" ? "status-publicado" :
      key === "edición" ? "status-edicion" :
      key === "terminado" ? "status-terminado" :
      "status-desactivado";
    return <span className={`badge ${cls}`}>{estado}</span>;
  };

  return (
    <div className="container mt-4">
      <div className="dashboard-hero mb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
        <div>
          <div className="kicker">Panel</div>
          <h3 className="mb-0">Administración · {userData?.rol}</h3>
        </div>
        {(isEditor || isReportero) && (
          <button className="btn btn-success" onClick={() => navigate("/crear-noticia")}>Nueva noticia</button>
        )}
      </div>

      {mensaje && <div className="alert alert-warning">{mensaje}</div>}

      {/* KPIs */}
      <div className="row g-3 mb-3">
        <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-kpi">{kpis.total}</div><div className="stat-label">Total</div></div></div>
        <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-kpi">{kpis.publicados}</div><div className="stat-label">Publicadas</div></div></div>
        <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-kpi">{kpis.terminado}</div><div className="stat-label">Terminadas</div></div></div>
        <div className="col-6 col-md-3"><div className="stat-card"><div className="stat-kpi">{kpis.edicion}</div><div className="stat-label">En edición</div></div></div>
      </div>

      {/* Toolbar de filtros */}
      <div className="toolbar mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-6">
            <input className="form-control" placeholder="Buscar por título, subtítulo o categoría" value={search} onChange={(e)=>setSearch(e.target.value)} />
          </div>
          <div className="col-6 col-md-3">
            <select className="form-select" value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)}>
              <option value="todos">Todos los estados</option>
              <option value="Publicado">Publicado</option>
              <option value="Terminado">Terminado</option>
              <option value="Edición">Edición</option>
              <option value="Desactivado">Desactivado</option>
            </select>
          </div>
          {isEditor && (
            <div className="col-6 col-md-3">
              <select className="form-select" value={view} onChange={(e)=>setView(e.target.value)}>
                <option value="auto">Todas</option>
                <option value="mias">Mis noticias</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="alert alert-light border">No se encontraron noticias con los filtros aplicados.</div>
      ) : (
        <div className="row">
          {filtered.map((n) => (
            <div key={n.id} className="col-md-4 mb-3">
              <div className="card h-100 shadow-sm">
                {n.imagen && (
                  <img src={n.imagen} alt={n.titulo} className="card-img-top" style={{ height: 180, objectFit: "cover" }} />
                )}
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <h5 className="card-title mb-0" style={{marginRight:8}}>{n.titulo}</h5>
                    <StatusBadge estado={n.estado} />
                  </div>
                  <div className="meta mb-2">
                    <span className="me-2">{n.categoria}</span>
                    {isEditor && <span>· Autor: {n.autorNombre}</span>}
                  </div>

                  <div className="mt-auto d-flex flex-wrap gap-2">
                    {(isEditor || n.autorUid === userData?.uid) && (
                      <button className="btn btn-sm btn-outline-primary" onClick={() => navigate(`/editar-noticia/${n.id}`)}>Editar</button>
                    )}
                    {(isEditor || n.autorUid === userData?.uid) && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarNoticia(n.id)}>Eliminar</button>
                    )}
                    {isEditor ? (
                      <>
                        <button className="btn btn-sm btn-success" onClick={() => cambiarEstado(n.id, "Publicado")}>Publicar</button>
                        <button className="btn btn-sm btn-warning" onClick={() => cambiarEstado(n.id, "Terminado")}>Terminado</button>
                        <button className="btn btn-sm btn-secondary" onClick={() => cambiarEstado(n.id, "Desactivado")}>Desactivar</button>
                      </>
                    ) : n.autorUid === userData?.uid ? (
                      <button className="btn btn-sm btn-warning" onClick={() => cambiarEstado(n.id, "Terminado")}>Marcar como Terminado</button>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
