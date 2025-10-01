import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import ClientsSection from './ClientsSection';
import GalleriesSection from './Galery/GalleriesSection';
import StatsSection from './StatsSection'; // Nuevo componente
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('stats'); // Cambiado a stats por defecto
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('http://localhost:3000/user/getUser', {
          credentials: 'include'
        });
        const data = await response.json();
        setAdminData(data.data);
        
        // Cargar estadísticas del dashboard
        await fetchDashboardStats();
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/dashboard-stats', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setDashboardStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const renderSection = () => {
    if (loading) return <div className="admin-loading">Cargando...</div>;

    switch (activeSection) {
      case 'stats': return <StatsSection />;
      case 'clients': return <ClientsSection />;
      case 'galleries': return <GalleriesSection />;
      case 'audit': return <AuditSection />;
      case 'profile': return <ProfileSection adminData={adminData} />;
      default: return <StatsSection />;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:3000/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      window.location.href = '/login';
    } catch (error) {
      console.error('Error during logout:', error);
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

            </div>
          }

          <FontAwesomeIcon 
            className='logoutFontIcon'       
            onClick={handleLogout} 
            icon={faArrowRightFromBracket} 
          />
        </div>
      </header>

      <div className="dashboard-body">
        {/* Barra lateral */}
        <AdminNavbar 
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          adminData={adminData}
          dashboardStats={dashboardStats}
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