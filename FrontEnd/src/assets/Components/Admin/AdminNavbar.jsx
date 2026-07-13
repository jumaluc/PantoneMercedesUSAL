import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPeopleGroup,
  faImages,
  faVideo,
  faComments,
  faHistory,
  faChartBar,
  faUserGear,
  faCheckCircle,
  faEnvelope,
  faGlobe
} from '@fortawesome/free-solid-svg-icons';

const AdminNavbar = ({ activeSection, setActiveSection, adminData, isOpen, onNavigate }) => {
  const navItems = [
    { id: 'stats',         label: 'Estadísticas', icon: faChartBar },
    { id: 'clients',       label: 'Clientes',     icon: faPeopleGroup },
    { id: 'galleries',     label: 'Galerías',     icon: faImages },
    { id: 'videos',        label: 'Videos',       icon: faVideo },
    { id: 'selections',    label: 'Selecciones',  icon: faCheckCircle },
    { id: 'comments',      label: 'Comentarios',  icon: faComments },
    { id: 'requests',      label: 'Solicitudes',  icon: faEnvelope },
    { id: 'audit',         label: 'Historial',    icon: faHistory },
    { id: 'publicContent', label: 'Public',       icon: faGlobe },
    { id: 'profile',       label: 'Perfil',       icon: faUserGear },
  ];

  return (
    <nav className={`admin-navbar ${isOpen ? 'open' : ''}`}>
      <div className="nav-items">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => {
              setActiveSection(item.id);
              onNavigate && onNavigate();
            }}
          >
            <span className="nav-icon">
              <FontAwesomeIcon icon={item.icon} className='item-icon' />
            </span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="navbar-footer">
      </div>
    </nav>
  );
};

export default AdminNavbar;