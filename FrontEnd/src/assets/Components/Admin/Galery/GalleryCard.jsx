import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faEdit, faTrash, faEye, faImage } from '@fortawesome/free-solid-svg-icons';
import './GalleriesSection.css';

const GalleryCard = ({ gallery, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('¿Eliminar esta galería?')) {
      try {
        const response = await fetch(`http://localhost:3000/admin/galleries/${gallery.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
          alert('Galería eliminada');
          onUpdate();
        }
      } catch (error) {
        console.error('Error deleting gallery:', error);
      }
    }
    setShowMenu(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className="gallery-card">
      <div className="gallery-image">
        {gallery.cover_image ? (
          <img 
            src={`http://localhost:3000${gallery.cover_image}`} 
            alt={gallery.title}
            onError={(e) => {
              e.target.src = '/placeholder-image.jpg';
            }}
          />
        ) : (
          <div className="no-image">
            <FontAwesomeIcon icon={faImage} size="3x" />
            <span>Sin imagen principal</span>
          </div>
        )}
        <div className="gallery-status">
          <span className={`status-badge ${gallery.status}`}>
            {gallery.status}
          </span>
        </div>
      </div>

      <div className="gallery-content">
        <h3 className="gallery-title">{gallery.title}</h3>
        
        <div className="gallery-info">
          <div className="info-item">
            <strong>Cliente:</strong>
            <span>{gallery.client_name} {gallery.client_last_name}</span>
          </div>
          
          <div className="info-item">
            <strong>Servicio:</strong>
            <span>{gallery.service_type}</span>
          </div>
          
          <div className="info-item">
            <strong>Fotos:</strong>
            <span>{gallery.photos_count} imágenes</span>
          </div>
          
          <div className="info-item">
            <strong>Creación:</strong>
            <span>{formatDate(gallery.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="gallery-actions">
        <button 
          className="action-toggle"
          onClick={() => setShowMenu(!showMenu)}
        >
          <FontAwesomeIcon icon={faEllipsisV} />
        </button>

        {showMenu && (
          <div className="action-menu">
            <button className="action-btn view-btn">
              <FontAwesomeIcon icon={faEye} />
              Ver Galería
            </button>
            <button className="action-btn edit-btn">
              <FontAwesomeIcon icon={faEdit} />
              Editar
            </button>
            <button 
              className="action-btn delete-btn"
              onClick={handleDelete}
            >
              <FontAwesomeIcon icon={faTrash} />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryCard;