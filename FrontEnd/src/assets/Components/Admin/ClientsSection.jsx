import React, { useState, useEffect, useRef } from 'react';
import './ClientsSection.css';
import CreateClientModal from './CreateClientModal';
import EditClientModal from './EditClientModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faEllipsisV, faSort, faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';
import { useSearchFilter } from '../../hooks/useSearchFilter'; 
import SearchFilter from './SearchFilter'; 
import { toast } from "react-toastify";
import Swal from 'sweetalert2';

const ClientsSection = () => {
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);

  const {
    filteredData: filteredClients,
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    clearSearch,
    totalItems,
    filteredCount,
    hasFilters
  } = useSearchFilter(allClients, [
    'first_name', 
    'last_name', 
    'email', 
    'service', 
    'number'
  ]);

  useEffect(() => {
    fetchClients();
  }, []);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenu && menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeMenu]);

  const fetchClients = async () => {
    try {
      console.log
      const response = await fetch('http://localhost:3000/admin/getAllClients', {
        credentials: 'include'
      });
      const data = await response.json();
      setAllClients(data.data || []); // 👈 Guardar en allClients
    } catch (error) {
      console.error('Error fetching clients:', error);
      setAllClients([]); // 👈 En caso de error, array vacío
    } finally {
      setLoading(false);
    }
  };

  const handleClientCreated = () => {
    fetchClients();
    clearSearch();
  };

  const handleClientUpdated = () => {
    fetchClients();
    setIsEditModalOpen(false);
    setSelectedClient(null);
  };

  // Función para obtener ícono de ordenamiento
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return faSort;
    return sortConfig.direction === 'ascending' ? faSortUp : faSortDown;
  };

  // Función para obtener clase de ordenamiento
  const getSortClass = (columnKey) => {
    if (sortConfig.key !== columnKey) return '';
    return sortConfig.direction === 'ascending' ? 'sort-asc' : 'sort-desc';
  };

 const handleEditClick = (client, e) => {
  e.stopPropagation();
  console.log("Cliente a editar:", client);
  setSelectedClient(client); 
  setIsEditModalOpen(true);
  setActiveMenu(null);
};

