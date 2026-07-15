import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUpload, faTrash, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import UploadProgressModal from './UploadProgressModal';
import { API_URL } from '../../../../config/api';

const BATCH_SIZE = 5;
const INITIAL_PREVIEW_COUNT = 20;
const PREVIEW_LOAD_MORE_COUNT = 30;

const CreateGalleryModal = ({ isOpen, onClose, onGalleryCreated, clients }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    service: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [visiblePreviewCount, setVisiblePreviewCount] = useState(INITIAL_PREVIEW_COUNT);

  // Progress state
  const [showProgress, setShowProgress] = useState(false);
  const [progressPhase, setProgressPhase] = useState('creating');
  const [progressUploaded, setProgressUploaded] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [progressSpeed, setProgressSpeed] = useState(0);
  const [progressEstimated, setProgressEstimated] = useState(null);
  const [progressError, setProgressError] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [totalElapsedSeconds, setTotalElapsedSeconds] = useState(null);

  const cancelledRef = useRef(false);
  const galleryIdRef = useRef(null);
  const uploadStartRef = useRef(null);

  const serviceTypes = [
    'XV años',
    'Casamiento',
    'Bautismo',
    'Otro'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleFileChange = (e) => {
    setImages(Array.from(e.target.files));
    setVisiblePreviewCount(INITIAL_PREVIEW_COUNT);
  };

  const handleMainFileChange = (e) => {
    setMainImage(e.target.files[0] || null);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => setMainImage(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.id) newErrors.id = 'Selecciona un cliente';
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.service) newErrors.service = 'Selecciona un tipo de servicio';
    if (!mainImage && images.length === 0) newErrors.images = 'Agrega al menos una imagen';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const cleanupGallery = async (galleryId) => {
    if (!galleryId) return;
    try {
      await fetch(`${API_URL}/admin/deleteGallery/${galleryId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
    } catch (err) {
      console.error('Error limpiando galería:', err);
    }
  };

  const cancelUpload = async () => {
    if (progressPhase === 'done') {
      // Just close — upload already completed
      setShowProgress(false);
      onGalleryCreated();
      handleClose();
      return;
    }
    cancelledRef.current = true;
    setCancelling(true);
    await cleanupGallery(galleryIdRef.current);
    setCancelling(false);
    setShowProgress(false);
    resetProgress();
    toast.info('Subida cancelada');
  };

  const resetProgress = () => {
    setProgressPhase('creating');
    setProgressUploaded(0);
    setProgressTotal(0);
    setProgressSpeed(0);
    setProgressEstimated(null);
    setProgressError(null);
    setCancelling(false);
    setTotalElapsedSeconds(null);
    cancelledRef.current = false;
    galleryIdRef.current = null;
    uploadStartRef.current = null;
  };

  const uploadBatch = async (galleryId, files, isPrimary, speedHistory) => {
    const formPayload = new FormData();
    let batchBytes = 0;
    files.forEach(f => {
      formPayload.append('images', f);
      batchBytes += f.size;
    });
    if (isPrimary) formPayload.append('isPrimary', 'true');

    const t0 = Date.now();
    const res = await fetch(`${API_URL}/admin/addImagesToGallery/${galleryId}`, {
      method: 'POST',
      credentials: 'include',
      body: formPayload
    });
    const elapsed = (Date.now() - t0) / 1000;
    const batchSpeed = batchBytes / elapsed;

    speedHistory.push(batchSpeed);
    if (speedHistory.length > 4) speedHistory.shift();
    const avgSpeed = speedHistory.reduce((a, b) => a + b, 0) / speedHistory.length;

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al subir lote de imágenes');
    }
    return { avgSpeed, batchBytes };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Build ordered upload queue: main image first, then the rest
    const allFiles = [];
    if (mainImage) allFiles.push({ file: mainImage, isPrimary: true });
    images.forEach(f => allFiles.push({ file: f, isPrimary: false }));

    const total = allFiles.length;
    setProgressTotal(total);
    setProgressUploaded(0);
    setProgressPhase('creating');
    setProgressError(null);
    cancelledRef.current = false;
    galleryIdRef.current = null;
    setShowProgress(true);

    try {
      // Step 1: create gallery metadata
      const metaRes = await fetch(`${API_URL}/admin/createGalleryMeta`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: formData.id,
          title: formData.title,
          service: formData.service,
          description: formData.description,
          status: formData.status
        })
      });
      if (!metaRes.ok) {
        const err = await metaRes.json();
        throw new Error(err.message || 'Error al crear la galería');
      }
      const { data: { galleryId } } = await metaRes.json();
      galleryIdRef.current = galleryId;

      // Step 2: batch upload
      setProgressPhase('uploading');
      uploadStartRef.current = Date.now();
      const speedHistory = [];
      let uploaded = 0;
      let totalRemainingBytes = allFiles.reduce((sum, { file }) => sum + file.size, 0);

      // First batch always includes the main image (if any) alone so it gets isPrimary
      let batchStart = 0;
      while (batchStart < allFiles.length) {
        if (cancelledRef.current) return;

        const isFirstBatch = batchStart === 0;
        const batchSize = isFirstBatch && allFiles[0].isPrimary ? 1 : BATCH_SIZE;
        const batchItems = allFiles.slice(batchStart, batchStart + batchSize);
        const batchFiles = batchItems.map(b => b.file);
        const batchIsPrimary = isFirstBatch && allFiles[0].isPrimary;

        const batchBytes = batchFiles.reduce((s, f) => s + f.size, 0);
        const { avgSpeed } = await uploadBatch(galleryId, batchFiles, batchIsPrimary, speedHistory);

        uploaded += batchFiles.length;
        totalRemainingBytes -= batchBytes;
        const estimatedSec = avgSpeed > 0 ? totalRemainingBytes / avgSpeed : null;

        setProgressUploaded(uploaded);
        setProgressSpeed(avgSpeed);
        setProgressEstimated(estimatedSec);

        batchStart += batchSize;
      }

      if (cancelledRef.current) return;

      // Step 3: finalize
      setProgressPhase('finalizing');
      await fetch(`${API_URL}/admin/finalizeGallery/${galleryId}`, {
        method: 'POST',
        credentials: 'include'
      });

      const elapsed = uploadStartRef.current ? (Date.now() - uploadStartRef.current) / 1000 : null;
      setTotalElapsedSeconds(elapsed);
      setProgressPhase('done');
      toast.success('¡Galería creada exitosamente!');

      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowProgress(false);
        onGalleryCreated();
        handleClose();
      }, 3000);

    } catch (err) {
      if (cancelledRef.current) return;
      console.error('Error creando galería:', err);
      // Auto-cleanup on error
      await cleanupGallery(galleryIdRef.current);
      setProgressError(err.message || 'Error al subir las imágenes. Las imágenes subidas fueron eliminadas.');
      toast.error(err.message || 'Error al crear la galería');
    }
  };

  const handleClose = () => {
    if (showProgress && progressPhase !== 'done' && !progressError) return; // block close while uploading
    setFormData({ id: '', title: '', service: '', description: '', status: 'active' });
    setImages([]);
    setMainImage(null);
    setVisiblePreviewCount(INITIAL_PREVIEW_COUNT);
    setErrors({});
    setShowProgress(false);
    resetProgress();
    onClose();
  };

  const percentage = progressTotal > 0
    ? progressPhase === 'done' ? 100 : Math.round((progressUploaded / progressTotal) * 95)
    : progressPhase === 'finalizing' ? 98 : 0;

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay-create-client">
        <div className="modal-content-create-client">
          <div className="modal-header-create-client">
            <h2>Crear Nueva Galería</h2>
            <button className="close-btn" onClick={handleClose}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="client-form">
            {/* Cliente */}
            <div className="form-group-client-modal">
              <label>Cliente *</label>
              <select name="id" value={formData.id} onChange={handleInputChange} className={errors.id ? 'error' : ''}>
                <option value="">Selecciona un cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name} - {client.email}
                  </option>
                ))}
              </select>
              {errors.id && <span className="error-text">{errors.id}</span>}
            </div>

            {/* Título */}
            <div className="form-group-client-modal">
              <label>Título de la Galería *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? 'error' : ''}
                placeholder="Ej: XV años de Valentina"
              />
              {errors.title && <span className="error-text">{errors.title}</span>}
            </div>

            {/* Tipo de servicio */}
            <div className="form-group-client-modal">
              <label>Tipo de Servicio *</label>
              <select name="service" value={formData.service} onChange={handleInputChange} className={errors.service ? 'error' : ''}>
                <option value="">Selecciona un servicio</option>
                {serviceTypes.map((service, index) => (
                  <option key={index} value={service}>{service}</option>
                ))}
              </select>
              {errors.service && <span className="error-text">{errors.service}</span>}
            </div>

            {/* Descripción */}
            <div className="form-group-client-modal">
              <label>Descripción</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción opcional de la galería..."
                rows="3"
              />
            </div>

            {/* Fotografía principal */}
            <div className="form-group-client-modal">
              <label>Fotografía principal</label>
              <div className="file-upload">
                <label htmlFor="mainImage" className="file-upload-label">
                  <FontAwesomeIcon icon={faUpload} /> Subir imagen principal
                </label>
                <input id="mainImage" type="file" accept="image/*" onChange={handleMainFileChange} style={{ display: 'none' }} />
              </div>
              <div className="image-preview">
                {mainImage && (
                  <div className="image-item">
                    <img src={URL.createObjectURL(mainImage)} alt="preview" />
                    <button type="button" className="remove-btn" onClick={removeMainImage}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Imágenes */}
            <div className="form-group-client-modal">
              <label>Fotografías de la galería</label>
              <div className="file-upload">
                <label htmlFor="images" className="file-upload-label">
                  <FontAwesomeIcon icon={faUpload} /> Subir imágenes
                </label>
                <input id="images" type="file" multiple accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
              </div>
              {images.length > 0 && (
                <p style={{ color: '#9ca3af', fontSize: '0.83rem', marginTop: '6px' }}>
                  {images.length} imagen{images.length !== 1 ? 'es' : ''} seleccionada{images.length !== 1 ? 's' : ''}
                </p>
              )}
              {errors.images && <span className="error-text">{errors.images}</span>}
              <div className="image-preview">
                {images.slice(0, visiblePreviewCount).map((img, index) => (
                  <div key={index} className="image-item">
                    <img src={URL.createObjectURL(img)} alt="preview" />
                    <button type="button" className="remove-btn" onClick={() => removeImage(index)}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                ))}
              </div>
              {images.length > visiblePreviewCount && (
                <button
                  type="button"
                  className="load-more-images"
                  onClick={() => setVisiblePreviewCount(prev => prev + PREVIEW_LOAD_MORE_COUNT)}
                >
                  <FontAwesomeIcon icon={faChevronDown} />
                  Cargar más ({images.length - visiblePreviewCount} restantes)
                </button>
              )}
            </div>

            {/* Estado */}
            <div className="form-group-client-modal">
              <label>Estado</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="active">Activa</option>
                <option value="inactive">Inactiva</option>
              </select>
            </div>

            {/* Botones */}
            <div className="form-actions">
              <button type="button" onClick={handleClose} className="btn-cancel">
                Cancelar
              </button>
              <button type="submit" className="btn-create">
                Crear Galería
              </button>
            </div>
          </form>
        </div>
      </div>

      <UploadProgressModal
        isOpen={showProgress}
        galleryTitle={formData.title}
        phase={progressPhase}
        uploaded={progressUploaded}
        total={progressTotal}
        percentage={percentage}
        speedBps={progressSpeed}
        estimatedSeconds={progressEstimated}
        totalElapsedSeconds={totalElapsedSeconds}
        error={progressError}
        onCancel={cancelUpload}
        cancelling={cancelling}
      />
    </>
  );
};

export default CreateGalleryModal;
