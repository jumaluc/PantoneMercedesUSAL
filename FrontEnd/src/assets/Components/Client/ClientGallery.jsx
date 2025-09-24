import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faEdit, faEraser,faSpinner, faImages, faCheckCircle, faSearchPlus, faArrowUp, faTimes, faEye, faComment } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import './Gallery.css';
import CommentsSection from './CommentSection';
import ImageCommentsOverlay from './ImageCommentsOverlay';

const Gallery = ({ user }) => {
  const [galleryData, setGalleryData] = useState(null);
  const [selectedImages, setSelectedImages] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayImage, setOverlayImage] = useState(null);
  const [overlayIndex, setOverlayIndex] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [processedImages, setProcessedImages] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showCommentsOverlay, setShowCommentsOverlay] = useState(false);
  const [commentsImage, setCommentsImage] = useState(null);

  useEffect(() => {
    fetchGalleries();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setShowHeader(selectedImages.size === 0);
  }, [selectedImages.size]);

  useEffect(() => {
    if (galleryData?.images) {
      const processImages = async () => {
        const processed = await Promise.all(
          galleryData.images.map(async (image) => {
            return new Promise((resolve) => {
              const img = new Image();
              img.onload = () => {
                const isVertical = img.naturalHeight > img.naturalWidth;
                resolve({ ...image, isVertical });
              };
              img.onerror = () => {
                resolve({ ...image, isVertical: false });
              };
              img.src = image.image_url;
            });
          })
        );
        setProcessedImages(processed);
      };
      processImages();
    }
  }, [galleryData]);

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

  const handleImageClick = (image, index, event) => {
    if (selectedImages.size > 0) {
      if (event) event.stopPropagation();
      toggleImageSelection(image.id, event);
      return;
    }
    setOverlayImage(image);
    setOverlayIndex(index);
    setOverlayVisible(true);
  };

  const handleZoomClick = (image, index, event) => {
    event.stopPropagation();
    setOverlayImage(image);
    setOverlayIndex(index);
    setOverlayVisible(true);
  };

  const handleCommentsClick = (image, event) => {
    event.stopPropagation();
    setCommentsImage(image);
    setShowCommentsOverlay(true);
  };

  const handleOverlayClose = () => {
    setOverlayVisible(false);
    setOverlayImage(null);
  };

  const handleCommentsOverlayClose = () => {
    setShowCommentsOverlay(false);
    setCommentsImage(null);
  };

  const handleOverlayImageClick = (imageId, event) => {
    event.stopPropagation();
    toggleImageSelection(imageId);
  };

  const navigateOverlay = (direction) => {
    if (!processedImages || processedImages.length === 0) return;
    let newIndex = overlayIndex + direction;
    if (newIndex < 0) newIndex = processedImages.length - 1;
    if (newIndex >= processedImages.length) newIndex = 0;
    setOverlayIndex(newIndex);
    setOverlayImage(processedImages[newIndex]);
  };

  const downloadSelected = async () => {
    if (selectedImages.size === 0) {
      toast.info('Selecciona al menos una imagen para descargar');
      return;
    }
    setDownloading(true);
    try {
      const response = await fetch('http://localhost:3000/user/downloadImages', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          imageIds: Array.from(selectedImages),
          imageUrls: Array.from(selectedImages).map(id => {
            const image = processedImages.find(img => img.id === id);
            return image ? image.image_url : '';
          })
        })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const timestamp = new Date().getTime();
        link.download = `galeria-${timestamp}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al descargar las imágenes');
      }
    } catch (error) {
      console.error('Error en el proceso de descarga:', error);
      toast.error(error.message || 'Error al descargar las imágenes');
    } finally {
      setDownloading(false);
    }
  };

  const downloadSingleImage = async (imageId, imageUrl, filename) => {
    try {
      const response = await fetch('http://localhost:3000/user/downloadSingleImage', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: imageUrl,
          filename: filename || `image_${imageId}`
        })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const contentType = response.headers.get('content-type');
        let fileExtension = 'jpg';
        if (contentType && contentType.includes('image/')) {
          fileExtension = contentType.split('/')[1];
        } else {
          fileExtension = imageUrl.split('.').pop() || 'jpg';
        }
        link.download = `${filename || 'image'}.${fileExtension}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al descargar la imagen');
      }
    } catch (error) {
      console.error('Error descargando imagen:', error);
      toast.error(error.message || 'Error al descargar la imagen');
    }
  };

  const confirmSelection = async () => {
    if (selectedImages.size === 0) {
      toast.info('No hay imágenes seleccionadas para confirmar');
      return;
    }
    const result = await Swal.fire({
      title: '¿Confirmar selección?',
      html: `Vas a confirmar <strong>${selectedImages.size}</strong> imagen${selectedImages.size !== 1 ? 'es' : ''} seleccionada${selectedImages.size !== 1 ? 's' : ''}.<br>Esta acción marcará las imágenes como seleccionadas en la base de datos.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      backdrop: true
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch('http://localhost:3000/user/confirmSelection', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageIds: Array.from(selectedImages)
          })
        });
        if (response.ok) {
          const result = await response.json();
          toast.success(result.message || 'Selección confirmada correctamente');
          setSelectedImages(new Set());
          fetchGalleries();
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error al confirmar la selección');
        }
      } catch (error) {
        console.error('Error confirmando selección:', error);
        toast.error(error.message || 'Error al confirmar la selección');
      }
    }
  };

  const previewSelected = () => {
    if (selectedImages.size === 0) {
      toast.info('No hay imágenes seleccionadas para previsualizar');
      return;
    }
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const filteredImages = processedImages.filter(image => selectedImages.has(image.id));

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
      {showHeader && (
        <header className="galeria-header">
          <div className="galeria-header-content">
            <div className="galeria-header-main">
              <h1>{galleries.title}</h1>
              <p className="galeria-service">{galleries.service_type}</p>
            </div>
            <div className="galeria-header-meta">
              <span className="galeria-client">{userInfo.first_name} {userInfo.last_name}</span>
              <span className="galeria-count">{images?.length || 0} fotos</span>
            </div>
          </div>
        </header>
      )}
      
      {selectedImages.size > 0 && (
        <div className="selection-counter-sticky">
          <div className="selection-counter-content">
            <div className="selection-info">
              <FontAwesomeIcon icon={faCheckCircle} className="selection-icon" />
              <span className="selection-text">
                {selectedImages.size} imagen{selectedImages.size !== 1 ? 'es' : ''} seleccionada{selectedImages.size !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="selection-actions">
              <button className="confirm-selection-btn" onClick={confirmSelection}>
                <FontAwesomeIcon icon={faCheckCircle} /> Confirmar Selección
              </button>
              <button onClick={clearSelection} className="confirm-selection-btn">
                <FontAwesomeIcon icon={faEraser} /> Limpiar selección
              </button>
              <button className="confirm-selection-btn" onClick={downloadSelected} disabled={downloading}>
                {downloading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faDownload} />
                )}
                Descargar
              </button>
              <button className="confirm-selection-btn" onClick={previewSelected}>
                <FontAwesomeIcon icon={faEye} /> Previsualizar Seleccionadas
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className={`galeria-main ${selectedImages.size > 0 ? 'with-selection' : ''}`}>
        <div className="galeria-grid">
          {processedImages.map((image, index) => (
            <div key={image.id} className={`galeriaFotos-container-imagen ${image.isVertical ? 'vertical' : 'horizontal'}`}>
              <div className={`galeria-item ${selectedImages.has(image.id) ? 'selected' : ''}`} onClick={(e) => handleImageClick(image, index, e)}>
                <img src={image.image_url} alt={image.original_filename} onError={(e) => {
                  e.target.src = '/placeholder-image.jpg';
                }} />
                <div className="galeria-item-overlay">
                  <button className={`check-btn ${selectedImages.has(image.id) ? 'checked' : ''}`} onClick={(e) => toggleImageSelection(image.id, e)}>
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </button>
                  <button className="zoom-btn" onClick={(e) => handleZoomClick(image, index, e)}>
                    <FontAwesomeIcon icon={faSearchPlus} />
                  </button>
                  <button className="download-single-btn" onClick={(e) => {
                    e.stopPropagation();
                    downloadSingleImage(image.id, image.image_url, image.original_filename);
                  }} title="Descargar esta imagen">
                    <FontAwesomeIcon icon={faDownload} />
                  </button>
                  <button className="check-btn" onClick={(e) => handleCommentsClick(image, e)} title="Agregar comentario">
                    <FontAwesomeIcon icon={faComment} />
                  </button>
                </div>
                {selectedImages.has(image.id) && (
                  <div className="selection-badge">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      
      {/* Preview de Imágenes Seleccionadas */}
      {showPreview && (
        <div className="preview-overlay" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h2>Vista Previa de Seleccionadas</h2>
              <div className="preview-header-info">
                <span className="preview-count">
                  {selectedImages.size} imagen{selectedImages.size !== 1 ? 'es' : ''} seleccionada{selectedImages.size !== 1 ? 's' : ''}
                </span>
                <button className="preview-close" onClick={closePreview}>
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
            <div className="preview-grid">
              {filteredImages.map((image) => (
                <div key={image.id} className="preview-item">
                  <div className="preview-image-container">
                    <img src={image.image_url} alt={image.original_filename} className="preview-img" onClick={() => {
                      setOverlayImage(image);
                      setOverlayIndex(processedImages.findIndex(img => img.id === image.id));
                      setOverlayVisible(true);
                      setShowPreview(false);
                    }} />
                    <button className={`preview-check-btn ${selectedImages.has(image.id) ? 'checked' : ''}`} onClick={(e) => {
                      e.stopPropagation();
                      toggleImageSelection(image.id);
                    }}>
                      <FontAwesomeIcon icon={faCheckCircle} />
                    </button>
                  </div>
                  <div className="preview-info">
                    <span className="preview-filename">{image.original_filename}</span>
                    <button className="preview-download-btn" onClick={(e) => {
                      e.stopPropagation();
                      downloadSingleImage(image.id, image.image_url, image.original_filename);
                    }} title="Descargar esta imagen">
                      <FontAwesomeIcon icon={faDownload} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="preview-actions">
              <button className="preview-confirm-btn" onClick={confirmSelection}>
                <FontAwesomeIcon icon={faCheckCircle} /> Confirmar Selección
              </button>
              <button className="preview-download-all-btn" onClick={downloadSelected}>
                <FontAwesomeIcon icon={faDownload} /> Descargar Todas
              </button>
              <button className="preview-clear-btn" onClick={clearSelection}>
                Limpiar Selección
              </button>
            </div>
          </div>
        </div>
      )}
      
      {showScrollTop && (
        <button className="scroll-top-btn" onClick={scrollToTop}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}
      
      {overlayVisible && overlayImage && (
        <div className="overlay" onClick={handleOverlayClose}>
          <div className="overlay-content" onClick={(e) => e.stopPropagation()}>
            <button className="overlay-close" onClick={handleOverlayClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <div className="overlay-image-container">
              <img src={overlayImage.image_url} alt={overlayImage.original_filename} className="overlay-image" />
              <button className={`overlay-check ${selectedImages.has(overlayImage.id) ? 'checked' : ''}`} onClick={(e) => handleOverlayImageClick(overlayImage.id, e)}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </button>
              <button className="overlay-download-btn" onClick={(e) => {
                e.stopPropagation();
                downloadSingleImage(overlayImage.id, overlayImage.image_url, overlayImage.original_filename);
              }} title="Descargar esta imagen">
                <FontAwesomeIcon icon={faDownload} />
              </button>

              <div className="overlay-navigation">
                <button onClick={() => navigateOverlay(-1)} className="nav-btn prev">
                  ‹
                </button>
                <button onClick={() => navigateOverlay(1)} className="nav-btn next">
                  ›
                </button>
              </div>
            </div>
            <div className="overlay-info">
              <span className="overlay-counter">{overlayIndex + 1} / {processedImages.length}</span>
            </div>
          </div>
        </div>
      )}
      
      <ImageCommentsOverlay 
        image={commentsImage} 
        isOpen={showCommentsOverlay} 
        onClose={handleCommentsOverlayClose}
        galleryId={galleries?.id}
      />
      
      <CommentsSection user={user} galleryId={galleries?.id} />
    </div>
  );
};

export default Gallery;