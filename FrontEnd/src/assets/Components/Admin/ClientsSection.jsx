// ClientsSection.jsx
import React, { useState, useEffect } from 'react';
import './ClientsSection.css';
import CreateClientModal from './CreateClientModal';
import EditClientModal from './EditClientModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEllipsisV } from '@fortawesome/free-solid-svg-icons';

const ClientsSection = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);

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

  const handleClientCreated = () => fetchClients();

  const handleClientUpdated = () => {
    fetchClients();
    setIsEditModalOpen(false);
    setSelectedClient(null);
  };

  const handleEditClick = (client) => {
    setSelectedClient(client);
    setIsEditModalOpen(true);
    setActiveMenu(null);
  };

  const handleDeleteClick = async (clientId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        const response = await fetch(`http://localhost:3000/admin/deleteClient/${clientId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          alert('Cliente eliminado exitosamente');
          fetchClients();
        } else {
          alert('Error al eliminar el cliente');
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error de conexión');
      }
    }
    setActiveMenu(null);
  };

  const toggleMenu = (clientId) => {
    setActiveMenu(activeMenu === clientId ? null : clientId);
  };

  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  if (loading) return <div className="loading">Cargando clientes...</div>;

  return (
    <div className="clients-section">
      <div className="section-header">
        <h2>Gestión de Clientes</h2>
        <div className='section-add-clients'>
          <button 
            className='btn-create-client' 
            onClick={() => setIsModalOpen(true)}
          >
            + Crear Cliente
          </button>
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
            <th>FECHA</th>
            <th>COMENTARIOS</th>
            <th>ACCIONES</th>
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
              <td>
                {client.created_at ? 
                  new Date(client.created_at).toLocaleDateString() : 
                  'Sin fecha'
                }
              </td>
              <td>0</td>
              <td>
                <div className="actions-container">
                  <button 
                    className="actions-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMenu(client.id);
                    }}
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                  
                  {activeMenu === client.id && (
                    <div className="actions-menu" onClick={(e) => e.stopPropagation()}>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditClick(client)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                        Editar Perfil
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteClick(client.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                        Eliminar Perfil
                      </button>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <CreateClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClientCreated={handleClientCreated}
      />

      <EditClientModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedClient(null);
        }}
        onClientUpdated={handleClientUpdated}
        client={selectedClient}
      />
    </div>
  );
};

export default ClientsSection;
