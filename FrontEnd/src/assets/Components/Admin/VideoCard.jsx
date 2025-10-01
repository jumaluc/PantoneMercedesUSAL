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
            },
            cancelled: {
                text: 'Cancelado',
                color: '#ef4444',
                icon: faClock,
                class: 'status-cancelled'
            }
        };
        return statusInfo[status] || statusInfo.waiting_selection;
    };

    const getProgressInfo = (progress) => {
        if (progress <= 25) return { color: '#ef4444', label: 'Iniciando' };
        if (progress <= 50) return { color: '#f59e0b', label: 'En progreso' };
        if (progress <= 75) return { color: '#3b82f6', label: 'Avanzado' };
        return { color: '#10b981', label: 'Casi listo' };
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

    const handleProgressUpdate = async (newProgress) => {
        setLoading(true);
        try {
            const response = await fetch(`http://localhost:3000/admin/updateVideoProgress/${video.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ progress: newProgress })
            });

            if (response.ok) {
                toast.success('Progreso actualizado');
                onUpdate();
            } else {
                throw new Error('Error al actualizar el progreso');
            }
        } catch (error) {
            console.error('Error updating video progress:', error);
            toast.error('Error al actualizar el progreso');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Eliminar video?',
            html: `
                <div style="text-align: left;">
                    <p style="margin-bottom: 10px; color: #666;">¿Estás seguro de que quieres eliminar este video?</p>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 6px;">
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
    const progressInfo = getProgressInfo(video.progress);

    return (
        <div className="video-card">
            <div className="video-card-header">
                <div className="video-title-section">
                    <FontAwesomeIcon icon={faVideo} />
                    <h3>{video.title}</h3>
                </div>
                <div className={`video-status ${statusInfo.class}`}>
                    <FontAwesomeIcon icon={statusInfo.icon} />
                    {statusInfo.text}
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
                    {video.client?.first_name} {video.client?.last_name}
                    {video.client?.email && ` (${video.client.email})`}
                </span>
            </div>

            {/* Barra de progreso */}
            <div className="video-progress-section">
                <div className="video-progress-header">
                    <span>Progreso: {video.progress}%</span>
                    <span style={{ color: progressInfo.color }}>
                        {progressInfo.label}
                    </span>
                </div>
                <div className="video-progress-bar">
                    <div 
                        className="video-progress-fill"
                        style={{ 
                            width: `${video.progress}%`,
                            backgroundColor: progressInfo.color
                        }}
                    ></div>
                </div>
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
                        <option value="cancelled">Cancelado</option>
                    </select>

                    <select 
                        value={video.progress}
                        onChange={(e) => handleProgressUpdate(parseInt(e.target.value))}
                        disabled={loading}
                        className="progress-select"
                    >
                        <option value="0">0%</option>
                        <option value="25">25%</option>
                        <option value="50">50%</option>
                        <option value="75">75%</option>
                        <option value="100">100%</option>
                    </select>
                </div>

                <div className="video-action-buttons">
                    {video.video_url && (
                        <button 
                            className="btn-preview"
                            onClick={() => setShowVideoModal(true)}
                            title="Ver video"
                        >
                            <FontAwesomeIcon icon={faPlay} />
                        </button>
                    )}
                    <button 
                        className="btn-edit"
                        onClick={() => {/* Abrir modal de edición */}}
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