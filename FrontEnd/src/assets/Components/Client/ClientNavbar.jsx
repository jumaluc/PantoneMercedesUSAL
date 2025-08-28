import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";

const Navbar = ({ user, activeSection, setActiveSection }) => {
    const navigate = useNavigate();
    const handleLogout = async () => {
      try {
        const response = await fetch('http://localhost:3000/auth/logout', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          navigate('/login');
          
          toast.success('Sesión cerrada correctamente');
        } else {
          throw new Error('Error en el logout');
        }
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        toast.error('Error al cerrar sesión');
        
        // ✅ Redirigir igualmente por si acaso
        navigate('/login');
      }
    };
  const nombreCompleto = user.first_name+" " + user.last_name

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>Pantone Mercedes</h2>
      </div>
      
      <div className="navbar-menu">
        <button 
          className={`nav-btn ${activeSection === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveSection('gallery')}
        >
          Mi Galería
        </button>
        
        <button 
          className={`nav-btn ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          Mi Perfil
        </button>
      </div>

      <div className="navbar-user">
        <div className="user-info">
            <span className="user-name">{nombreCompleto}</span>
          <span className="user-email">{user.email}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;