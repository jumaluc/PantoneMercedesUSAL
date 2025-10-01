import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUpload, faVideo } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './VideoSection.css'
const CreateVideoModal = ({ isOpen, onClose, onVideoCreated, clients }) => {
    const [formData, setFormData] = useState({
        client_id: '',
        title: '',
        description: '',
        service_type: '',
        estimated_delivery: '',
        status: 'waiting_selection',
        progress: 0
    });
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.client_id || !formData.title) {
            toast.error('Cliente y título son obligatorios');
            return;
        }

        if (!videoFile) {
            toast.error('Debes seleccionar un archivo de video');
            return;
        }

        setUploading(true);

        try {
            const submitData = new FormData();
            
            // Agregar datos del formulario
            Object.keys(formData).forEach(key => {
                submitData.append(key, formData[key]);
            });
            
            // Agregar archivos
            submitData.append('video', videoFile);
            if (thumbnailFile) {
                submitData.append('thumbnail', thumbnailFile);
            }

            const response = await fetch('http://localhost:3000/admin/createVideo', {
                method: 'POST',
                credentials: 'include',
                body: submitData
            });

            if (response.ok) {
                const result = await response.json();
                toast.success('Video creado exitosamente');
                resetForm();
                onVideoCreated();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al crear el video');
            }
        } catch (error) {
            console.error('Error creating video:', error);
            toast.error(error.message || 'Error al crear el video');
        } finally {
            setUploading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            client_id: '',
            title: '',
            description: '',
            service_type: '',
            estimated_delivery: '',
            status: 'waiting_selection',
            progress: 0
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
                    <button className="close-btn" onClick={handleClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

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
                            <label>Tipo de Servicio</label>
                            <select
                                name="service_type"
                                value={formData.service_type}
                                onChange={handleInputChange}
                            >
                                <option value="">Seleccionar servicio</option>
                                <option value="boda">Boda</option>
                                <option value="evento">Evento</option>
                                <option value="comercial">Comercial</option>
                                <option value="personal">Personal</option>
                                <option value="otros">Otros</option>
                            </select>
                        </div>

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

                        <div className="form-group">
                            <label>Progreso Inicial (%)</label>
                            <select
                                name="progress"
                                value={formData.progress}
                                onChange={handleInputChange}
                            >
                                <option value="0">0%</option>
                                <option value="25">25%</option>
                                <option value="50">50%</option>
                                <option value="75">75%</option>
                                <option value="100">100%</option>
                            </select>
                        </div>
                    </div>

                    {/* Upload de archivos */}
                    <div className="file-upload-section">
                        <div className="file-upload-group">
                            <label>Archivo de Video *</label>
                            <div className="file-upload">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoFileChange}
                                    required
                                />
                                <div className="upload-placeholder">
                                    <FontAwesomeIcon icon={faUpload} />
                                    <span>
                                        {videoFile ? videoFile.name : 'Seleccionar archivo de video'}
                                    </span>
                                </div>
                            </div>
                            <small>Formatos: MP4, AVI, MOV, WMV. Máximo 500MB</small>
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
                            <small>Formatos: JPEG, PNG. Recomendado 16:9</small>
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
                        <button 
                            type="submit" 
                            className="btn-submit"
                            disabled={uploading}
                        >
                            {uploading ? 'Creando Video...' : 'Crear Video'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateVideoModal;