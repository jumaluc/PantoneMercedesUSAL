import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle, faImages, faUser, faDownload,
  faTimes, faSpinner, faChevronDown, faChevronUp,
  faTrash, faEye, faCalendar, faLayerGroup, faMusic
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import './SelectionsSection.css';

const SelectionsSection = () => {
  const [selections, setSelections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedGallery, setExpandedGallery] = useState(null);
  const [galleryImages, setGalleryImages] = useState({});
  const [loadingImages, setLoadingImages] = useState({});
  const [lightboxImage, setLightboxImage] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchSelections();
  }, []);

  const fetchSelections = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/admin/client-selections', { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSelections(data.data || []);
    } catch {
      toast.error('Error al cargar las selecciones', { id: 'sel-fetch' });
    } finally {
      setLoading(false);
    }
  };

  const toggleGallery = async (galleryId) => {
    if (expandedGallery === galleryId) {
      setExpandedGallery(null);
      return;
    }
    setExpandedGallery(galleryId);
    if (galleryImages[galleryId]) return;

    setLoadingImages(prev => ({ ...prev, [galleryId]: true }));
    try {
      const res = await fetch(`http://localhost:3000/admin/client-selections/${galleryId}/images`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGalleryImages(prev => ({ ...prev, [galleryId]: data.data || [] }));
    } catch {
      toast.error('Error al cargar las imágenes', { id: `sel-img-${galleryId}` });
    } finally {
      setLoadingImages(prev => ({ ...prev, [galleryId]: false }));
    }
  };

  const cancelSelection = async (galleryId, galleryTitle) => {
    const result = await Swal.fire({
      title: '¿Cancelar selección?',
      html: `<p style="color:#9ca3af">El cliente de <strong style="color:#f3f4f6">${galleryTitle}</strong> podrá volver a seleccionar sus fotos.</p>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#374151',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
      background: '#111827',
      color: '#d1d5db',
    });
    if (!result.isConfirmed) return;
    setCancelling(galleryId);
    try {
      const res = await fetch(`http://localhost:3000/admin/client-selections/${galleryId}/cancel`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) throw new Error();
      toast.success('Selección cancelada. El cliente puede volver a seleccionar.');
      setSelections(prev => prev.filter(s => s.gallery_id !== galleryId));
      setGalleryImages(prev => { const n = { ...prev }; delete n[galleryId]; return n; });
      if (expandedGallery === galleryId) setExpandedGallery(null);
    } catch {
      toast.error('Error al cancelar la selección');
    } finally {
      setCancelling(null);
    }
  };

  const downloadAll = async (galleryId, galleryTitle) => {
    const images = galleryImages[galleryId];
    if (!images || images.length === 0) return;

    toast.loading('Preparando descarga...', { id: 'dl-all' });
    try {
      for (const img of images) {
        const res = await fetch(img.image_url);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = img.original_filename || `imagen_${img.id}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      toast.success(`${images.length} imágenes descargadas`, { id: 'dl-all' });
    } catch {
      toast.error('Error al descargar', { id: 'dl-all' });
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('es-AR', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="sel-loading">
      <FontAwesomeIcon icon={faSpinner} spin size="2x" />
      <p>Cargando selecciones...</p>
    </div>
  );

  return (
    <div className="sel-container">
      <div className="sel-header">
        <div className="sel-header-info">
          <h2><FontAwesomeIcon icon={faCheckCircle} /> Selecciones de Clientes</h2>
          <p>Imágenes confirmadas por los clientes desde sus galerías</p>
        </div>
        <div className="sel-header-badge">
          <span>{selections.length}</span>
          <label>{selections.length === 1 ? 'selección' : 'selecciones'} pendiente{selections.length !== 1 ? 's' : ''}</label>
        </div>
      </div>

      {selections.length === 0 ? (
        <div className="sel-empty">
          <FontAwesomeIcon icon={faImages} size="3x" />
          <h3>Sin selecciones confirmadas</h3>
          <p>Cuando un cliente confirme su selección de fotos, aparecerá aquí.</p>
        </div>
      ) : (
        <div className="sel-list">
          {selections.map(sel => (
            <div key={sel.gallery_id} className={`sel-card ${expandedGallery === sel.gallery_id ? 'expanded' : ''}`}>
              <div className="sel-card-header" onClick={() => toggleGallery(sel.gallery_id)}>
                <div className="sel-card-client">
                  <div className="sel-avatar">
                    {sel.first_name?.[0]}{sel.last_name?.[0]}
                  </div>
                  <div className="sel-card-info">
                    <span className="sel-client-name">{sel.first_name} {sel.last_name}</span>
                    <span className="sel-client-email">{sel.email}</span>
                  </div>
                </div>

                <div className="sel-card-meta">
                  <div className="sel-meta-item">
                    <FontAwesomeIcon icon={faLayerGroup} />
                    <span>{sel.title}</span>
                    <span className="sel-service-badge">{sel.service_type}</span>
                  </div>
                  <div className="sel-meta-item">
                    <FontAwesomeIcon icon={faCalendar} />
                    <span>{formatDate(sel.confirmed_at)}</span>
                  </div>
                </div>

                <div className="sel-card-actions">
                  <span className="sel-count-badge">
                    <FontAwesomeIcon icon={faCheckCircle} />
                    {sel.selected_count} foto{sel.selected_count !== 1 ? 's' : ''}
                  </span>
                  {(sel.song_1 || sel.song_2 || sel.song_3 || sel.let_admin_choose) && (
                    <span className="sel-music-badge" title="Canciones seleccionadas">
                      <FontAwesomeIcon icon={faMusic} />
                      {sel.let_admin_choose ? 'A elección' : [sel.song_1, sel.song_2, sel.song_3].filter(Boolean).length + ' canción' + ([sel.song_1, sel.song_2, sel.song_3].filter(Boolean).length !== 1 ? 'es' : '')}
                    </span>
                  )}
                  <button
                    className="sel-btn-cancel"
                    onClick={e => { e.stopPropagation(); cancelSelection(sel.gallery_id, sel.title); }}
                    disabled={cancelling === sel.gallery_id}
                    title="Cancelar selección (el cliente podrá volver a seleccionar)"
                  >
                    {cancelling === sel.gallery_id
                      ? <FontAwesomeIcon icon={faSpinner} spin />
                      : <FontAwesomeIcon icon={faTrash} />}
                  </button>
                  <FontAwesomeIcon
                    icon={expandedGallery === sel.gallery_id ? faChevronUp : faChevronDown}
                    className="sel-chevron"
                  />
                </div>
              </div>

              {expandedGallery === sel.gallery_id && (
                <div className="sel-card-body">
                  {/* Panel de canciones */}
                  {(sel.song_1 || sel.song_2 || sel.song_3 || sel.let_admin_choose) && (
                    <div className="sel-songs-panel">
                      <div className="sel-songs-header">
                        <FontAwesomeIcon icon={faMusic} />
                        <span>Canciones elegidas por el cliente</span>
                      </div>
                      {sel.let_admin_choose ? (
                        <p className="sel-songs-admin-choice">
                          El cliente dejó que el equipo elija las canciones
                        </p>
                      ) : (
                        <ol className="sel-songs-list">
                          {[sel.song_1, sel.song_2, sel.song_3].filter(Boolean).map((song, i) => (
                            <li key={i}>{song}</li>
                          ))}
                        </ol>
                      )}
                      {sel.song_notes && (
                        <p className="sel-songs-notes">
                          <strong>Aclaraciones:</strong> {sel.song_notes}
                        </p>
                      )}
                    </div>
                  )}

                  {loadingImages[sel.gallery_id] ? (
                    <div className="sel-images-loading">
                      <FontAwesomeIcon icon={faSpinner} spin /> Cargando imágenes...
                    </div>
                  ) : (
                    <>
                      <div className="sel-images-toolbar">
                        <span>{galleryImages[sel.gallery_id]?.length || 0} imágenes seleccionadas</span>
                        <button
                          className="sel-btn-download-all"
                          onClick={() => downloadAll(sel.gallery_id, sel.title)}
                        >
                          <FontAwesomeIcon icon={faDownload} /> Descargar todas
                        </button>
                      </div>
                      <div className="sel-images-grid">
                        {(galleryImages[sel.gallery_id] || []).map(img => (
                          <div key={img.id} className="sel-image-item" onClick={() => setLightboxImage(img)}>
                            <img src={img.image_url} alt={img.original_filename} />
                            <div className="sel-image-overlay">
                              <FontAwesomeIcon icon={faEye} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxImage && (
        <div className="sel-lightbox" onClick={() => setLightboxImage(null)}>
          <button className="sel-lightbox-close" onClick={() => setLightboxImage(null)}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
          <img src={lightboxImage.image_url} alt={lightboxImage.original_filename} onClick={e => e.stopPropagation()} />
          <div className="sel-lightbox-info">
            <span>{lightboxImage.original_filename}</span>
            <a
              href={lightboxImage.image_url}
              download={lightboxImage.original_filename}
              onClick={e => e.stopPropagation()}
              className="sel-lightbox-download"
            >
              <FontAwesomeIcon icon={faDownload} /> Descargar
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectionsSection;
