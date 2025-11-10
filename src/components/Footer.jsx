// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-4">
            <h6 className="mb-2" style={{letterSpacing:'.02em'}}>CMS Noticias</h6>
            <p className="mb-2 muted">Plataforma de gestión y publicación de noticias corporativas con flujos de aprobación por rol.</p>
            <p className="mb-2 muted">Proyecto final para Programación Web</p>
            <div className="small muted">© {year} · Todos los derechos reservados.</div>
          </div>

          <div className="col-6 col-md-2">
            <h6 className="mb-2">Secciones</h6>
            <ul className="list-unstyled mb-0">
              <li><a href="/" className="text-decoration-none">Inicio</a></li>
              <li><a href="/secciones" className="text-decoration-none">Administrar secciones</a></li>
              <li><a href="/dashboard" className="text-decoration-none">Dashboard</a></li>
            </ul>
          </div>

          <div className="col-6 col-md-3">
            <h6 className="mb-2">Contacto</h6>
            <ul className="list-unstyled mb-0 small">
              <li className="mb-1">Email: wilmerrector@udla.edu.co</li>
              <li className="mb-1">Tel: (+57) 310 317 1050</li>
              <li className="mb-1">Dirección: Florencia, Caquetá</li>
            </ul>
          </div>

          <div className="col-12 col-md-3">
            <h6 className="mb-2">Legal</h6>
            <ul className="list-unstyled mb-0 small">
              <li><a href="#" className="text-decoration-none">Política de privacidad</a></li>
              <li><a href="#" className="text-decoration-none">Términos y condiciones</a></li>
              <li><a href="#" className="text-decoration-none">Cookies</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
