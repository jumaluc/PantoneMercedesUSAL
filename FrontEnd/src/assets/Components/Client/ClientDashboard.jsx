import Navbar from './ClientNavbar';
import ClientProfile from './ClientProfile';
import Gallery from './ClientGallery';
import ClientCommentsAndRequests from './ClientCommentsAndRequests';
import ClientVideosSection from './ClientVideosSection';
import ClientReviews from './ClientReviews';
import './Dashboard.css';
import React, { useState, useEffect } from 'react';
import PublicContent from '../PublicWebsite/PublicLayout'
import { API_URL } from '../../../config/api';
const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('gallery');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${API_URL}/user/getUser`, {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const userData = await response.json(); 
        setUser(userData.data);

      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  if (!user) {
    return <div className="error">No se pudo cargar la información del usuario</div>;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'home':
        return <PublicContent hideLogin={true} />
      case 'profile':
        return <ClientProfile user={user} setUser={setUser} />;
      case 'comments':
        return <ClientCommentsAndRequests user={user} />;
      case 'videos':
        return <ClientVideosSection user={user} />;
      case 'reviews':
        return <ClientReviews user={user} />;
      case 'gallery':
      default:
        return <Gallery user={user} setActiveSection={setActiveSection} />;
    }
  };

  return (
    <div className="dashboard-container">
      <Navbar 
        user={user} 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <main className="dashboard-main">
        {renderSection()}
      </main>
    </div>
  );
};

export default Dashboard;