import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUpload, faVideo, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './VideoSection.css'
import { API_URL } from '../../../config/api';

const fmtTime = (secs) => {
    if (secs == null || !isFinite(secs)) return '...';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const fmtSize = (bytes) => {
    if (!bytes) return '0 MB';
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const CreateVideoModal = ({ isOpen, onClose, onVideoCreated, clients }) => {
    const [formData, setFormData] = useState({
        client_id: '',
        gallery_id: '',
        title: '',
        description: '',
        service_type: '',
        estimated_delivery: '',
        status: 'waiting_selection'
    });
    const [galleries, setGalleries] = useState([]);
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadPhase, setUploadPhase] = useState(null); // 'uploading' | 'finalizing'
    const [uploadEta, setUploadEta] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const startTimeRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (uploading) {
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [uploading]);

    useEffect(() => {
        if (!isOpen) return;
        fetch(`${API_URL}/admin/getAllGalleries`, { credentials: 'include' })
            .then(res => res.ok ? res.json() : [])
            .then(data => setGalleries(data || []))
            .catch(() => setGalleries([]));
    }, [isOpen]);

    const clientGalleries = formData.client_id
        ? galleries.filter(g => String(g.client_id) === String(formData.client_id))
        : [];
    const selectedGallery = clientGalleries.find(g => String(g.id) === String(formData.gallery_id));

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            ...(name === 'client_id' ? { gallery_id: '' } : {}),
            ...(name === 'status' && value === 'completed' && !prev.estimated_delivery
                ? { estimated_delivery: new Date().toISOString().split('T')[0] }
                : {})
        }));
    };

    const handleVideoFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar tipo de archivo
            const validTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv'];
            if (!validTypes.includes(file.type)) {
                toast.error('Por favor selecciona un archivo de video válido (MP4, AVI, MOV, WMV)');
                return;
            }
            
            // Validar tamaño (max 500MB)
            if (file.size > 500 * 1024 * 1024) {
                toast.error('El archivo es demasiado grande. Máximo 500MB permitido.');
                return;
            }
            
            setVideoFile(file);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                toast.error('Por favor selecciona una imagen JPEG o PNG');
                return;
            }
            setThumbnailFile(file);
        }
    };

    const uploadWithProgress = (url, formData) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            xhr.withCredentials = true;

            xhr.upload.onprogress = (e) => {
                if (!e.lengthComputable) return;

                if (e.loaded >= e.total) {
                    // El navegador ya mandó todo el archivo a nuestro servidor.
                    // Lo que sigue (servidor -> Google Cloud) no es visible desde acá.
                    setUploadPhase('finalizing');
                    setUploadEta(null);
                    return;
                }

                const elapsedSec = (Date.now() - startTimeRef.current) / 1000;
                if (elapsedSec > 0.8) {
                    const speed = e.loaded / elapsedSec; // bytes/seg
                    const remaining = e.total - e.loaded;
                    setUploadEta(speed > 0 ? remaining / speed : null);
                }
            };

            xhr.onload = () => {
                let data = {};
                try { data = JSON.parse(xhr.responseText); } catch { /* respuesta vacía o no-JSON */ }
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(data);
                } else {
                    reject(new Error(data.message || 'Error al crear el video'));
                }
            };

            xhr.onerror = () => reject(new Error('Error de red al subir el video'));

            xhr.send(formData);
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.client_id || !formData.title) {
            toast.error('Cliente y título son obligatorios');
            return;
        }

        startTimeRef.current = Date.now();
        setElapsed(0);
        setUploadEta(null);
        setUploadPhase(videoFile ? 'uploading' : null);
        setUploading(true);

        try {
            const submitData = new FormData();

            // Agregar datos del formulario
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });

            // Agregar archivos (opcionales)
            if (videoFile) {
                submitData.append('video', videoFile);
            }
            if (thumbnailFile) {
                submitData.append('thumbnail', thumbnailFile);
            }

            await uploadWithProgress(`${API_URL}/admin/createVideo`, submitData);

            toast.success('Video creado exitosamente');
            resetForm();
            onVideoCreated();
            onClose();
        } catch (error) {
            console.error('Error creating video:', error);
            toast.error(error.message || 'Error al crear el video');
        } finally {
            setUploading(false);
            setUploadPhase(null);
            setUploadEta(null);
        }
    };

    const resetForm = () => {
        setFormData({
            client_id: '',
            gallery_id: '',
            title: '',
            description: '',
            service_type: '',
            estimated_delivery: '',
            status: 'waiting_selection'
        });
        setVideoFile(null);
        setThumbnailFile(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content video-modal">
                <div className="modal-header">
                    <h3>
                        <FontAwesomeIcon icon={faVideo} />
                        Crear Nuevo Video
                    </h3>
                    {!uploading && (
                        <button className="close-btn" onClick={handleClose}>
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    )}
                </div>

                {uploading ? (
                    <div className="video-upload-screen">
                        <div className="video-upload-icon">
                            <FontAwesomeIcon icon={faCloudUploadAlt} />
                        </div>
                        <h4>{uploadPhase ? 'Subiendo video...' : 'Creando video...'}</h4>

                        {uploadPhase && (
                            <>
                                <div className="video-upload-progress-track video-upload-progress-track--indeterminate">
                                    <div className="video-upload-progress-fill video-upload-progress-fill--indeterminate" />
                                </div>
                                <div className="video-upload-progress-meta">
                                    <span>
                                        {uploadPhase === 'uploading' && videoFile && fmtSize(videoFile.size)}
                                        {uploadPhase === 'finalizing' && 'Procesando en el servidor...'}
                                    </span>
                                    <span>
                                        {uploadPhase === 'uploading' && uploadEta != null
                                            ? `Tiempo restante estimado: ${fmtTime(uploadEta)}`
                                            : `${fmtTime(elapsed)} transcurridos`}
                                    </span>
                                </div>
                            </>
                        )}

                        <p className="video-upload-hint">
                            {uploadPhase === 'finalizing'
                                ? 'El servidor está subiendo el video a Google Cloud, puede tardar unos minutos según el tamaño.'
                                : 'No cierres esta ventana hasta que termine la subida.'}
                        </p>
                    </div>
                ) : (
                <form onSubmit={handleSubmit} className="video-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Cliente *</label>
                            <select
                                name="client_id"
                                value={formData.client_id}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Seleccionar cliente</option>
                                {clients.map(client => (
                                    <option key={client.id} value={client.id}>
                                        {client.first_name} {client.last_name} - {client.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Título del Video *</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="Ej: Video Boda Juan y María"
                                required
                            />
                        </div>
                    </div>

                    {formData.client_id && (
                        <div className="form-group">
                            <label>Vincular a Galería (opcional)</label>
                            <select
                                name="gallery_id"
                                value={formData.gallery_id}
                                onChange={handleInputChange}
                                disabled={clientGalleries.length === 0}
                            >
                                <option value="">
                                    {clientGalleries.length === 0 ? 'Este cliente no tiene galerías' : 'Sin vincular'}
                                </option>
                                {clientGalleries.map(gallery => (
                                    <option key={gallery.id} value={gallery.id}>
                                        {gallery.title}
                                    </option>
                                ))}
                            </select>
                            {selectedGallery?.cover_image_url && (
                                <div className="video-gallery-cover-preview">
                                    <img src={selectedGallery.cover_image_url} alt="Foto principal de la galería" />
                                    <span>
                                        {thumbnailFile
                                            ? 'Se usará la miniatura que subiste manualmente'
                                            : videoFile
                                                ? 'Se usará un frame extraído automáticamente del video (no esta foto)'
                                                : 'Se usará como miniatura del video'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="form-group">
                        <label>Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Descripción del video..."
                            rows="3"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Estado Inicial</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleInputChange}
                            >
                                <option value="waiting_selection">Esperando selección</option>
                                <option value="in_editing">En edición</option>
                                <option value="completed">Finalizado</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Fecha Estimada de Entrega</label>
                            <input
                                type="date"
                                name="estimated_delivery"
                                value={formData.estimated_delivery}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>

                    {/* Upload de archivos */}
                    <div className="file-upload-section">
                        <div className="file-upload-group">
                            <label>Archivo de Video (opcional)</label>
                            <div className="file-upload">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoFileChange}
                                />
                                <div className="upload-placeholder">
                                    <FontAwesomeIcon icon={faUpload} />
                                    <span>
                                        {videoFile ? videoFile.name : 'Seleccionar archivo de video'}
                                    </span>
                                </div>
                            </div>
                            <small>Formatos: MP4, AVI, MOV, WMV. Máximo 500MB. Podés agregarlo más adelante</small>
                        </div>

                        <div className="file-upload-group">
                            <label>Miniatura (opcional)</label>
                            <div className="file-upload">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailChange}
                                />
                                <div className="upload-placeholder">
                                    <FontAwesomeIcon icon={faUpload} />
                                    <span>
                                        {thumbnailFile ? thumbnailFile.name : 'Seleccionar miniatura'}
                                    </span>
                                </div>
                            </div>
                            <small>
                                {videoFile
                                    ? 'Opcional: si no subís nada, se genera automáticamente desde el video'
                                    : selectedGallery?.cover_image_url
                                        ? 'Opcional: si no subís nada, se usa la foto principal de la galería vinculada'
                                        : 'Formatos: JPEG, PNG. Recomendado 16:9'}
                            </small>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={handleClose}
                        >
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit">
                            Crear Video
                        </button>
                    </div>
                </form>
                )}
            </div>
        </div>
    );
};

export default CreateVideoModal;