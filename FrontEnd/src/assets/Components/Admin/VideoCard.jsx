import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './VideoSection.css'
import { 
    faEdit, 
    faTrash, 
    faDownload,
    faPlay,
    faClock,
    faVideo,
    faUser,
    faCalendar,
    faCog
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const VideoCard = ({ video, onUpdate, onDelete }) => {
    const [loading, setLoading] = useState(false);
    const [showVideoModal, setShowVideoModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ title: '', description: '', estimated_delivery: '' });

    const getStatusInfo = (status) => {
        const statusInfo = {
            waiting_selection: {
                text: 'Esperando selección',
                color: '#f59e0b',
                icon: faClock,
                class: 'status-waiting'
            },
            in_editing: {
                text: 'En edición',
                color: '#3b82f6',
                icon: faCog,
                class: 'status-editing'
            },
            completed: {
                text: 'Finalizado',
                color: '#10b981',
                icon: faPlay,
                class: 'status-completed'
            }
        };
        return statusInfo[status] || statusInfo.waiting_selection;
    };

    const handleStatusChange = async (newStatus) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/admin/updateVideoStatus/${video.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                toast.success('Estado del video actualizado');
                onUpdate();
            } else {
                throw new Error('Error al actualizar el estado');
            }
        } catch (error) {
            console.error('Error updating video status:', error);
            toast.error('Error al actualizar el estado');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar video?',
            html: `
                <div style="text-align: left;">
                    <p style="margin-bottom: 10px; color: #9ca3af;">¿Estás seguro de que quieres eliminar este video?</p>
                    <div style="background: rgba(0,0,0,0.3); border: 1px solid #374151; padding: 10px; border-radius: 6px; color: #d1d5db;">
                        <strong>Video:</strong> ${video.title}<br>
                        <strong>Cliente:</strong> ${video.client?.first_name} ${video.client?.last_name}
                    </div>
                    <p style="margin-top: 15px; color: #dc3545; font-size: 14px;">
                        <strong>⚠️ Esta acción no se puede deshacer</strong>
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3000/admin/deleteVideo/${video.id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    toast.success('Video eliminado correctamente');
                    onDelete();
                } else {
                    throw new Error('Error al eliminar el video');
                }
            } catch (error) {
                console.error('Error deleting video:', error);
                toast.error('Error al eliminar el video');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleEditSave = async () => {
        if (!editData.title.trim()) {
            toast.error('El título es obligatorio');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/admin/updateVideo/${video.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            if (!res.ok) throw new Error();
            toast.success('Video actualizado');
            setIsEditing(false);
            onUpdate();
        } catch {
            toast.error('Error al actualizar el video');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const statusInfo = getStatusInfo(video.status);

    return (
        <div className="video-card">
            <div className="video-thumbnail">
                {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt={video.title} className="video-thumbnail-img" />
                ) : (
                    <div className="video-thumbnail-placeholder">
                        <FontAwesomeIcon icon={faVideo} />
                    </div>
                )}

                {video.video_url && (
                    <button
                        className="video-thumbnail-play"
                        onClick={() => setShowVideoModal(true)}
                        title="Ver video"
                    >
                        <FontAwesomeIcon icon={faPlay} />
                    </button>
                )}

                <div className={`video-status video-status-overlay ${statusInfo.class}`}>
                    <FontAwesomeIcon icon={statusInfo.icon} />
                    {statusInfo.text}
                </div>
            </div>

            <div className="video-card-body">
            <div className="video-card-header">
                <div className="video-title-section">
                    <FontAwesomeIcon icon={faVideo} />
                    <h3>{video.title}</h3>
                </div>
            </div>

            {video.description && (
                <div className="video-description">
                    {video.description}
                </div>
            )}

            {/* Información del cliente */}
            <div className="video-client-info">
                <FontAwesomeIcon icon={faUser} />
                <span>
                    {video.first_name} {video.last_name}
                    {video.email && ` (${video.email})`}
                </span>
            </div>

            {/* Meta información */}
            <div className="video-meta-info">
                <div className="video-meta-item">
                    <FontAwesomeIcon icon={faCalendar} />
                    <span>
                        {video.estimated_delivery
                            ? `Entrega: ${formatDate(video.estimated_delivery)}`
                            : 'Sin fecha de entrega'
                        }
                    </span>
                </div>
                {video.service_type && (
                    <div className="video-meta-item">
                        <FontAwesomeIcon icon={faCog} />
                        <span>Servicio: {video.service_type}</span>
                    </div>
                )}
                {video.file_size && (
                    <div className="video-meta-item">
                        <span>Tamaño: {formatFileSize(video.file_size)}</span>
                    </div>
                )}
                {video.download_count !== undefined && (
                    <div className="video-meta-item">
                        <FontAwesomeIcon icon={faDownload} />
                        <span>Descargas: {video.download_count}</span>
                    </div>
                )}
            </div>

            {/* Acciones */}
            <div className="video-actions">
                <div className="video-status-controls">
                    <select
                        value={video.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={loading}
                        className="status-select"
                    >
                        <option value="waiting_selection">Esperando selección</option>
                        <option value="in_editing">En edición</option>
                        <option value="completed">Finalizado</option>
                    </select>
                </div>

                <div className="video-action-buttons">
                    <button
                        className="btn-edit"
                        onClick={() => {
                            setEditData({
                                title: video.title || '',
                                description: video.description || '',
                                estimated_delivery: video.estimated_delivery ? video.estimated_delivery.split('T')[0] : ''
                            });
                            setIsEditing(prev => !prev);
                        }}
                        title="Editar video"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                        className="btn-delete"
                        onClick={handleDelete}
                        disabled={loading}
                        title="Eliminar video"
                    >
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>

            </div>

            {/* Modal de edición de video */}
            {isEditing && (
                <div className="video-edit-overlay" onClick={() => !loading && setIsEditing(false)}>
                    <div className="video-edit-panel" onClick={e => e.stopPropagation()}>
                        <div className="video-edit-header">
                            <h3>Editar video</h3>
                            <button
                                className="video-edit-close"
                                onClick={() => setIsEditing(false)}
                                disabled={loading}
                                title="Cerrar"
                            >
                                ×
                            </button>
                        </div>
                        <div className="video-edit-field">
                            <label>Título</label>
                            <input
                                type="text"
                                value={editData.title}
                                onChange={e => setEditData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Título del video"
                            />
                        </div>
                        <div className="video-edit-field">
                            <label>Descripción</label>
                            <textarea
                                value={editData.description}
                                onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Descripción..."
                                rows={3}
                            />
                        </div>
                        <div className="video-edit-field">
                            <label>Entrega estimada</label>
                            <input
                                type="date"
                                value={editData.estimated_delivery}
                                onChange={e => setEditData(prev => ({ ...prev, estimated_delivery: e.target.value }))}
                            />
                        </div>
                        <div className="video-edit-actions">
                            <button className="btn-cancel-edit" onClick={() => setIsEditing(false)} disabled={loading}>
                                Cancelar
                            </button>
                            <button className="btn-save-edit" onClick={handleEditSave} disabled={loading}>
                                {loading ? 'Guardando...' : 'Guardar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de preview del video */}
            {showVideoModal && video.video_url && (
                <div className="video-preview-modal">
                    <div className="video-preview-content">
                        <button 
                            className="close-preview"
                            onClick={() => setShowVideoModal(false)}
                        >
                            ×
                        </button>
                        <video 
                            controls 
                            autoPlay 
                            src={video.video_url}
                            className="video-player"
                        >
                            Tu navegador no soporta el elemento video.
                        </video>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoCard;