import Navbar from './ClientNavbar';
import ClientProfile from './ClientProfile';
import Gallery from './ClientGallery';
import './Dashboard.css';
import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('gallery');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('http://localhost:3000/user/getUser', {
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
      case 'profile':
        return <ClientProfile user={user} />;
      case 'gallery':
      default:
        return <Gallery user={user} />;
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