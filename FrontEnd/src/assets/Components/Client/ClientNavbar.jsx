import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faImages, faUser, faComment, faEnvelope } from '@fortawesome/free-solid-svg-icons';

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
      navigate('/login');
    }
  };

  const nombreCompleto = `${user.first_name} ${user.last_name}`;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <img src="logoPantone.jpg" className='navBarLogo' alt="logo" />
        <h2>Pantone Mercedes</h2>
      </div>
              
      <div className="navbar-menu">
        <button 
          className={`nav-btn-client ${activeSection === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveSection('gallery')}
        >
          <FontAwesomeIcon icon={faImages} />
          Mi Galería
        </button>
        
        <button 
          className={`nav-btn-client ${activeSection === 'comments' ? 'active' : ''}`}
          onClick={() => setActiveSection('comments')}
        >
          <FontAwesomeIcon icon={faComment} />
          Comentarios & Solicitudes
        </button>
        
        <button 
          className={`nav-btn-client ${activeSection === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveSection('profile')}
        >
          <FontAwesomeIcon icon={faUser} />
          Mi Perfil
        </button>
      </div>

      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{nombreCompleto}</span>
          <span className="user-email">{user.email}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <FontAwesomeIcon icon={faSignOutAlt} />
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
};

export default Navbar;