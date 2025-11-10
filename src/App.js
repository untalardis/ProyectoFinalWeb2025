// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

// Público
import Home from "./pages/Home";
import Noticia from "./pages/Noticia";
import Seccion from "./pages/Seccion";

// Privado
import Dashboard from "./pages/Dashboard";
import CrearNoticia from "./pages/CrearNoticia";
import EditarNoticia from "./pages/EditarNoticia";
import Secciones from "./pages/Secciones";   // <— NUEVO

// Auth
import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Público */}
        <Route path="/" element={<Home />} />
        <Route path="/seccion/:slug" element={<Seccion />} />
        <Route path="/noticia/:id" element={<Noticia />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Privadas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/crear-noticia"
          element={
            <ProtectedRoute>
              <CrearNoticia />
            </ProtectedRoute>
          }
        />
        <Route
          path="/editar-noticia/:id"
          element={
            <ProtectedRoute>
              <EditarNoticia />
            </ProtectedRoute>
          }
        />

        {/* Admin de secciones (solo EDITOR) */}
        <Route
          path="/secciones"
          element={
            <ProtectedRoute onlyRole="editor">
              <Secciones />
            </ProtectedRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
