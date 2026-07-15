import React, { useState, useEffect } from 'react';
import AdminNavbar from './AdminNavbar';
import ClientsSection from './ClientsSection';
import GalleriesSection from './Galery/GalleriesSection';
import VideosSection from './VideosSection';
import StatsSection from './StatsSection';
import PublicContent from './PublicContentManagement';
import AuditSection from './AuditSection';
import ProfileSection from './ProfileSection';
import SelectionsSection from './SelectionsSection';
import CommentsSection from './CommentsSection';
import RequestsSection from './RequestsSection';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightFromBracket, faBars } from '@fortawesome/free-solid-svg-icons';
import NotificationBell from '../Shared/NotificationBell';
import './AdminDashboard.css';
import { API_URL } from '../../../config/api';

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState('clients');
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch(`${API_URL}/user/getUser`, {
          credentials: 'include'
        });
        const data = await response.json();
        setAdminData(data.data);
        
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
      const response = await fetch(`${API_URL}/admin/dashboard-stats`, {
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
      case 'clients': return <ClientsSection setActiveSection={setActiveSection} />;
      case 'galleries': return <GalleriesSection />;
      case 'videos': return <VideosSection />; //
      case 'selections': return <SelectionsSection />;
      case 'comments': return <CommentsSection />;
      case 'requests': return <RequestsSection />;
      case 'audit': return <AuditSection />;
      case 'publicContent': return <PublicContent/> 
      case 'profile': return <ProfileSection adminData={adminData} onUpdated={(updated) => setAdminData(prev => ({ ...prev, ...updated }))} />;
      default: return <StatsSection />;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
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
          <button
            className="hamburger-btn"
            onClick={() => setSidebarOpen(prev => !prev)}
            aria-label="Abrir menú"
          >
            <FontAwesomeIcon icon={faBars} />
          </button>
          <img src="logoPantone.jpg" className="navBarLogo" alt="Logo" />
          <h1 className='top-navbar-title'>Panel Administrativo</h1>
        </div>
        <div className='navbar-user-actions'>
          {adminData &&
            <div className="user-info">
              <span className="user-name">{adminData.first_name} {adminData.last_name}</span>
              <span className="user-email">{adminData.email}</span>
            </div>
          }

          <NotificationBell role="admin" />

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
          isOpen={sidebarOpen}
          onNavigate={() => setSidebarOpen(false)}
        />

        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
        )}

        {/* Contenido principal */}
        <main className="admin-main">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;