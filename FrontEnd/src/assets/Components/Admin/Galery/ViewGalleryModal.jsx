import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes, faSpinner, faImages, faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import './ViewGalleryModal.css';

const ViewGalleryModal = ({ gallery, isOpen, onClose }) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(null);

    useEffect(() => {
        if (isOpen && gallery) {
            fetchImages();
            setSelectedIndex(null);
        }
    }, [isOpen, gallery]);

    const fetchImages = async () => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/admin/getGalleryImages/${gallery.id}`, { credentials: 'include' });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setImages(data.data || []);
        } catch {
            toast.error('Error al cargar las imágenes');
        } finally {
            setLoading(false);
        }
    };

    const showPrev = useCallback(() => {
        setSelectedIndex(prev => (prev === null ? prev : (prev - 1 + images.length) % images.length));
    }, [images.length]);

    const showNext = useCallback(() => {
        setSelectedIndex(prev => (prev === null ? prev : (prev + 1) % images.length));
    }, [images.length]);

    useEffect(() => {
        if (selectedIndex === null) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedIndex(null);
            if (e.key === 'ArrowLeft') showPrev();
            if (e.key === 'ArrowRight') showNext();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, showPrev, showNext]);

    if (!isOpen) return null;

    const selectedImage = selectedIndex !== null ? images[selectedIndex] : null;

    return (
        <div className="vgm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="vgm-modal">
                <div className="vgm-header">
                    <div className="vgm-title">
                        <FontAwesomeIcon icon={faImages} />
                        <h2>{gallery.title}</h2>
                        <span className="vgm-count">({images.length} {images.length === 1 ? 'foto' : 'fotos'})</span>
                    </div>
                    <button className="vgm-close" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="vgm-body">
                    {loading ? (
                        <div className="vgm-loading">
                            <FontAwesomeIcon icon={faSpinner} spin />
                            <span>Cargando imágenes...</span>
                        </div>
                    ) : images.length === 0 ? (
                        <p className="vgm-no-images">Esta galería no tiene imágenes</p>
                    ) : (
                        <div className="vgm-grid">
                            {images.map((img, index) => (
                                <div
                                    key={img.id}
                                    className="vgm-thumb"
                                    onClick={() => setSelectedIndex(index)}
                                >
                                    <img src={img.image_url} alt={img.original_filename || 'foto'} loading="lazy" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {selectedImage && (
                <div className="vgm-lightbox" onClick={(e) => e.stopPropagation()}>
                    <button className="vgm-lightbox-close" onClick={() => setSelectedIndex(null)} aria-label="Cerrar">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>

                    {images.length > 1 && (
                        <button className="vgm-lightbox-nav vgm-lightbox-prev" onClick={showPrev} aria-label="Imagen anterior">
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                    )}

                    <div className="vgm-lightbox-image-container">
                        <img src={selectedImage.image_url} alt={selectedImage.original_filename || 'foto'} className="vgm-lightbox-image" />
                        <div className="vgm-lightbox-counter">
                            {selectedIndex + 1} / {images.length}
                        </div>
                    </div>

                    {images.length > 1 && (
                        <button className="vgm-lightbox-nav vgm-lightbox-next" onClick={showNext} aria-label="Imagen siguiente">
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default ViewGalleryModal;
