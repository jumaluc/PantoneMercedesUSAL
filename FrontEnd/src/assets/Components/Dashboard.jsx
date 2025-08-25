import Navbar from './Navbar';
import ClientProfile from './ClientProfile';
import Gallery from './Gallery';
import '../Styles/Dashboard.css';
import React, { useState, useEffect } from 'react';
const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('gallery');
    const [user, setUser] = useState(null);
    
    useEffect(() => {
        
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
        console.log(userData)
        setUser(userData);
        }
    }, []);

  if (!user) {
    return <div>Cargando...</div>;
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