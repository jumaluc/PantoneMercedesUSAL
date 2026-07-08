import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faComment, faCheckCircle, faClock, faSpinner,
    faSearch, faImages, faThumbsUp, faTimes, faExpand
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import './CommentsSection.css';

const CommentsSection = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [marking, setMarking] = useState(null);
    const [lightboxImage, setLightboxImage] = useState(null);

    useEffect(() => { fetchComments(); }, []);

    useEffect(() => {
        if (!lightboxImage) return;
        const handleKeyDown = (e) => { if (e.key === 'Escape') setLightboxImage(null); };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [lightboxImage]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:3000/admin/comments', { credentials: 'include' });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const list = data.data || [];
            setComments(list);
            setFilter(list.some(c => !c.admin_seen) ? 'pending' : 'all');
        } catch {
            toast.error('Error al cargar los comentarios', { id: 'comments-fetch' });
        } finally {
            setLoading(false);
        }
    };

    const markAsSeen = async (id) => {
        setMarking(id);
        try {
            const res = await fetch(`http://localhost:3000/admin/comments/${id}/seen`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!res.ok) throw new Error();
            setComments(prev => prev.map(c => c.id === id ? { ...c, admin_seen: 1 } : c));
            toast.success('Marcado como visto');
        } catch {
            toast.error('Error al marcar el comentario');
        } finally {
            setMarking(null);
        }
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('es-AR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const filtered = comments.filter(c => {
        const matchFilter =
            filter === 'all' ||
            (filter === 'pending' && !c.admin_seen) ||
            (filter === 'seen' && c.admin_seen);
        const matchSearch = !search ||
            `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
            c.comment.toLowerCase().includes(search.toLowerCase()) ||
            c.gallery_title?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const pendingCount = comments.filter(c => !c.admin_seen).length;

    if (loading) return (
        <div className="cs-loading">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Cargando comentarios...</p>
        </div>
    );

    return (
        <div className="cs-container">
            <div className="cs-header">
                <div className="cs-header-left">
                    <h2><FontAwesomeIcon icon={faComment} /> Comentarios de Clientes</h2>
                    <p>Comentarios que los clientes dejaron en sus fotos</p>
                </div>
                {pendingCount > 0 && (
                    <div className="cs-pending-badge">
                        <span>{pendingCount}</span>
                        <label>sin ver</label>
                    </div>
                )}
            </div>

            <div className="cs-toolbar">
                <div className="cs-search">
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente, galería o comentario..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="cs-filters">
                    {[
                        { key: 'pending', label: `Sin ver (${pendingCount})` },
                        { key: 'seen',    label: 'Vistos' },
                        { key: 'all',     label: 'Todos' }
                    ].map(f => (
                        <button
                            key={f.key}
                            className={`cs-filter-btn ${filter === f.key ? 'active' : ''}`}
                            onClick={() => setFilter(f.key)}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="cs-empty">
                    <FontAwesomeIcon icon={faComment} />
                    <h3>Sin comentarios</h3>
                    <p>{filter === 'pending'
                        ? 'No hay comentarios pendientes de revisar.'
                        : 'No hay comentarios para mostrar.'}</p>
                </div>
            ) : (
                <div className="cs-list">
                    {filtered.map(c => (
                        <div key={c.id} className={`cs-card ${c.admin_seen ? 'cs-card--seen' : ''}`}>
                            <div
                                className="cs-card-image"
                                onClick={() => setLightboxImage({ url: c.image_url, title: c.original_filename || 'foto' })}
                            >
                                <img src={c.image_url} alt={c.original_filename || 'foto'} />
                                <div className="cs-card-image-overlay">
                                    <FontAwesomeIcon icon={faExpand} />
                                </div>
                            </div>

                            <div className="cs-card-body">
                                <div className="cs-card-top">
                                    <div className="cs-client-info">
                                        <div className="cs-avatar">
                                            {c.first_name?.[0]}{c.last_name?.[0]}
                                        </div>
                                        <div className="cs-client-text">
                                            <span className="cs-client-name">{c.first_name} {c.last_name}</span>
                                            <span className="cs-client-email">{c.email}</span>
                                        </div>
                                    </div>
                                    <div className="cs-meta">
                                        <span className="cs-gallery">
                                            <FontAwesomeIcon icon={faImages} />
                                            {c.gallery_title}
                                        </span>
                                        <span className="cs-date">
                                            <FontAwesomeIcon icon={faClock} />
                                            {formatDate(c.created_at)}
                                        </span>
                                    </div>
                                </div>

                                <div className="cs-comment-text">
                                    <p>"{c.comment}"</p>
                                </div>

                                <div className="cs-card-footer">
                                    {c.admin_seen ? (
                                        <span className="cs-seen-badge">
                                            <FontAwesomeIcon icon={faCheckCircle} /> Visto
                                        </span>
                                    ) : (
                                        <button
                                            className="cs-ok-btn"
                                            onClick={() => markAsSeen(c.id)}
                                            disabled={marking === c.id}
                                            title="Marcar como visto — el cliente verá que fue revisado"
                                        >
                                            {marking === c.id
                                                ? <FontAwesomeIcon icon={faSpinner} spin />
                                                : <FontAwesomeIcon icon={faThumbsUp} />
                                            }
                                            OK — Visto
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {lightboxImage && (
                <div className="cs-lightbox" onClick={() => setLightboxImage(null)}>
                    <button className="cs-lightbox-close" onClick={() => setLightboxImage(null)} aria-label="Cerrar">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                    <img
                        src={lightboxImage.url}
                        alt={lightboxImage.title}
                        className="cs-lightbox-image"
                        onClick={e => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
};

export default CommentsSection;
