import React from 'react';

const Navbar = ({ user, activeSection, setActiveSection }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };
  const nombreCompleto = user.nombre+" " + user.apellido

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