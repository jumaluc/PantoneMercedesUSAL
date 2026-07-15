import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV, faEdit, faTrash, faEye, faImage } from '@fortawesome/free-solid-svg-icons';
import './GalleriesSection.css';
import Swal from 'sweetalert2';
import EditGalleryModal from './EditGalleryModal';
import ViewGalleryModal from './ViewGalleryModal';
import { API_URL } from '../../../../config/api';

const GalleryCard = ({ gallery, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleDelete = async () => {

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
      })
    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/admin/deleteGallery/${gallery.id}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        
        if (response.ok) {
                  await Swal.fire({
                    title: '¡Eliminado!',
                    text: 'La galeria ha sido eliminada correctamente',
                    icon: 'success',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Aceptar',
                    background: '#fff',
                    customClass: {
                      popup: 'custom-swal-popup'
                    }
                  });
          onUpdate();
        }
      } catch (error) {
                const errorData = await response.json();
                await Swal.fire({
                  title: 'Error',
                  text: errorData.message || 'Error al eliminar la galeria',
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
    setShowMenu(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Obtener el nombre del cliente de la nueva estructura
  const getClientName = () => {
    if (gallery.client) {
      return `${gallery.client.first_name || ''} ${gallery.client.last_name || ''}`.trim();
    }
    // Fallback por si acaso (debería venir siempre el cliente)
    return gallery.client_name || 'Cliente no disponible';
  };

  // Obtener el email del cliente
  const getClientEmail = () => {
    if (gallery.client) {
      return gallery.client.email || '';
    }
    return '';
  };

  return (
    <>
    <div className="gallery-card">
      <div className="gallery-image">
        {gallery.cover_image_url ? (
          <img 
            src={gallery.cover_image_url} 
            alt={'Imagen no encontrada'}
      
          />
        ) : (
          <div className="no-image">
            <FontAwesomeIcon icon={faImage} size="3x" />
            <span>Sin imagen principal</span>
          </div>
        )}
        <div className="gallery-status">
          <span className={`status-badge ${gallery.status}`}>
            {gallery.status === 'active' ? 'Activa' : 
             gallery.status === 'inactive' ? 'Inactiva' : 'Borrador'}
          </span>
        </div>
      </div>

      <div className="gallery-content">
        <h3 className="gallery-title">{gallery.title}</h3>
        
        <div className="gallery-info">
          <div className="info-item">
            <strong>Cliente:</strong>
            <span>{getClientName()}</span>
          </div>
          
          {getClientEmail() && (
            <div className="info-item">
              <strong>Email:</strong>
              <span>{getClientEmail()}</span>
            </div>
          )}
          
          <div className="info-item">
            <strong>Servicio:</strong>
            <span>{gallery.service_type}</span>
          </div>
          
          <div className="info-item">
            <strong>Fotos:</strong>
            <span>{gallery.photos_count || 0} imágenes</span>
          </div>
          
          <div className="info-item">
            <strong>Creación:</strong>
            <span>{formatDate(gallery.created_at)}</span>
          </div>
        </div>
      </div>

      <div className="gallery-actions" ref={menuRef}>
        <button
          className="action-toggle"
          onClick={() => setShowMenu(!showMenu)}
        >
          <FontAwesomeIcon icon={faEllipsisV} />
        </button>

        {showMenu && (
          <div className="action-menu">
            <button className="action-btn view-btn" onClick={() => { setShowViewModal(true); setShowMenu(false); }}>
              <FontAwesomeIcon icon={faEye} />
              Ver Galería
            </button>
            <button className="action-btn edit-btn" onClick={() => { setShowEditModal(true); setShowMenu(false); }}>
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

      {showEditModal && (
        <EditGalleryModal
          gallery={gallery}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => { setShowEditModal(false); onUpdate(); }}
        />
      )}

      {showViewModal && (
        <ViewGalleryModal
          gallery={gallery}
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
        />
      )}
    </>
  );
};

export default GalleryCard;