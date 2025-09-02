import React, { useState, useEffect } from 'react';
import { useSearchFilter } from '../../../hooks/useSearchFilter';
import SearchFilter from '../SearchFilter';
import CreateGalleryModal from './CreateGalleryModal';
import GalleryCard from './GalleryCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faImages } from '@fortawesome/free-solid-svg-icons';
import './GalleriesSection.css';

const GalleriesSection = () => {
  const [allGalleries, setAllGalleries] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Hook de búsqueda
  const {
    filteredData: filteredGalleries,
    searchTerm,
    handleSearch,
    sortConfig,
    handleSort,
    clearSearch,
    totalItems,
    filteredCount,
    hasFilters
  } = useSearchFilter(allGalleries, [
    'client.first_name',    // Cambiado para buscar en el objeto client
    'client.last_name',     // Cambiado para buscar en el objeto client  
    'title',
    'service_type',
    'status'
  ]);

  useEffect(() => {
    fetchGalleries();
    fetchClients();
  }, []);

  
  const fetchGalleries = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/getAllGalleries', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener galerías');
      }
      
      const data = await response.json();
      // El backend devuelve directamente el array, no data.data
      setAllGalleries(data || []);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      setAllGalleries([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/getAllClients', {
        credentials: 'include'
      });
      const data = await response.json();
      setAllClients(data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setAllClients([]);
    }
  };

  const handleGalleryCreated = () => {
    fetchGalleries();
    clearSearch();
  };

  if (loading) return <div className="loading">Cargando galerías...</div>;

  return (
    <div className="galleries-section">
      <div className="section-header">
        <h2>
          <FontAwesomeIcon icon={faImages} className="section-icon" />
          Gestión de Galerías
        </h2>
        <div className='section-add'>
          <button 
            className='btn-create-gallery' 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Nueva Galería
          </button>
          <span>
            {hasFilters ? `${filteredCount} de ${totalItems}` : totalItems} 
            galerías encontradas
          </span>
        </div>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onClear={clearSearch}
        placeholder="Buscar galerías por cliente, título o servicio..."
        resultsCount={filteredCount}
        totalCount={totalItems}
      />

      {/* Grid de galerías */}
      <div className="galleries-grid">
        {filteredGalleries.map(gallery => (
          <GalleryCard 
            key={gallery.id} 
            gallery={gallery}
            onUpdate={fetchGalleries}
          />
        ))}
      </div>

      {/* Mensaje sin resultados */}
      {filteredCount === 0 && allGalleries.length > 0 && (
        <div className="no-results">
          <p>No se encontraron galerías que coincidan con "{searchTerm}"</p>
          <button onClick={clearSearch} className="clear-filters-btn">
            Limpiar búsqueda
          </button>
        </div>
      )}

      {allGalleries.length === 0 && !loading && (
        <div className="no-results">
          <p>No hay galerías creadas</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-create-gallery"
          >
            Crear primera galería
          </button>
        </div>
      )}

      <CreateGalleryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGalleryCreated={handleGalleryCreated}
        clients={allClients}
      />
    </div>
  );
};

export default GalleriesSection;