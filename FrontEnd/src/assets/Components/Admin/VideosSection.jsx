import React, { useState, useEffect } from 'react';
import { useSearchFilter } from '../../hooks/useSearchFilter';
import SearchFilter from './SearchFilter'; // Cambiado - debe ser un componente
import CreateVideoModal from './CreateVideoModal';
import VideoCard from './VideoCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faVideo } from '@fortawesome/free-solid-svg-icons';
import './VideoSection.css';

const VideosSection = () => {
  const [allVideos, setAllVideos] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Hook de búsqueda simplificado - sin campos anidados por ahora
  const {
    filteredData: filteredVideos,
    searchTerm,
    handleSearch,
    clearSearch,
    totalItems,
    filteredCount,
    hasFilters
  } = useSearchFilter(allVideos, [
    'title',
    'service_type',
    'status',
    'description'
  ]);

  useEffect(() => {
    fetchVideos();
    fetchClients();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/getAllVideos', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener videos');
      }
      
      const data = await response.json();
      console.log(data)
      setAllVideos(data.videos || []);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setAllVideos([]);
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
      console.log(data)
      setAllClients(data.data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setAllClients([]);
    }
  };

  const handleVideoCreated = () => {
    fetchVideos();
    clearSearch();
  };

  const handleVideoUpdated = () => {
    fetchVideos();
  };

  const handleVideoDeleted = () => {
    fetchVideos();
  };

  if (loading) return <div className="loading">Cargando videos...</div>;

  return (
    <div className="videos-section">
      <div className="section-header">
        <h2>
          <FontAwesomeIcon icon={faVideo} className="section-icon" />
          Gestión de Videos
        </h2>
        <div className='section-add'>
          <button 
            className='btn-create-video' 
            onClick={() => setIsCreateModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Nuevo Video
          </button>
          <span>
            {hasFilters ? `${filteredCount} de ${totalItems}` : `${totalItems} videos encontrados`} 
          </span>
        </div>
      </div>

      {/* Componente SearchFilter - si no existe, lo creamos abajo */}
      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={handleSearch}
        onClear={clearSearch}
        placeholder="Buscar videos por título, servicio o estado..."
        resultsCount={filteredCount}
        totalCount={totalItems}
      />

      {/* Grid de videos */}
      <div className="videos-grid">
        {filteredVideos.map(video => (
          <VideoCard 
            key={video.id} 
            video={video}
            onUpdate={handleVideoUpdated}
            onDelete={handleVideoDeleted}
          />
        ))}
      </div>

      {/* Mensaje sin resultados */}
      {filteredCount === 0 && allVideos.length > 0 && (
        <div className="no-results">
          <p>No se encontraron videos que coincidan con "{searchTerm}"</p>
          <button onClick={clearSearch} className="clear-filters-btn">
            Limpiar búsqueda
          </button>
        </div>
      )}

      {allVideos.length === 0 && !loading && (
        <div className="no-results">
          <p>No hay videos creados</p>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-create-video"
          >
            Crear primer video
          </button>
        </div>
      )}

      <CreateVideoModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onVideoCreated={handleVideoCreated}
        clients={allClients}
      />
    </div>
  );
};

export default VideosSection;