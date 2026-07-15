import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSignOutAlt,
    faImages,
    faUser,
    faComment,
    faEnvelope,
    faHome,
    faVideo,
    faStar,
    faBars,
    faTimes
} from '@fortawesome/free-solid-svg-icons';
import NotificationBell from '../Shared/NotificationBell';
import { API_URL } from '../../../config/api';

const Navbar = ({ user, activeSection, setActiveSection }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (section) => {
    setActiveSection(section);
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
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
      navigate('/login');
    }
  };

  const nombreCompleto = `${user.first_name} ${user.last_name}`;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <FontAwesomeIcon icon={menuOpen ? faTimes : faBars} />
        </button>
        <img src="logoPantone.jpg" className='navBarLogo' alt="logo" />
        <h2>Pantone Mercedes</h2>
      </div>

      <div className={`navbar-collapse ${menuOpen ? 'open' : ''}`}>
        <div className="navbar-menu">
            <button
            className={`nav-btn-client ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            <FontAwesomeIcon icon={faHome} />
            Home
          </button>
          <button
            className={`nav-btn-client ${activeSection === 'gallery' ? 'active' : ''}`}
            onClick={() => handleNavClick('gallery')}
          >
            <FontAwesomeIcon icon={faImages} />
            Mi Galería
          </button>

          <button
            className={`nav-btn-client ${activeSection === 'videos' ? 'active' : ''}`}
            onClick={() => handleNavClick('videos')}
          >
            <FontAwesomeIcon icon={faVideo} />
            Mis Videos
          </button>

          <button
            className={`nav-btn-client ${activeSection === 'comments' ? 'active' : ''}`}
            onClick={() => handleNavClick('comments')}
          >
            <FontAwesomeIcon icon={faComment} />
            Comentarios & Solicitudes
          </button>

          <button
            className={`nav-btn-client ${activeSection === 'reviews' ? 'active' : ''}`}
            onClick={() => handleNavClick('reviews')}
          >
            <FontAwesomeIcon icon={faStar} />
            Reseñas
          </button>

          <button
            className={`nav-btn-client ${activeSection === 'profile' ? 'active' : ''}`}
            onClick={() => handleNavClick('profile')}
          >
            <FontAwesomeIcon icon={faUser} />
            Mi Perfil
          </button>
        </div>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{nombreCompleto}</span>
          <span className="user-email">{user.email}</span>
        </div>
        <NotificationBell role="client" />
        <button className="logout-btn" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;