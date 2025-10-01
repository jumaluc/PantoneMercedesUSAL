import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faVideo,
    faDownload,
    faPlay,
    faPause,
    faClock,
    faSpinner,
    faCheckCircle,
    faEdit,
    faHourglassHalf,
    faSearch,
    faFilter,
    faFileVideo,
    faHistory
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './ClientVideosSection.css';

const ClientVideosSection = ({ user }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playingVideo, setPlayingVideo] = useState(null);
    const [videoProgress, setVideoProgress] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [downloadingVideo, setDownloadingVideo] = useState(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/user/getMyVideos', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setVideos(data.videos || []);
            } else {
                throw new Error('Error al cargar videos');
            }
        } catch (error) {
            console.error('Error fetching videos:', error);
            toast.error('Error al cargar los videos');
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoPlay = (video) => {
        setPlayingVideo(playingVideo?.id === video.id ? null : video);
    };

    const handleVideoProgress = (videoId, progress) => {
        setVideoProgress(prev => ({
            ...prev,
            [videoId]: progress
        }));
    };

    const handleDownloadVideo = async (video) => {
        setDownloadingVideo(video.id);
        try {
            const response = await fetch(`http://localhost:3000/user/downloadVideo/${video.id}`, {
                credentials: 'include'
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                // Obtener el nombre del archivo del header o usar uno por defecto
                const contentDisposition = response.headers.get('content-disposition');
                let filename = `video-${video.title}.mp4`;
                
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if (filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }
                
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
                
                toast.success('Video descargado correctamente');
                
                // Actualizar contador de descargas
                setVideos(prev => prev.map(v => 
                    v.id === video.id 
                        ? { ...v, download_count: (v.download_count || 0) + 1 }
                        : v
                ));
            } else {
                throw new Error('Error al descargar el video');
            }
        } catch (error) {
            console.error('Error downloading video:', error);
            toast.error('Error al descargar el video');
        } finally {
            setDownloadingVideo(null);
        }
    };

    const getStatusInfo = (status) => {
        const statusInfo = {
            waiting_selection: {
                text: 'Esperando selección',
                color: '#f59e0b',
                icon: faHourglassHalf,
                description: 'Esperando que selecciones las imágenes para el video'
            },
            in_editing: {
                text: 'En proceso de edición',
                color: '#3b82f6',
                icon: faEdit,
                description: 'El video está siendo editado por nuestro equipo'
            },
            completed: {
                text: 'Finalizado',
                color: '#10b981',
                icon: faCheckCircle,
                description: 'El video está listo para descargar'
            },
            cancelled: {
                text: 'Cancelado',
                color: '#ef4444',
                icon: faHistory,
                description: 'El video fue cancelado'
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

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredVideos = videos.filter(video => {
        const matchesSearch = searchTerm === '' || 
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && video.status === filterStatus;
    });

    if (loading) {
        return (
            <div className="video-section-loading">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <p>Cargando videos...</p>
            </div>
        );
    }

    return (
        <div className="video-section-container">
            {/* Header */}
            <div className="video-section-header">
                <h1>Mis Videos</h1>
                <p>Gestiona y descarga tus videos profesionales</p>
            </div>

            {/* Filtros y búsqueda */}
            <div className="video-filters">
                <div className="video-search-box">
                    <FontAwesomeIcon icon={faSearch} />
                    <input 
                        type="text" 
                        placeholder="Buscar videos..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="video-filter-buttons">
                    <button 
                        className={`video-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('all')}
                    >
                        Todos
                    </button>
                    <button 
                        className={`video-filter-btn ${filterStatus === 'waiting_selection' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('waiting_selection')}
                    >
                        Esperando selección
                    </button>
                    <button 
                        className={`video-filter-btn ${filterStatus === 'in_editing' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('in_editing')}
                    >
                        En edición
                    </button>
                    <button 
                        className={`video-filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('completed')}
                    >
                        Finalizados
                    </button>
                </div>
            </div>

            {/* Lista de videos */}
            <div className="videos-grid">
                {filteredVideos.length > 0 ? (
                    filteredVideos.map((video) => {
                        const statusInfo = getStatusInfo(video.status);
                        const progressInfo = getProgressInfo(video.progress);
                        
                        return (
                            <div key={video.id} className="video-card">
                                <div className="video-header">
                                    <div className="video-title-section">
                                        <FontAwesomeIcon icon={faFileVideo} />
                                        <h3>{video.title}</h3>
                                    </div>
                                    <div 
                                        className="video-status"
                                        style={{ color: statusInfo.color }}
                                    >
                                        <FontAwesomeIcon icon={statusInfo.icon} />
                                        {statusInfo.text}
                                    </div>
                                </div>

                                {video.description && (
                                    <div className="video-description">
                                        {video.description}
                                    </div>
                                )}

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

                                {/* Información del video */}
                                {video.video_url && (
                                    <div className="video-preview-section">
                                        <div className="video-thumbnail">
                                            {video.thumbnail_url ? (
                                                <img 
                                                    src={video.thumbnail_url} 
                                                    alt={video.title}
                                                    onClick={() => handleVideoPlay(video)}
                                                />
                                            ) : (
                                                <div 
                                                    className="video-thumbnail-placeholder"
                                                    onClick={() => handleVideoPlay(video)}
                                                >
                                                    <FontAwesomeIcon icon={faVideo} />
                                                    <span>Ver Video</span>
                                                </div>
                                            )}
                                            <div className="video-overlay">
                                                <button 
                                                    className="video-play-btn"
                                                    onClick={() => handleVideoPlay(video)}
                                                >
                                                    <FontAwesomeIcon 
                                                        icon={playingVideo?.id === video.id ? faPause : faPlay} 
                                                    />
                                                </button>
                                            </div>
                                            {video.duration && (
                                                <div className="video-duration">
                                                    {formatDuration(video.duration)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Meta información */}
                                <div className="video-meta-info">
                                    <div className="video-meta-row">
                                        <div className="video-meta-item">
                                            <FontAwesomeIcon icon={faClock} />
                                            <span>
                                                {video.estimated_delivery 
                                                    ? `Entrega estimada: ${formatDate(video.estimated_delivery)}`
                                                    : 'Sin fecha de entrega'
                                                }
                                            </span>
                                        </div>
                                        <div className="video-meta-item">
                                            <FontAwesomeIcon icon={faVideo} />
                                            <span>
                                                {video.service_type || 'Video profesional'}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {(video.file_size || video.resolution || video.download_count !== undefined) && (
                                        <div className="video-meta-row">
                                            {video.resolution && (
                                                <span className="video-tech-info">
                                                    Resolución: {video.resolution}
                                                </span>
                                            )}
                                            {video.file_size && (
                                                <span className="video-tech-info">
                                                    Tamaño: {formatFileSize(video.file_size)}
                                                </span>
                                            )}
                                            {video.download_count !== undefined && (
                                                <span className="video-tech-info">
                                                    <FontAwesomeIcon icon={faDownload} />
                                                    Descargas: {video.download_count}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="video-actions">
                                    <button 
                                        className="video-download-btn"
                                        onClick={() => handleDownloadVideo(video)}
                                        disabled={downloadingVideo === video.id || video.status !== 'completed'}
                                    >
                                        {downloadingVideo === video.id ? (
                                            <FontAwesomeIcon icon={faSpinner} spin />
                                        ) : (
                                            <FontAwesomeIcon icon={faDownload} />
                                        )}
                                        {video.status === 'completed' ? 'Descargar Video' : 'No disponible'}
                                    </button>
                                    
                                    {video.status !== 'completed' && (
                                        <div className="video-status-description">
                                            <FontAwesomeIcon icon={statusInfo.icon} />
                                            {statusInfo.description}
                                        </div>
                                    )}
                                </div>

                                {/* Reproductor de video */}
                                {playingVideo?.id === video.id && (
                                    <div className="video-player-overlay">
                                        <div className="video-player-container">
                                            <video 
                                                controls
                                                autoPlay
                                                src={video.video_url}
                                                className="video-player"
                                                onTimeUpdate={(e) => 
                                                    handleVideoProgress(video.id, 
                                                        (e.target.currentTime / e.target.duration) * 100
                                                    )
                                                }
                                            >
                                                Tu navegador no soporta el elemento video.
                                            </video>
                                            <button 
                                                className="video-close-btn"
                                                onClick={() => setPlayingVideo(null)}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="video-empty-state">
                        <FontAwesomeIcon icon={faVideo} size="3x" />
                        <h3>No hay videos disponibles</h3>
                        <p>Tu fotógrafo te notificará cuando tengas videos asignados</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientVideosSection;