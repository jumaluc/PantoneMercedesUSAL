import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faVideo, faDownload, faPlay, faPause, faClock,
    faSpinner, faCheckCircle, faEdit, faHourglassHalf,
    faSearch, faFileVideo, faHistory, faCalendarCheck,
    faExpand, faTimes, faImages
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './ClientVideosSection.css';

const STATUS_MAP = {
    waiting_selection: {
        text: 'Esperando selección',
        color: '#f59e0b',
        icon: faHourglassHalf,
        description: 'Estamos esperando que selecciones las imágenes para comenzar la edición.'
    },
    in_editing: {
        text: 'En edición',
        color: '#3b82f6',
        icon: faEdit,
        description: 'Tu video está siendo editado por nuestro equipo.'
    },
    completed: {
        text: 'Disponible',
        color: '#10b981',
        icon: faCheckCircle,
        description: 'Tu video está listo.'
    }
};

const FILTER_LABELS = {
    all: 'Todos',
    waiting_selection: 'Esperando',
    in_editing: 'En edición',
    completed: 'Disponibles'
};

const ClientVideosSection = ({ user }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => { fetchVideos(); }, []);

    const fetchVideos = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:3000/user/getMyVideos', { credentials: 'include' });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setVideos(data.videos || []);
        } catch {
            toast.error('Error al cargar los videos');
            setVideos([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (video) => {
        setDownloadingId(video.id);
        try {
            const res = await fetch(`http://localhost:3000/user/downloadVideo/${video.id}`, {
                credentials: 'include'
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Error al descargar');
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = video.original_filename || `${video.title}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            toast.error(err.message || 'Error al descargar el video');
        } finally {
            setDownloadingId(null);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString('es-AR', {
            day: '2-digit', month: 'long', year: 'numeric'
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return null;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
    };

    const filtered = videos.filter(v => {
        const matchesSearch = !searchTerm ||
            v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.description?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch && (filterStatus === 'all' || v.status === filterStatus);
    });

    if (loading) return (
        <div className="cvs-loading">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Cargando videos...</p>
        </div>
    );

    return (
        <div className="cvs-container">
            <div className="cvs-header">
                <h1><FontAwesomeIcon icon={faVideo} /> Mis Videos</h1>
                <p>Aquí encontrarás todos tus videos profesionales</p>
            </div>

            <div className="cvs-toolbar">
                <div className="cvs-search">
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="text"
                        placeholder="Buscar por título..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="cvs-filters">
                    {Object.entries(FILTER_LABELS).map(([key, label]) => (
                        <button
                            key={key}
                            className={`cvs-filter-btn ${filterStatus === key ? 'active' : ''}`}
                            onClick={() => setFilterStatus(key)}
                        >
                            {label}
                            {key !== 'all' && (
                                <span className="cvs-filter-count">
                                    {videos.filter(v => v.status === key).length}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="cvs-empty">
                    <FontAwesomeIcon icon={faVideo} />
                    <h3>No hay videos</h3>
                    <p>
                        {videos.length === 0
                            ? 'Tu fotógrafo te notificará cuando tengas videos disponibles.'
                            : 'No hay videos que coincidan con los filtros aplicados.'}
                    </p>
                </div>
            ) : (
                <div className="cvs-grid">
                    {filtered.map(video => {
                        const isAvailable = video.status === 'completed';
                        const statusInfo = STATUS_MAP[video.status] || STATUS_MAP.waiting_selection;
                        const isPlaying = playingId === video.id;

                        return (
                            <div key={video.id} className={`cvs-card ${isAvailable ? 'cvs-card--available' : ''}`}>

                                {/* Área de video */}
                                <div className="cvs-media">
                                    {isPlaying ? (
                                        <div className="cvs-player-wrap">
                                            <video
                                                controls
                                                autoPlay
                                                src={video.video_url}
                                                className="cvs-player"
                                            />
                                            <button className="cvs-close-player" onClick={() => setPlayingId(null)}>
                                                <FontAwesomeIcon icon={faTimes} />
                                            </button>
                                        </div>
                                    ) : isAvailable ? (
                                        <div className="cvs-thumbnail cvs-thumbnail--ready" onClick={() => setPlayingId(video.id)}>
                                            {video.thumbnail_url && (
                                                <img src={video.thumbnail_url} alt={video.title} className="cvs-thumbnail-img" />
                                            )}
                                            <div className="cvs-thumbnail-overlay">
                                                <div className="cvs-play-circle">
                                                    <FontAwesomeIcon icon={faPlay} />
                                                </div>
                                                <span className="cvs-play-label">Reproducir</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="cvs-thumbnail cvs-thumbnail--pending">
                                            <div className="cvs-status-icon" style={{ color: statusInfo.color }}>
                                                <FontAwesomeIcon icon={statusInfo.icon} />
                                            </div>
                                            <span className="cvs-status-text">{statusInfo.text}</span>
                                            <p className="cvs-status-desc">{statusInfo.description}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="cvs-info">
                                    <div className="cvs-info-top">
                                        <h3 className="cvs-title">{video.title}</h3>
                                        <span className="cvs-badge" style={{ background: statusInfo.color }}>
                                            <FontAwesomeIcon icon={statusInfo.icon} />
                                            {statusInfo.text}
                                        </span>
                                    </div>

                                    {video.gallery_title && (
                                        <div className="cvs-gallery-tag">
                                            <FontAwesomeIcon icon={faImages} />
                                            {video.gallery_title}
                                        </div>
                                    )}

                                    {video.description && (
                                        <p className="cvs-description">{video.description}</p>
                                    )}

                                    <div className="cvs-meta">
                                        {isAvailable ? (
                                            <span className="cvs-meta-item">
                                                <FontAwesomeIcon icon={faCalendarCheck} />
                                                Publicado el {formatDate(video.created_at)}
                                            </span>
                                        ) : video.estimated_delivery ? (
                                            <span className="cvs-meta-item">
                                                <FontAwesomeIcon icon={faClock} />
                                                Entrega estimada: {formatDate(video.estimated_delivery)}
                                            </span>
                                        ) : null}

                                        {video.file_size && isAvailable && (
                                            <span className="cvs-meta-item cvs-meta-item--secondary">
                                                <FontAwesomeIcon icon={faFileVideo} />
                                                {formatFileSize(video.file_size)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="cvs-actions">
                                        {isAvailable ? (
                                            <>
                                                <button
                                                    className="cvs-btn cvs-btn--play"
                                                    onClick={() => setPlayingId(isPlaying ? null : video.id)}
                                                >
                                                    <FontAwesomeIcon icon={isPlaying ? faTimes : faExpand} />
                                                    {isPlaying ? 'Cerrar' : 'Ver video'}
                                                </button>
                                                <button
                                                    className="cvs-btn cvs-btn--download"
                                                    onClick={() => handleDownload(video)}
                                                    disabled={downloadingId === video.id}
                                                >
                                                    {downloadingId === video.id
                                                        ? <FontAwesomeIcon icon={faSpinner} spin />
                                                        : <FontAwesomeIcon icon={faDownload} />
                                                    }
                                                    {downloadingId === video.id ? 'Descargando...' : 'Descargar'}
                                                </button>
                                            </>
                                        ) : (
                                            <div className="cvs-unavailable-msg">
                                                <FontAwesomeIcon icon={statusInfo.icon} style={{ color: statusInfo.color }} />
                                                Te avisaremos cuando esté listo
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ClientVideosSection;
