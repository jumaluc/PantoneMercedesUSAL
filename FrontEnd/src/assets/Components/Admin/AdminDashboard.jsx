import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import ClientsSection from './ClientsSection';
import GalleriesSection from './Galery/GalleriesSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
faArrowRightFromBracket
} from '@fortawesome/free-solid-svg-icons';

import './AdminDashboard.css';


const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('clients');
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('http://localhost:3000/user/getUser', {
          credentials: 'include'
        });
        const data = await response.json();
        console.log(data.data)
        setAdminData(data.data);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const renderSection = () => {
    if (loading) return <div className="loading">Cargando...</div>;

    switch (activeSection) {
      case 'clients': return <ClientsSection />;
      case 'galleries': return <GalleriesSection />;
      case 'videos': return <VideosSection />;
      case 'comments': return <CommentsSection />;
      case 'audit': return <AuditSection />;
      case 'stats': return <StatsSection />;
      case 'profile': return <ProfileSection adminData={adminData} />;
      default: return <ClientsSection />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Barra superior */}
      <header className="top-navbar">
        <div className='container-logo-titulo'>
          <img src="logoPantone.jpg" className="navBarLogo" alt="Logo" />
          <h1 className='top-navbar-title'>Panel Administrativo</h1>
        </div>
        <div className='container-logo-titulo'>
                  {adminData &&         
                    <div className="user-info">
                      <span className="user-name">{adminData.first_name} {adminData.last_name}</span>
                      <span className="user-email">{adminData.email}</span>
                  </div>}

                  <FontAwesomeIcon    className='logoutFontIcon'       
                  onClick={() => {
                    fetch('http://localhost:3000/auth/logout', {
                      method: 'POST',
                      credentials: 'include'
                    }).then(() => window.location.href = '/login');
                  }} icon={faArrowRightFromBracket} />
        </div>
      </header>

      <div className="dashboard-body">
        {/* Barra lateral */}
        <AdminNavbar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          adminData={adminData}
        />

        {/* Contenido principal */}
        <main className="admin-main">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