const handleDeleteClick = async (clientId, e) => {
  e.stopPropagation();
  
  // 1. Confirmación de eliminación
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: "¡No podrás revertir esta acción!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, eliminar!',
    cancelButtonText: 'Cancelar',
    background: '#fff',
    customClass: {
      popup: 'custom-swal-popup'
    }
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(`http://localhost:3000/admin/deleteClient/${clientId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        await Swal.fire({
          title: '¡Eliminado!',
          text: 'El cliente ha sido eliminado correctamente',
          icon: 'success',
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'Aceptar',
          background: '#fff',
          customClass: {
            popup: 'custom-swal-popup'
          }
        });
        
        fetchClients(); 
        
      } else {
        const errorData = await response.json();
        await Swal.fire({
          title: 'Error',
          text: errorData.message || 'Error al eliminar el cliente',
          icon: 'error',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Entendido',
          background: '#fff',
          customClass: {
            popup: 'custom-swal-popup'
          }
        });
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      await Swal.fire({
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor',
        icon: 'error',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Entendido',
        background: '#fff',
        customClass: {
          popup: 'custom-swal-popup'
        }
      });
    }
  }
  
  setActiveMenu(null);
};

  const toggleMenu = (clientId, e) => {
    e.stopPropagation();
    
    // Calcular posición exacta para el menú fixed
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + window.scrollY,
      left: rect.right + window.scrollX - 160 // Ajustar ancho del menú
    });
    
    setActiveMenu(activeMenu === clientId ? null : clientId);
  };

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
          <span>
            {`${allClients.length} clientes encontrados`}
          </span>
        </div>
      </div>

      {/* 🔍 COMPONENTE DE BÚSQUEDA */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onClear={clearSearch}
        placeholder="Buscar clientes por nombre, email, teléfono o servicio..."
        resultsCount={filteredCount}
        totalCount={totalItems}
      />

      <table className="clients-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('first_name')} className="sortable-header">
              <span>CLIENTE</span>
              <FontAwesomeIcon 
                icon={getSortIcon('first_name')} 
                className={`sort-icon ${getSortClass('first_name')}`}
              />
            </th>
            <th onClick={() => handleSort('email')} className="sortable-header">
              <span>EMAIL</span>
              <FontAwesomeIcon 
                icon={getSortIcon('email')} 
                className={`sort-icon ${getSortClass('email')}`}
              />
            </th>
            <th onClick={() => handleSort('number')} className="sortable-header">
              <span>TELÉFONO</span>
              <FontAwesomeIcon 
                icon={getSortIcon('number')} 
                className={`sort-icon ${getSortClass('number')}`}
              />
            </th>
            <th onClick={() => handleSort('service')} className="sortable-header">
              <span>SERVICIO</span>
              <FontAwesomeIcon 
                icon={getSortIcon('service')} 
                className={`sort-icon ${getSortClass('service')}`}
              />
            </th>
            <th>GALERÍA</th>
            <th>VIDEOS</th>
            <th onClick={() => handleSort('created_at')} className="sortable-header">
              <span>FECHA</span>
              <FontAwesomeIcon 
                icon={getSortIcon('created_at')} 
                className={`sort-icon ${getSortClass('created_at')}`}
              />
            </th>
            <th>COMENTARIOS</th>
            <th>ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map(client => ( // 👈 Usar filteredClients en lugar de clients
            <tr key={client.id} className='row-clients-table'>
              <td>{client.first_name} {client.last_name}</td>
              <td>{client.email}</td>
              <td>+{client.number || 'Sin teléfono'}</td>
              <td>{client.service || 'No especificado'}</td>
              <td>
                <span className={`count-badge${client.galleries_count > 0 ? ' count-badge--active' : ''}`}>
                  {client.galleries_count || 0}
                </span>
              </td>
              <td>{client.videos_count || 0}</td>
              <td>
                {client.created_at ? 
                  new Date(client.created_at).toLocaleDateString() : 
                  'Sin fecha'
                }
              </td>
              <td>
                <span className={`count-badge${client.comments_count > 0 ? ' count-badge--comments' : ''}`}>
                  {client.comments_count || 0}
                </span>
              </td>
              <td>
                <div className="actions-container">
                  <button 
                    className="actions-toggle"
                    onClick={(e) => toggleMenu(client.id, e)}
                  >
                    <FontAwesomeIcon icon={faEllipsisV} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔥 MENÚ FUERA DE LA TABLA - POSICIÓN FIXED */}
      {activeMenu && (
        <div 
          ref={menuRef}
          className="actions-menu"
          style={{
            top: menuPosition.top,
            left: menuPosition.left
          }}
        >
          <button 
            className="action-btn edit-btn"
            onClick={(e) => handleEditClick(filteredClients.find(c => c.id === activeMenu), e)}
          >
            <FontAwesomeIcon icon={faEdit} />
            Editar Perfil
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={(e) => handleDeleteClick(activeMenu, e)}
          >
            <FontAwesomeIcon icon={faTrash} />
            Eliminar Perfil
          </button>
        </div>
      )}

      {/* Mensaje cuando no hay resultados */}
      {filteredCount === 0 && allClients.length > 0 && (
        <div className="no-results">
          <p>No se encontraron clientes que coincidan con "{searchTerm}"</p>
          <button onClick={clearSearch} className="clear-filters-btn">
            Limpiar búsqueda
          </button>
        </div>
      )}

      {/* Mensaje cuando no hay clientes */}
      {allClients.length === 0 && !loading && (
        <div className="no-results">
          <p>No hay clientes registrados</p>
        </div>
      )}

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


