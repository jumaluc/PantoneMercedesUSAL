import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faImages, faChevronLeft, faChevronRight, faArrowUp, faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import './PublicGallery.css';
import { API_URL } from '../../../config/api';

// Renderiza el <img> solo cuando el item entra al viewport
const LazyGalleryImage = ({ src, alt, onClick }) => {
    const [inView, setInView] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect(); } },
            { rootMargin: '600px 0px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return (
        <div ref={containerRef} className="public-gallery__item" onClick={onClick}>
            {!loaded && <div className="public-gallery__img-skeleton" />}
            {inView && (
                <img
                    src={src}
                    alt={alt}
                    className="public-gallery__image"
                    style={loaded
                        ? { opacity: 1 }
                        : { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0 }}
                    onLoad={() => setLoaded(true)}
                    onError={(e) => { e.target.src = '/default-image.jpg'; setLoaded(true); }}
                />
            )}
        </div>
    );
};

// Cantidad de columnas del masonry según el ancho de pantalla (coincide con los breakpoints del CSS)
const getColumnCount = () => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
};

const useColumnCount = () => {
    const [count, setCount] = useState(getColumnCount);
    useEffect(() => {
        const onResize = () => setCount(getColumnCount());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    return count;
};

const PublicGallery = () => {
    const { category } = useParams();
    const [galleries, setGalleries] = useState([]); // Array de galerías de la categoría
    const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0); // Se navega de a una galería, como en la galería de clientes
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const columnCount = useColumnCount();

    const currentGallery = galleries[currentGalleryIndex] || null;
    const currentImages = currentGallery?.images || [];

    const navigateGallery = (direction) => {
        if (galleries.length <= 1) return;
        let newIndex = currentGalleryIndex + direction;
        if (newIndex < 0) newIndex = galleries.length - 1;
        if (newIndex >= galleries.length) newIndex = 0;
        setCurrentGalleryIndex(newIndex);
    };

    // Mapeo de categorías a service_types del backend
    const categoryToServiceType = {
        'casamientos': 'public-casamientos',
        'xv-anos': 'public-xv',
        'bautizos': 'public-bautizos',
        'general': 'public-gallery'
    };

    const categoryTitles = {
        'general': 'Nuestra Galería',
        'casamientos': 'Casamientos',
        'xv-anos': 'XV Años',
        'bautizos': 'Bautizos'
    };

    const categoryDescriptions = {
        'general': 'Explora todos nuestros trabajos y proyectos',
        'casamientos': 'Galería de nuestros hermosos casamientos',
        'xv-anos': 'Galería de quince años inolvidables',
        'bautizos': 'Galería de bautizos especiales'
    };

    const currentCategory = category || 'general';
    const serviceType = categoryToServiceType[currentCategory];

    useEffect(() => {
        fetchGalleriesData();
    }, [currentCategory]);

    // Cerrar el lightbox al cambiar de galería para no arrastrar un índice inválido
    useEffect(() => {
        setSelectedImage(null);
    }, [currentGalleryIndex]);

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const fetchGalleriesData = async () => {
        try {
            setLoading(true);
            setError(null);
            setGalleries([]);
            setCurrentGalleryIndex(0);

            if (currentCategory === 'general') {
                await fetchGeneralGalleries();
            } else {
                await fetchCategoryGalleries();
            }
            
        } catch (error) {
            console.error('Error fetching galleries data:', error);
            setError('Error al cargar las galerías. Por favor, intenta nuevamente.');
            setLoading(false);
        }
    };

    const fetchCategoryGalleries = async () => {
        try {
            // Cambiar el endpoint para obtener TODAS las galerías del tipo
            const response = await fetch(`${API_URL}/api/public/galleries/category/${serviceType}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.data) {
                // Ahora data.data es un array de galerías
                const galleriesData = Array.isArray(data.data) ? data.data : [data.data];
                setGalleries(galleriesData);
            } else {
                setError('No se encontraron galerías para esta categoría');
            }
        } catch (error) {
            console.error('Error fetching category galleries:', error);
            setError('No se pudieron cargar las galerías. Por favor, intenta más tarde.');
        } finally {
            setLoading(false);
        }
    };

    const fetchGeneralGalleries = async () => {
        try {
            // Para la galería general, obtener todas las galerías públicas
            const response = await fetch(`${API_URL}/api/public/galleries`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    const galleriesData = Array.isArray(data.data) ? data.data : [data.data];
                    setGalleries(galleriesData);
                } else {
                    setError('No hay galerías disponibles');
                }
            } else {
                setError('No hay galerías disponibles');
            }
        } catch (error) {
            console.error('Error fetching general galleries:', error);
            setError('No se pudieron cargar las galerías');
        } finally {
            setLoading(false);
        }
    };

    const openLightbox = (image, index) => {
        setSelectedImage({
            ...image,
            index,
            url: image.image_url || image.url
        });
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const navigateImage = (direction) => {
        if (!selectedImage) return;
        
        const newIndex = selectedImage.index + direction;
        if (newIndex >= 0 && newIndex < currentImages.length) {
            const newImage = {
                ...currentImages[newIndex],
                index: newIndex,
                url: currentImages[newIndex].image_url || currentImages[newIndex].url
            };
            setSelectedImage(newImage);
        }
    };

    // Manejar teclado en el lightbox
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!selectedImage) return;
            
            switch(e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    navigateImage(-1);
                    break;
                case 'ArrowRight':
                    navigateImage(1);
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [selectedImage]);

    if (loading) {
        return (
            <div className="public-gallery__loading">
                <div className="public-gallery__loading-spinner"></div>
                <p>Cargando galerías...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="public-gallery">
                <div className="public-gallery__header">
                    <div className="public-gallery__container">
                        <Link to="/" className="public-gallery__back-btn">
                            <FontAwesomeIcon icon={faHome} />
                            Volver al Inicio
                        </Link>
                        <h1 className="public-gallery__title">
                            {categoryTitles[currentCategory]}
                        </h1>
                    </div>
                </div>
                <div className="public-gallery__container">
                    <div className="public-gallery__error">
                        <p>{error}</p>
                        <Link to="/" className="public-gallery__back-home">
                            Volver al inicio
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="public-gallery">
            {/* Header */}
            <div className="public-gallery__header">
                <div className="public-gallery__container">
                    <div className="public-gallery__navigation">
                        <Link to="/" className="public-gallery__back-btn">
                            <FontAwesomeIcon icon={faHome} />
                            Volver al Inicio
                        </Link>
                    </div>

                    <h1 className="public-gallery__title">
                        {categoryTitles[currentCategory]}
                    </h1>
                    <p className="public-gallery__subtitle">
                        {currentGallery?.description || categoryDescriptions[currentCategory]}
                    </p>
                    <div className="public-gallery__count">
                        <FontAwesomeIcon icon={faImages} />
                        {currentImages.length} {currentImages.length === 1 ? 'imagen' : 'imágenes'}
                    </div>

                    {galleries.length > 1 && (
                        <div className="public-gallery__switcher">
                            <button
                                className="public-gallery__switcher-arrow"
                                onClick={() => navigateGallery(-1)}
                                aria-label="Galería anterior"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <span className="public-gallery__switcher-label">
                                <FontAwesomeIcon icon={faLayerGroup} />
                                {currentGallery?.title || `Galería ${currentGalleryIndex + 1}`} · {currentGalleryIndex + 1} de {galleries.length}
                            </span>
                            <button
                                className="public-gallery__switcher-arrow"
                                onClick={() => navigateGallery(1)}
                                aria-label="Siguiente galería"
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="public-gallery__container">
                {currentImages.length > 0 ? (
                    <div className="public-gallery__grid">
                        {Array.from({ length: columnCount }, (_, colIndex) => (
                            <div className="public-gallery__column" key={colIndex}>
                                {currentImages
                                    .map((image, index) => ({ image, index }))
                                    .filter((_, index) => index % columnCount === colIndex)
                                    .map(({ image, index }) => (
                                        <LazyGalleryImage
                                            key={image.id || `${image.gallery_id}-${index}`}
                                            src={image.image_url || image.url}
                                            alt={image.original_filename || image.title || `Imagen ${index + 1}`}
                                            onClick={() => openLightbox(image, index)}
                                        />
                                    ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="public-gallery__empty">
                        <p>No hay imágenes en esta categoría por el momento.</p>
                        <Link to="/" className="public-gallery__back-home">
                            Volver al inicio
                        </Link>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div className="public-gallery__lightbox" onClick={closeLightbox}>
                    <div className="public-gallery__lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="public-gallery__lightbox-close" 
                            onClick={closeLightbox}
                            aria-label="Cerrar lightbox"
                        >
                            ×
                        </button>
                        
                        <button 
                            className="public-gallery__lightbox-nav public-gallery__lightbox-prev"
                            onClick={() => navigateImage(-1)}
                            disabled={selectedImage.index === 0}
                            aria-label="Imagen anterior"
                        >
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>

                        <div className="public-gallery__lightbox-image-container">
                            <img
                                src={selectedImage.url}
                                alt={`Imagen ${selectedImage.index + 1}`}
                                className="public-gallery__lightbox-image"
                            />
                        </div>

                        <button 
                            className="public-gallery__lightbox-nav public-gallery__lightbox-next"
                            onClick={() => navigateImage(1)}
                            disabled={selectedImage.index === currentImages.length - 1}
                            aria-label="Imagen siguiente"
                        >
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>

                        <div className="public-gallery__lightbox-info">
                            <div className="public-gallery__lightbox-counter">
                                {selectedImage.index + 1} / {currentImages.length}
                            </div>
                            {selectedImage.file_size && (
                                <div className="public-gallery__lightbox-meta">
                                    Tamaño: {Math.round(selectedImage.file_size / 1024)} KB
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showScrollTop && (
                <button className="scroll-top-btn" onClick={scrollToTop} aria-label="Volver arriba">
                    <FontAwesomeIcon icon={faArrowUp} />
                </button>
            )}
        </div>
    );
};

export default PublicGallery;