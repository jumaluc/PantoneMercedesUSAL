import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBuilding,
    faImages,
    faCommentDots,
    faQuestionCircle,
    faFileContract,
    faStar,
    faEdit,
    faTrash,
    faPlus,
    faImage
} from '@fortawesome/free-solid-svg-icons';
import './PublicContentManagement.css';

const PublicContentManagement = () => {
    const [activeTab, setActiveTab] = useState('company');

    const tabs = [
        { id: 'company', label: 'Información Empresa', icon: faBuilding },
        { id: 'galleries', label: 'Galerías Públicas', icon: faImages },
        { id: 'reviews', label: 'Reseñas', icon: faCommentDots },
        { id: 'faqs', label: 'Preguntas Frecuentes', icon: faQuestionCircle },
        { id: 'policies', label: 'Políticas', icon: faFileContract }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'company':
                return <CompanyInfoManagement />;
            case 'galleries':
                return <PublicGalleriesManagement />;
            case 'reviews':
                return <ReviewsManagement />;
            case 'faqs':
                return <FAQsManagement />;
            case 'policies':
                return <PoliciesManagement />;
            default:
                return <CompanyInfoManagement />;
        }
    };

    return (
        <div className="public-content-management">
            <div className="public-content-management__header">
                <h1 className="public-content-management__title">
                    Gestión de Contenido Público
                </h1>
                <p className="public-content-management__subtitle">
                    Administra la información visible en el sitio web público
                </p>
            </div>

            <div className="public-content-management__tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`public-content-management__tab ${activeTab === tab.id ? 'public-content-management__tab--active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <FontAwesomeIcon icon={tab.icon} className="public-content-management__tab-icon" />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="public-content-management__content">
                {renderContent()}
            </div>
        </div>
    );
};

