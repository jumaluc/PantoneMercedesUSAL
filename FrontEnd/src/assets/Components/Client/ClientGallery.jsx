import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faSpinner, faImages, faCheckCircle, faSearchPlus, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './Gallery.css';

const Gallery = ({ user }) => {
  const [galleryData, setGalleryData] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlayIndex, setOverlayIndex] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchGalleries();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScroll = () => {
    setShowScrollTop(window.scrollY > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchGalleries = async () => {
    try {
      const response = await fetch('http://localhost:3000/user/getGallery', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setGalleryData(data.data);
      } else {
        throw new Error('Error al cargar galerías');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar las galerías');
    } finally {
      setLoading(false);
    }
  };

  const toggleImageSelection = (imageId, event) => {
    if (event) event.stopPropagation();
    
    const newSelected = new Set(selectedImages);
    if (newSelected.has(imageId)) {
      newSelected.delete(imageId);
    } else {
      newSelected.add(imageId);
    }
    setSelectedImages(newSelected);
  };

  const handleImageClick = (image, index) => {
    if (selectedImages.size > 0) {
      toggleImageSelection(image.id);
      return;
    }
    
    setOverlayImage(image);
    setOverlayIndex(index);
    setOverlayVisible(true);
  };

  const handleOverlayClose = () => {
    setOverlayVisible(false);
    setOverlayImage(null);
  };

  const handleOverlayImageClick = (imageId, event) => {
    event.stopPropagation();
    toggleImageSelection(imageId);
  };

  const navigateOverlay = (direction) => {
    if (!galleryData?.images) return;
    
    let newIndex = overlayIndex + direction;
    if (newIndex < 0) newIndex = galleryData.images.length - 1;
    if (newIndex >= galleryData.images.length) newIndex = 0;
    
    setOverlayIndex(newIndex);
    setOverlayImage(galleryData.images[newIndex]);
  };

  const downloadSelected = async () => {
    if (selectedImages.size === 0) {
      toast.info('Selecciona al menos una imagen para descargar');
      return;
    }
    toast.success(`Preparando ${selectedImages.size} imágenes para descargar...`);
  };

  const requestEdits = () => {
    if (selectedImages.size === 0) {
      toast.info('Selecciona las imágenes que quieres editar');
      return;
    }
    toast.info('Solicitud de ediciones enviada');
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  if (loading) {
    return (
      <div className="gallery-loading">
        <FontAwesomeIcon icon={faSpinner} spin size="2x" />
        <p>Cargando galería...</p>
      </div>
    );
  }

  if (!galleryData || !galleryData.galleries) {
    return (
      <div className="gallery-empty">
        <FontAwesomeIcon icon={faImages} size="4x" />
        <h3>Aún no tienes galerías disponibles</h3>
        <p>Tu fotógrafo te notificará cuando tu galería esté lista</p>
      </div>
    );
  }

  const { galleries, images, user: userInfo } = galleryData;

  return (
    <div className="galeria-container">
      {/* Header */}
      <header className="galeria-header">
        <div className="galeria-header-content">
          <h1>{galleries.title}</h1>
          <p className="galeria-subtitle">{galleries.service_type}</p>
          <div className="galeria-client-info">
            <span>Total de: {images?.length || 0} fotos</span>
          </div>
        </div>
      </header>

      {/* Selection Counter */}
      {selectedImages.size > 0 && (
        <div className="selection-counter">
          <div className="selection-counter-content">
            <span>{selectedImages.size} imagen{selectedImages.size !== 1 ? 'es' : ''} seleccionada{selectedImages.size !== 1 ? 's' : ''}</span>
            <button onClick={clearSelection} className="clear-selection-btn">
              Limpiar selección
            </button>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <main className="galeria-main">
        <div className="galeria-grid">
          {images && images.map((image, index) => (
            <div
              key={image.id}
              className={`galeria-item ${selectedImages.has(image.id) ? 'selected' : ''}`}
              onClick={() => handleImageClick(image, index)}
            >
              <img
                src={image.image_url}
                alt={image.original_filename}
                onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }}
              />
              
              {/* Overlay con botones */}
              <div className="galeria-item-overlay">
                <button
                  className={`check-btn ${selectedImages.has(image.id) ? 'checked' : ''}`}
                  onClick={(e) => toggleImageSelection(image.id, e)}
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                </button>
                
                <button
                  className="zoom-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageClick(image, index);
                  }}
                >
                  <FontAwesomeIcon icon={faSearchPlus} />
                </button>
              </div>

              {/* Badge de selección (siempre visible cuando está seleccionado) */}

            </div>
          ))}
        </div>
      </main>

      {/* Action Buttons */}
      {selectedImages.size > 0 && (
        <div className="galeria-actions">
          <button className="action-btn primary" onClick={downloadSelected}>
            <FontAwesomeIcon icon={faDownload} />
            Descargar seleccionadas
          </button>
          <button className="action-btn secondary" onClick={requestEdits}>
            <FontAwesomeIcon icon={faEdit} />
            Solicitar ediciones
          </button>
        </div>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}

      {/* Overlay para vista ampliada */}
      {overlayVisible && overlayImage && (
        <div className="overlay" onClick={handleOverlayClose}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <button className="overlay-close" onClick={handleOverlayClose}>
              ×
            </button>
            
            <div className="overlay-image-container">
              <img
                src={overlayImage.image_url}
                alt={overlayImage.original_filename}
                className="overlay-image"
              />
              
              <button
                className={`overlay-check ${selectedImages.has(overlayImage.id) ? 'checked' : ''}`}
                onClick={(e) => handleOverlayImageClick(overlayImage.id, e)}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
              </button>

              <div className="overlay-navigation">
                <button onClick={() => navigateOverlay(-1)} className="nav-btn-gallery prev">
                  ‹
                </button>
                <button onClick={() => navigateOverlay(1)} className="nav-btn-gallery next">
                  ›
                </button>
              </div>
            </div>

            <div className="overlay-info">
              <span>{overlayImage.original_filename}</span>
              <span>{overlayIndex + 1} / {images.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;