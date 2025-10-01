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
    faFilm,
    faFileVideo,
    faHistory,
    faSearch,
    faFilter,
    faExpand,
    faVolumeUp,
    faVolumeMute,
    faStepBackward,
    faStepForward
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './ClientVideosSection.css';

const ClientVideosSection = ({ user }) => {
    const [activeTab, setActiveTab] = useState('galleries');
    const [galleries, setGalleries] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [playingVideo, setPlayingVideo] = useState(null);
    const [videoProgress, setVideoProgress] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [downloadingVideo, setDownloadingVideo] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'galleries') {
                await fetchGalleries();
            } else if (selectedGallery) {
                await fetchVideos(selectedGallery.id);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const fetchGalleries = async () => {
        try {
            const response = await fetch('http://localhost:3000/user/getVideoGalleries', {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setGalleries(data.galleries || []);
            } else {
                throw new Error('Error al cargar galerías de video');
            }
        } catch (error) {
            console.error('Error fetching video galleries:', error);
            toast.error('Error al cargar las galerías de video');
            setGalleries([]);
        }
    };

    const fetchVideos = async (galleryId) => {
        try {
            const response = await fetch(`http://localhost:3000/user/getVideos/${galleryId}`, {
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
        }
    };

    const handleGallerySelect = (gallery) => {
        setSelectedGallery(gallery);
        setActiveTab('videos');
        fetchVideos(gallery.id);
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
            year: 'numeric'
        });
    };

    const filteredGalleries = galleries.filter(gallery => {
        const matchesSearch = searchTerm === '' || 
            gallery.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            gallery.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && gallery.status === filterStatus;
    });

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
                <p>Cargando {activeTab === 'galleries' ? 'galerías' : 'videos'}...</p>
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

            {/* Navegación */}
            <div className="video-section-nav">
                <button 
                    className={`video-nav-btn ${activeTab === 'galleries' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('galleries');
                        setSelectedGallery(null);
                    }}
                >
                    <FontAwesomeIcon icon={faFilm} />
                    Galerías de Video
                </button>
                {selectedGallery && (
                    <button 
                        className={`video-nav-btn ${activeTab === 'videos' ? 'active' : ''}`}
                        onClick={() => setActiveTab('videos')}
                    >
                        <FontAwesomeIcon icon={faFileVideo} />
                        {selectedGallery.title}
                    </button>
                )}
            </div>

            {/* Contenido */}
            <div className="video-section-content">
                {activeTab === 'galleries' && (
                    <div className="video-galleries-section">
                        {/* Filtros y búsqueda */}
                        <div className="video-filters">
                            <div className="video-search-box">
                                <FontAwesomeIcon icon={faSearch} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar galerías..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="video-filter-buttons">
                                <button 
                                    className={`video-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                                    onClick={() => setFilterStatus('all')}
                                >
                                    Todas
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

                        {/* Lista de galerías */}
                        <div className="video-galleries-grid">
                            {filteredGalleries.length > 0 ? (
                                filteredGalleries.map((gallery) => {
                                    const statusInfo = getStatusInfo(gallery.status);
                                    const progressInfo = getProgressInfo(gallery.progress);
                                    
                                    return (
                                        <div key={gallery.id} className="video-gallery-card">
                                            <div className="video-gallery-header">
                                                <div className="video-gallery-title">
                                                    <FontAwesomeIcon icon={faFilm} />
                                                    <h3>{gallery.title}</h3>
                                                </div>
                                                <div 
                                                    className="video-gallery-status"
                                                    style={{ color: statusInfo.color }}
                                                >
                                                    <FontAwesomeIcon icon={statusInfo.icon} />
                                                    {statusInfo.text}
                                                </div>
                                            </div>

                                            <div className="video-gallery-description">
                                                {gallery.description || 'Sin descripción'}
                                            </div>

                                            {/* Barra de progreso */}
                                            <div className="video-progress-section">
                                                <div className="video-progress-header">
                                                    <span>Progreso: {gallery.progress}%</span>
                                                    <span style={{ color: progressInfo.color }}>
                                                        {progressInfo.label}
                                                    </span>
                                                </div>
                                                <div className="video-progress-bar">
                                                    <div 
                                                        className="video-progress-fill"
                                                        style={{ 
                                                            width: `${gallery.progress}%`,
                                                            backgroundColor: progressInfo.color
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>

                                            <div className="video-gallery-meta">
                                                <div className="video-meta-item">
                                                    <FontAwesomeIcon icon={faClock} />
                                                    <span>
                                                        {gallery.estimated_delivery 
                                                            ? `Entrega estimada: ${formatDate(gallery.estimated_delivery)}`
                                                            : 'Sin fecha de entrega'
                                                        }
                                                    </span>
                                                </div>
                                                <div className="video-meta-item">
                                                    <FontAwesomeIcon icon={faVideo} />
                                                    <span>Servicio: {gallery.service_type}</span>
                                                </div>
                                            </div>

                                            <div className="video-gallery-actions">
                                                <button 
                                                    className="video-view-btn"
                                                    onClick={() => handleGallerySelect(gallery)}
                                                    disabled={gallery.status === 'waiting_selection'}
                                                >
                                                    <FontAwesomeIcon icon={faPlay} />
                                                    {gallery.status === 'completed' ? 'Ver Videos' : 'Ver Progreso'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="video-empty-state">
                                    <FontAwesomeIcon icon={faFilm} size="3x" />
                                    <h3>No hay galerías de video disponibles</h3>
                                    <p>Tu fotógrafo te notificará cuando tengas galerías de video asignadas</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'videos' && selectedGallery && (
                    <div className="videos-list-section">
                        {/* Header de la galería */}
                        <div className="videos-gallery-header">
                            <button 
                                className="video-back-btn"
                                onClick={() => {
                                    setActiveTab('galleries');
                                    setSelectedGallery(null);
                                }}
                            >
                                ← Volver a Galerías
                            </button>
                            <div className="videos-gallery-info">
                                <h2>{selectedGallery.title}</h2>
                                <p>{selectedGallery.description}</p>
                                <div className="videos-gallery-stats">
                                    <span>{videos.length} video{s}</span>
                                    <span>•</span>
                                    <span>
                                        {videos.filter(v => v.status === 'ready').length} listos para descargar
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Lista de videos */}
                        <div className="videos-grid">
                            {filteredVideos.length > 0 ? (
                                filteredVideos.map((video) => (
                                    <div key={video.id} className="video-card">
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

                                        <div className="video-info">
                                            <h4 className="video-title">{video.title}</h4>
                                            {video.description && (
                                                <p className="video-description">{video.description}</p>
                                            )}
                                            
                                            <div className="video-meta">
                                                {video.resolution && (
                                                    <span className="video-resolution">{video.resolution}</span>
                                                )}
                                                {video.file_size && (
                                                    <span className="video-size">{formatFileSize(video.file_size)}</span>
                                                )}
                                                {video.download_count !== undefined && (
                                                    <span className="video-downloads">
                                                        <FontAwesomeIcon icon={faDownload} />
                                                        {video.download_count}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="video-actions">
                                                <button 
                                                    className="video-download-btn"
                                                    onClick={() => handleDownloadVideo(video)}
                                                    disabled={downloadingVideo === video.id || video.status !== 'ready'}
                                                >
                                                    {downloadingVideo === video.id ? (
                                                        <FontAwesomeIcon icon={faSpinner} spin />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faDownload} />
                                                    )}
                                                    Descargar
                                                </button>
                                                {video.status !== 'ready' && (
                                                    <span className="video-status-badge">
                                                        {video.status === 'processing' ? 'Procesando' : 'Subiendo'}
                                                    </span>
                                                )}
                                            </div>
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
                                ))
                            ) : (
                                <div className="video-empty-state">
                                    <FontAwesomeIcon icon={faVideo} size="3x" />
                                    <h3>No hay videos en esta galería</h3>
                                    <p>Los videos aparecerán aquí una vez que estén listos</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientVideosSection;