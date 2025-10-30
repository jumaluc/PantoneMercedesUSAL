import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faExpand, faHome, faImages } from '@fortawesome/free-solid-svg-icons';
import './PublicGallery.css';

const PublicGallery = () => {
    const { category } = useParams();
    const [galleries, setGalleries] = useState([]); // Cambié a array de galerías
    const [allImages, setAllImages] = useState([]); // Todas las imágenes de todas las galerías
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const fetchGalleriesData = async () => {
        try {
            setLoading(true);
            setError(null);
            setGalleries([]);
            setAllImages([]);

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
            const response = await fetch(`http://localhost:3000/api/public/galleries/category/${serviceType}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.success && data.data) {
                // Ahora data.data es un array de galerías
                const galleriesData = Array.isArray(data.data) ? data.data : [data.data];
                setGalleries(galleriesData);
                
                // Extraer todas las imágenes de todas las galerías
                const allImagesFromGalleries = galleriesData.flatMap(gallery => 
                    gallery.images || []
                );
                setAllImages(allImagesFromGalleries);
                
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
            const response = await fetch('http://localhost:3000/api/public/galleries');
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    const galleriesData = Array.isArray(data.data) ? data.data : [data.data];
                    setGalleries(galleriesData);
                    
                    const allImagesFromGalleries = galleriesData.flatMap(gallery => 
                        gallery.images || []
                    );
                    setAllImages(allImagesFromGalleries);
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
            url: image.image_url || image.url,
            title: image.original_filename || image.title || `Imagen ${index + 1}`
        });
    };

    const closeLightbox = () => {
        setSelectedImage(null);
    };

    const navigateImage = (direction) => {
        if (!selectedImage) return;
        
        const newIndex = selectedImage.index + direction;
        if (newIndex >= 0 && newIndex < allImages.length) {
            const newImage = { 
                ...allImages[newIndex], 
                index: newIndex,
                url: allImages[newIndex].image_url || allImages[newIndex].url,
                title: allImages[newIndex].original_filename || allImages[newIndex].title || `Imagen ${newIndex + 1}`
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
                        {currentCategory !== 'general' && (
                            <Link to="/public/gallery" className="public-gallery__back-to-gallery">
                                <FontAwesomeIcon icon={faArrowLeft} />
                                Volver a Galería General
                            </Link>
                        )}
                    </div>
                    
                    <h1 className="public-gallery__title">
                        {categoryTitles[currentCategory]}
                    </h1>
                    <p className="public-gallery__subtitle">
                        {categoryDescriptions[currentCategory]}
                    </p>
                    <div className="public-gallery__count">
                        <FontAwesomeIcon icon={faImages} />
                        {galleries.length} {galleries.length === 1 ? 'galería' : 'galerías'} • 
                        {allImages.length} {allImages.length === 1 ? 'imagen' : 'imágenes'}
                    </div>

                    {/* Mostrar títulos de las galerías si hay más de una */}
                    {galleries.length > 1 && (
                        <div className="public-gallery__galleries-list">
                            <h3>Galerías en esta categoría:</h3>
                            <div className="public-gallery__galleries-titles">
                                {galleries.map((gallery, index) => (
                                    <span key={gallery.id} className="public-gallery__gallery-title">
                                        {gallery.title}
                                        {index < galleries.length - 1 && ', '}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="public-gallery__container">
                {allImages.length > 0 ? (
                    <div className="public-gallery__grid">
                        {allImages.map((image, index) => (
                            <div 
                                key={image.id || `${image.gallery_id}-${index}`} 
                                className="public-gallery__item"
                                onClick={() => openLightbox(image, index)}
                            >
                                <img 
                                    src={image.image_url || image.url} 
                                    alt={image.original_filename || image.title || `Imagen ${index + 1}`}
                                    className="public-gallery__image"
                                    onError={(e) => {
                                        e.target.src = '/default-image.jpg';
                                    }}
                                    loading="lazy"
                                />
                                <div className="public-gallery__overlay">
                                    <FontAwesomeIcon icon={faExpand} className="public-gallery__zoom-icon" />
                                </div>
                                <div className="public-gallery__info">
                                    <div className="public-gallery__image-title">
                                        {image.original_filename || image.title || `Imagen ${index + 1}`}
                                    </div>
                                    {image.is_primary && (
                                        <div className="public-gallery__primary-badge">
                                            Principal
                                        </div>
                                    )}
                                </div>
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
                            ‹
                        </button>

                        <div className="public-gallery__lightbox-image-container">
                            <img 
                                src={selectedImage.url} 
                                alt={selectedImage.title}
                                className="public-gallery__lightbox-image"
                            />
                        </div>

                        <button 
                            className="public-gallery__lightbox-nav public-gallery__lightbox-next"
                            onClick={() => navigateImage(1)}
                            disabled={selectedImage.index === allImages.length - 1}
                            aria-label="Imagen siguiente"
                        >
                            ›
                        </button>

                        <div className="public-gallery__lightbox-info">
                            <div className="public-gallery__lightbox-counter">
                                {selectedImage.index + 1} / {allImages.length}
                            </div>
                            <div className="public-gallery__lightbox-title">
                                {selectedImage.title}
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
        </div>
    );
};

export default PublicGallery;