import React, { useState, useEffect } from 'react';
import './ClientsSection.css';

const ClientsSection = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/getAllClients', {
        credentials: 'include'
      });
      const data = await response.json();
      setClients(data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando clientes...</div>;

  return (
    <div className="clients-section">
      <div className="section-header">
        <h2>Gestión de Clientes</h2>
        <div className='section-add-clients'>
          <button className='logout-btn'>Crear Cliente</button>
         <span>{clients.length} clientes encontrados</span>
         </div>
      </div>

      <table className="clients-table">
        <thead>
          <tr>
            <th>CLIENTE</th>
            <th>EMAIL</th>
            <th>TELÉFONO</th>
            <th>SERVICIO</th>
            <th>GALERÍA</th>
            <th>VIDEOS</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id} className='row-clients-table'>
              <td>{client.first_name} {client.last_name}</td>
              <td>{client.email}</td>
              <td>+{client.number || 'Sin teléfono'}</td>
              <td>{client.service || 'No especificado'}</td>
              <td>{client.has_gallery ? '✅' : '❌'}</td>
              <td>{client.videos_count || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsSection;