// Componente para Información de la Empresa
const CompanyInfoManagement = () => {
    const [companyInfo, setCompanyInfo] = useState({
        company_name: '',
        description: '',
        email: '',
        phone: '',
        address: '',
        social_media: {
            facebook: '',
            instagram: '',
            twitter: ''
        }
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCompanyInfo();
    }, []);

    const fetchCompanyInfo = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/admin/public-content/company-info', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                if (data.data) {
                    setCompanyInfo({
                        ...data.data,
                        social_media: data.data.social_media || {
                            facebook: '',
                            instagram: '',
                            twitter: ''
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching company info:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch('http://localhost:3000/api/admin/public-content/company-info', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(companyInfo)
            });

            if (response.ok) {
                alert('Información actualizada correctamente');
            } else {
                alert('Error al actualizar la información');
            }
        } catch (error) {
            console.error('Error updating company info:', error);
            alert('Error al actualizar la información');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCompanyInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSocialMediaChange = (platform, value) => {
        setCompanyInfo(prev => ({
            ...prev,
            social_media: {
                ...prev.social_media,
                [platform]: value
            }
        }));
    };

    return (
        <div className="company-info-management">
            <h2 className="company-info-management__title">Información de la Empresa</h2>
            <form onSubmit={handleSubmit} className="company-info-management__form">
                <div className="company-info-management__form-grid">
                    <div className="company-info-management__form-group">
                        <label className="company-info-management__label">Nombre de la Empresa</label>
                        <input
                            type="text"
                            name="company_name"
                            value={companyInfo.company_name}
                            onChange={handleChange}
                            className="company-info-management__input"
                            required
                        />
                    </div>

                    <div className="company-info-management__form-group company-info-management__form-group--full">
                        <label className="company-info-management__label">Descripción</label>
                        <textarea
                            name="description"
                            value={companyInfo.description}
                            onChange={handleChange}
                            className="company-info-management__textarea"
                            rows="4"
                            required
                        />
                    </div>

                    <div className="company-info-management__form-group">
                        <label className="company-info-management__label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={companyInfo.email}
                            onChange={handleChange}
                            className="company-info-management__input"
                        />
                    </div>

                    <div className="company-info-management__form-group">
                        <label className="company-info-management__label">Teléfono</label>
                        <input
                            type="tel"
                            name="phone"
                            value={companyInfo.phone}
                            onChange={handleChange}
                            className="company-info-management__input"
                        />
                    </div>

                    <div className="company-info-management__form-group company-info-management__form-group--full">
                        <label className="company-info-management__label">Dirección</label>
                        <textarea
                            name="address"
                            value={companyInfo.address}
                            onChange={handleChange}
                            className="company-info-management__textarea"
                            rows="3"
                        />
                    </div>

                    <div className="company-info-management__form-group company-info-management__form-group--full">
                        <label className="company-info-management__label">Redes Sociales</label>
                        <div className="company-info-management__social-grid">
                            <div className="company-info-management__social-input">
                                <label>Facebook</label>
                                <input
                                    type="url"
                                    value={companyInfo.social_media.facebook}
                                    onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                                    className="company-info-management__input"
                                    placeholder="https://facebook.com/..."
                                />
                            </div>
                            <div className="company-info-management__social-input">
                                <label>Instagram</label>
                                <input
                                    type="url"
                                    value={companyInfo.social_media.instagram}
                                    onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                                    className="company-info-management__input"
                                    placeholder="https://instagram.com/..."
                                />
                            </div>
                            <div className="company-info-management__social-input">
                                <label>Twitter</label>
                                <input
                                    type="url"
                                    value={companyInfo.social_media.twitter}
                                    onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                                    className="company-info-management__input"
                                    placeholder="https://twitter.com/..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="company-info-management__actions">
                    <button 
                        type="submit" 
                        className="company-info-management__submit-btn"
                        disabled={loading}
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// Componente para Galerías Públicas
const PublicGalleriesManagement = () => {
    const [galleries, setGalleries] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingGallery, setEditingGallery] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        service_type: 'public-casamientos',
        description: '',
        images: []
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const serviceTypes = [
        { value: 'public-casamientos', label: 'Casamientos' },
        { value: 'public-xv', label: 'XV Años' },
        { value: 'public-bautizos', label: 'Bautizos' }
    ];

    useEffect(() => {
        fetchPublicGalleries();
    }, []);

    const fetchPublicGalleries = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/admin/public-content/getPublicGalleries', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setGalleries(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching public galleries:', error);
        } finally {
            setLoading(false);
        }
    };
const handleImageUpload = async (files) => {
    setUploading(true);
    const uploadedImages = [];

    try {
        for (let file of files) {
            // Guardar el archivo File para enviarlo después
            uploadedImages.push({
                file: file, // Guardar el objeto File
                image_url: URL.createObjectURL(file), // Para previsualización
                original_filename: file.name,
                storage_filename: file.name,
                file_path: file.name,
                is_primary: uploadedImages.length === 0
            });
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...uploadedImages]
        }));
    } catch (error) {
        console.error('Error processing images:', error);
    } finally {
        setUploading(false);
    }
};

    const handleRemoveImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const url = editingGallery 
            ? `http://localhost:3000/api/admin/public-content/public-galleries/${editingGallery.id}`
            : 'http://localhost:3000/admin/public-content/createPublicGallery';

        const method = editingGallery ? 'PUT' : 'POST';

        // Usar FormData en lugar de JSON
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title);
        formDataToSend.append('service_type', formData.service_type);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('status', 'active');

        // Agregar las imágenes como archivos
        formData.images.forEach((image, index) => {
            // Si la imagen ya es un File (recién seleccionada)
            if (image.file) {
                formDataToSend.append('images', image.file);
            }
            // Si es una imagen existente con URL, necesitarías un approach diferente
        });

        console.log("Enviando FormData con:", {
            title: formData.title,
            service_type: formData.service_type,
            imagesCount: formData.images.length
        });

        const response = await fetch(url, {
            method,
            credentials: 'include',
            body: formDataToSend // NO establecer Content-Type header, el browser lo hará automáticamente
        });

        if (response.ok) {
            const result = await response.json();
            alert(editingGallery ? 'Galería actualizada' : 'Galería creada');
            setShowForm(false);
            setEditingGallery(null);
            setFormData({
                title: '',
                service_type: 'public-casamientos',
                description: '',
                images: []
            });
            fetchPublicGalleries();
        } else {
            const error = await response.json();
            alert(error.message || 'Error al guardar la galería');
        }
    } catch (error) {
        console.error('Error saving gallery:', error);
        alert('Error al guardar la galería');
    }
};

    const handleEdit = (gallery) => {
        setEditingGallery(gallery);
        setFormData({
            title: gallery.title,
            service_type: gallery.service_type,
            description: gallery.description || '',
            images: gallery.images || []
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar esta galería pública?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/public-content/public-galleries/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('Galería eliminada');
                    fetchPublicGalleries();
                }
            } catch (error) {
                console.error('Error deleting gallery:', error);
                alert('Error al eliminar la galería');
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const getServiceTypeLabel = (serviceType) => {
        const type = serviceTypes.find(t => t.value === serviceType);
        return type ? type.label : serviceType;
    };

    if (loading) {
        return (
            <div className="public-content-management__loading">
                <div className="public-content-management__loading-spinner"></div>
                <p>Cargando galerías públicas...</p>
            </div>
        );
    }

return (
    <div className="public-galleries-management">
        <div className="public-galleries-management__header">
            <h2 className="public-galleries-management__title">Gestión de Galerías Públicas</h2>
            <button 
                className="public-galleries-management__add-btn"
                onClick={() => {
                    setShowForm(true);
                    setEditingGallery(null);
                    setFormData({
                        title: '',
                        service_type: 'public-casamientos',
                        description: '',
                        images: []
                    });
                }}
            >
                <FontAwesomeIcon icon={faPlus} />
                Agregar Galería
            </button>
        </div>

        {showForm && (
            <div className="public-galleries-management__form-overlay">
                <div className="public-galleries-management__form">
                    <h3>{editingGallery ? 'Editar Galería Pública' : 'Nueva Galería Pública'}</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="company-info-management__form-grid">

                            {/* Título */}
                            <div className="company-info-management__form-group company-info-management__form-group--full">
                                <label className="company-info-management__label">Título</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleFormChange}
                                    className="company-info-management__input"
                                    required
                                    placeholder="Ej: Casamiento de María y Juan"
                                />
                            </div>

                            {/* Tipo de galería */}
                            <div className="company-info-management__form-group">
                                <label className="company-info-management__label">Tipo de Galería</label>
                                <select
                                    name="service_type"
                                    value={formData.service_type}
                                    onChange={handleFormChange}
                                    className="company-info-management__input"
                                    required
                                >
                                    {serviceTypes.map(type => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Descripción */}
                            <div className="company-info-management__form-group company-info-management__form-group--full">
                                <label className="company-info-management__label">Descripción</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleFormChange}
                                    className="company-info-management__textarea"
                                    rows="3"
                                    placeholder="Descripción de la galería..."
                                />
                            </div>

                            {/* Imágenes */}
                            <div className="company-info-management__form-group company-info-management__form-group--full">
                                <label className="company-info-management__label">
                                    Imágenes ({formData.images.length} seleccionadas)
                                    {uploading && (
                                        <span style={{ color: '#e88f01', marginLeft: '10px' }}>
                                            Subiendo...
                                        </span>
                                    )}
                                </label>

                                {/* Input mejorado */}
                                <div className="public-galleries-management__file-upload-area">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files.length > 0) {
                                                handleImageUpload(Array.from(e.target.files));
                                            }
                                            e.target.value = ''; // reset input
                                        }}
                                        className="public-galleries-management__file-input"
                                        disabled={uploading}
                                        id="gallery-images-upload"
                                    />
                                    <label 
                                        htmlFor="gallery-images-upload" 
                                        className="public-galleries-management__file-upload-label"
                                    >
                                        <FontAwesomeIcon icon={faPlus} />
                                        Seleccionar Imágenes
                                    </label>
                                    <p className="public-galleries-management__file-help">
                                        Puedes seleccionar múltiples imágenes (JPG, PNG, etc.)
                                    </p>
                                </div>

                                {/* Previsualizaciones */}
                                {formData.images.length > 0 && (
                                    <div className="public-galleries-management__image-previews">
                                        {formData.images.map((image, index) => (
                                            <div key={index} className="public-galleries-management__image-item">
                                                <img src={image.image_url} alt={image.original_filename} />
                                                <button
                                                    type="button"
                                                    className="public-galleries-management__remove-image"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    ×
                                                </button>
                                                {image.is_primary && (
                                                    <span className="public-galleries-management__primary-badge">
                                                        Principal
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="public-galleries-management__form-actions">
                            <button 
                                type="submit" 
                                className="public-galleries-management__save-btn"
                                disabled={uploading || formData.images.length === 0}
                            >
                                {editingGallery ? 'Actualizar' : 'Crear'} Galería
                            </button>
                            <button 
                                type="button" 
                                className="public-galleries-management__cancel-btn"
                                onClick={() => setShowForm(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* Listado de galerías */}
        {galleries.length === 0 ? (
            <div className="public-content-management__empty">
                <FontAwesomeIcon icon={faImages} className="public-content-management__empty-icon" />
                <p className="public-content-management__empty-text">
                    No hay galerías públicas registradas
                </p>
                <button 
                    className="public-galleries-management__add-btn"
                    onClick={() => setShowForm(true)}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Agregar Primera Galería
                </button>
            </div>
        ) : (
            <div className="public-galleries-management__grid">
                {galleries.map(gallery => (
                    <div key={gallery.id} className="public-galleries-management__card">
                        <div className="public-galleries-management__card-image">
                            {gallery.cover_image_url ? (
                                <img src={gallery.cover_image_url} alt={gallery.title} />
                            ) : (
                                <div className="public-galleries-management__no-image">
                                    <FontAwesomeIcon icon={faImage} />
                                    <span>Sin imagen</span>
                                </div>
                            )}
                            <span className="public-galleries-management__type-badge">
                                {getServiceTypeLabel(gallery.service_type)}
                            </span>
                        </div>

                        <div className="public-galleries-management__card-content">
                            <h3 className="public-galleries-management__card-title">{gallery.title}</h3>
                            <p className="public-galleries-management__card-description">
                                {gallery.description || 'Sin descripción'}
                            </p>

                            <div className="public-galleries-management__card-meta">
                                <div className="public-galleries-management__card-images">
                                    <FontAwesomeIcon icon={faImage} />
                                    {gallery.photos_count || 0} imágenes
                                </div>
                                <div className="public-galleries-management__card-date">
                                    {new Date(gallery.created_at).toLocaleDateString('es-ES')}
                                </div>
                            </div>

                            <div className="public-galleries-management__card-actions">
                                <button 
                                    onClick={() => handleEdit(gallery)}
                                    className="public-galleries-management__edit-btn"
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDelete(gallery.id)}
                                    className="public-galleries-management__delete-btn"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

};

// Componente para Reseñas (admin)
const ReviewsManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { fetchReviews(); }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch('http://localhost:3000/admin/reviews', { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setReviews(data.reviews || []);
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleLike = async (id) => {
        try {
            const res = await fetch(`http://localhost:3000/user/toggleLike/${id}`, {
                method: 'POST',
                credentials: 'include'
            });
            if (!res.ok) return;
            setReviews(prev => prev.map(r => {
                if (r.id !== id) return r;
                const liked = Number(r.user_has_liked) === 1;
                return {
                    ...r,
                    user_has_liked: liked ? 0 : 1,
                    likes_count: liked ? Number(r.likes_count) - 1 : Number(r.likes_count) + 1
                };
            }));
        } catch (error) {
            console.error('Error toggling like:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar esta reseña definitivamente?')) return;
        try {
            const res = await fetch(`http://localhost:3000/admin/reviews/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setReviews(prev => prev.filter(r => r.id !== id));
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        }
    };

    const renderStars = (rating) => Array.from({ length: 5 }, (_, i) => (
        <FontAwesomeIcon
            key={i}
            icon={faStar}
            className={i < rating ? 'testimonials-management__star--active' : 'testimonials-management__star'}
        />
    ));

    if (loading) {
        return (
            <div className="public-content-management__loading">
                <div className="public-content-management__loading-spinner"></div>
                <p>Cargando reseñas...</p>
            </div>
        );
    }

    return (
        <div className="testimonials-management">
            <div className="testimonials-management__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 className="testimonials-management__title">Reseñas</h2>
                    <span className="admin-reviews__count">{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</span>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="public-content-management__empty">
                    <FontAwesomeIcon icon={faCommentDots} className="public-content-management__empty-icon" />
                    <p className="public-content-management__empty-text">Todavía no hay reseñas de clientes</p>
                </div>
            ) : (
                <div className="testimonials-management__grid">
                    {reviews.map(review => {
                        const initials = `${review.first_name[0]}${review.last_name[0]}`.toUpperCase();
                        const liked = Number(review.user_has_liked) === 1;
                        return (
                            <div key={review.id} className="testimonials-management__card admin-review-card">
                                <div className="testimonials-management__card-header">
                                    <div className="testimonials-management__client-info">
                                        <div className="admin-review-avatar">{initials}</div>
                                        <div className="testimonials-management__client-details">
                                            <h4 className="testimonials-management__client-name">
                                                {review.first_name} {review.last_name}
                                            </h4>
                                            <p className="testimonials-management__client-project">
                                                {review.service || 'Cliente'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="testimonials-management__rating">
                                        {renderStars(review.rating)}
                                    </div>
                                </div>

                                <div className="testimonials-management__content">
                                    "{review.message}"
                                </div>

                                <div className="admin-review-footer">
                                    <span className="admin-review-date">
                                        {new Date(review.created_at).toLocaleDateString('es-AR', {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </span>
                                    <div className="admin-review-actions">
                                        <button
                                            className={`admin-review-like-btn ${liked ? 'admin-review-like-btn--active' : ''}`}
                                            onClick={() => handleToggleLike(review.id)}
                                            title={liked ? 'Quitar like' : 'Dar like'}
                                        >
                                            ♥ {review.likes_count > 0 ? review.likes_count : ''}
                                        </button>
                                        <button
                                            className="testimonials-management__delete-btn"
                                            onClick={() => handleDelete(review.id)}
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                            Eliminar
                                        </button>
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

// Componente para Preguntas Frecuentes
const FAQsManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingFaq, setEditingFaq] = useState(null);
    const [formData, setFormData] = useState({
        question: '',
        answer: '',
        category: '',
        order_index: 0,
        status: 'active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/admin/public-content/faqs', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setFaqs(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingFaq 
                ? `http://localhost:3000/api/admin/public-content/faqs/${editingFaq.id}`
                : 'http://localhost:3000/api/admin/public-content/faqs';
            
            const method = editingFaq ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(editingFaq ? 'FAQ actualizado' : 'FAQ creado');
                setShowForm(false);
                setEditingFaq(null);
                setFormData({
                    question: '',
                    answer: '',
                    category: '',
                    order_index: 0,
                    status: 'active'
                });
                fetchFAQs();
            }
        } catch (error) {
            console.error('Error saving FAQ:', error);
            alert('Error al guardar el FAQ');
        }
    };

    const handleEdit = (faq) => {
        setEditingFaq(faq);
        setFormData({
            question: faq.question,
            answer: faq.answer,
            category: faq.category,
            order_index: faq.order_index,
            status: faq.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este FAQ?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/public-content/faqs/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('FAQ eliminado');
                    fetchFAQs();
                }
            } catch (error) {
                console.error('Error deleting FAQ:', error);
                alert('Error al eliminar el FAQ');
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="public-content-management__loading">
                <div className="public-content-management__loading-spinner"></div>
                <p>Cargando FAQs...</p>
            </div>
        );
    }

    return (
        <div className="faqs-management">
            <div className="faqs-management__header">
                <h2 className="faqs-management__title">Gestión de Preguntas Frecuentes</h2>
                <button 
                    className="faqs-management__add-btn"
                    onClick={() => {
                        setShowForm(true);
                        setEditingFaq(null);
                        setFormData({
                            question: '',
                            answer: '',
                            category: '',
                            order_index: 0,
                            status: 'active'
                        });
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Agregar FAQ
                </button>
            </div>

            {showForm && (
                <div className="projects-management__form-overlay">
                    <div className="projects-management__form">
                        <h3>{editingFaq ? 'Editar FAQ' : 'Nuevo FAQ'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="company-info-management__form-grid">
                                <div className="company-info-management__form-group company-info-management__form-group--full">
                                    <label className="company-info-management__label">Pregunta</label>
                                    <input
                                        type="text"
                                        name="question"
                                        value={formData.question}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                        required
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">Categoría</label>
                                    <input
                                        type="text"
                                        name="category"
                                        value={formData.category}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">Orden</label>
                                    <input
                                        type="number"
                                        name="order_index"
                                        value={formData.order_index}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                        min="0"
                                    />
                                </div>
                                <div className="company-info-management__form-group company-info-management__form-group--full">
                                    <label className="company-info-management__label">Respuesta</label>
                                    <textarea
                                        name="answer"
                                        value={formData.answer}
                                        onChange={handleFormChange}
                                        className="company-info-management__textarea"
                                        rows="6"
                                        required
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">Estado</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                    >
                                        <option value="active">Activo</option>
                                        <option value="inactive">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="projects-management__form-actions">
                                <button type="submit" className="projects-management__save-btn">
                                    {editingFaq ? 'Actualizar' : 'Crear'} FAQ
                                </button>
                                <button 
                                    type="button" 
                                    className="projects-management__cancel-btn"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {faqs.length === 0 ? (
                <div className="public-content-management__empty">
                    <FontAwesomeIcon icon={faQuestionCircle} className="public-content-management__empty-icon" />
                    <p className="public-content-management__empty-text">No hay FAQs registrados</p>
                    <button 
                        className="faqs-management__add-btn"
                        onClick={() => setShowForm(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Agregar Primer FAQ
                    </button>
                </div>
            ) : (
                <div className="faqs-management__list">
                    {faqs.map(faq => (
                        <div key={faq.id} className="faqs-management__item">
                            <div className="faqs-management__question">
                                {faq.question}
                            </div>
                            <div className="faqs-management__answer">
                                {faq.answer}
                            </div>
                            <div className="faqs-management__meta">
                                <div className="faqs-management__category">
                                    {faq.category || 'General'}
                                </div>
                                <div className="faqs-management__item-actions">
                                    <button onClick={() => handleEdit(faq)} className="faqs-management__edit-btn">
                                        <FontAwesomeIcon icon={faEdit} /> Editar
                                    </button>
                                    <button onClick={() => handleDelete(faq.id)} className="faqs-management__delete-btn">
                                        <FontAwesomeIcon icon={faTrash} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Componente para Políticas
const PoliciesManagement = () => {
    const [policies, setPolicies] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        policy_type: '',
        order_index: 0,
        status: 'active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/admin/public-content/service-policies', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setPolicies(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingPolicy 
                ? `http://localhost:3000/api/admin/public-content/service-policies/${editingPolicy.id}`
                : 'http://localhost:3000/api/admin/public-content/service-policies';
            
            const method = editingPolicy ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(editingPolicy ? 'Política actualizada' : 'Política creada');
                setShowForm(false);
                setEditingPolicy(null);
                setFormData({
                    title: '',
                    content: '',
                    policy_type: '',
                    order_index: 0,
                    status: 'active'
                });
                fetchPolicies();
            }
        } catch (error) {
            console.error('Error saving policy:', error);
            alert('Error al guardar la política');
        }
    };

    const handleEdit = (policy) => {
        setEditingPolicy(policy);
        setFormData({
            title: policy.title,
            content: policy.content,
            policy_type: policy.policy_type,
            order_index: policy.order_index,
            status: policy.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar esta política?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/public-content/service-policies/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('Política eliminada');
                    fetchPolicies();
                }
            } catch (error) {
                console.error('Error deleting policy:', error);
                alert('Error al eliminar la política');
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    if (loading) {
        return (
            <div className="public-content-management__loading">
                <div className="public-content-management__loading-spinner"></div>
                <p>Cargando políticas...</p>
            </div>
        );
    }

    return (
        <div className="policies-management">
            <div className="policies-management__header">
                <h2 className="policies-management__title">Gestión de Políticas de Servicio</h2>
                <button 
                    className="policies-management__add-btn"
                    onClick={() => {
                        setShowForm(true);
                        setEditingPolicy(null);
                        setFormData({
                            title: '',
                            content: '',
                            policy_type: '',
                            order_index: 0,
                            status: 'active'
                        });
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Agregar Política
                </button>
            </div>

            {showForm && (
                <div className="projects-management__form-overlay">
                    <div className="projects-management__form">
                        <h3>{editingPolicy ? 'Editar Política' : 'Nueva Política'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="company-info-management__form-grid">
                                <div className="company-info-management__form-group company-info-management__form-group--full">
                                    <label className="company-info-management__label">Título</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                        required
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">Tipo de Política</label>
                                    <input
                                        type="text"
                                        name="policy_type"
                                        value={formData.policy_type}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">Orden</label>
                                    <input
                                        type="number"
                                        name="order_index"
                                        value={formData.order_index}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                        min="0"
                                    />
                                </div>
                                <div className="company-info-management__form-group company-info-management__form-group--full">
                                    <label className="company-info-management__label">Contenido</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleFormChange}
                                        className="company-info-management__textarea"
                                        rows="8"
                                        required
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">Estado</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                    >
                                        <option value="active">Activo</option>
                                        <option value="inactive">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            <div className="projects-management__form-actions">
                                <button type="submit" className="projects-management__save-btn">
                                    {editingPolicy ? 'Actualizar' : 'Crear'} Política
                                </button>
                                <button 
                                    type="button" 
                                    className="projects-management__cancel-btn"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {policies.length === 0 ? (
                <div className="public-content-management__empty">
                    <FontAwesomeIcon icon={faFileContract} className="public-content-management__empty-icon" />
                    <p className="public-content-management__empty-text">No hay políticas registradas</p>
                    <button 
                        className="policies-management__add-btn"
                        onClick={() => setShowForm(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Agregar Primera Política
                    </button>
                </div>
            ) : (
                <div className="policies-management__list">
                    {policies.map(policy => (
                        <div key={policy.id} className="policies-management__item">
                            <div className="policies-management__item-header">
                                <h3 className="policies-management__item-title">{policy.title}</h3>
                                <div className="policies-management__item-type">
                                    {policy.policy_type || 'General'}
                                </div>
                            </div>
                            <div className="policies-management__item-content">
                                {policy.content}
                            </div>
                            <div className="policies-management__item-actions">
                                <button onClick={() => handleEdit(policy)} className="policies-management__edit-btn">
                                    <FontAwesomeIcon icon={faEdit} /> Editar
                                </button>
                                <button onClick={() => handleDelete(policy.id)} className="policies-management__delete-btn">
                                    <FontAwesomeIcon icon={faTrash} /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PublicContentManagement;