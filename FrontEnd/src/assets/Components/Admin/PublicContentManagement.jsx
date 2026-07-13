import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faBuilding,
    faCommentDots,
    faQuestionCircle,
    faFileContract,
    faStar,
    faEdit,
    faTrash,
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import './PublicContentManagement.css';

const PublicContentManagement = () => {
    const [activeTab, setActiveTab] = useState('company');

    const tabs = [
        { id: 'company', label: 'Información Empresa', icon: faBuilding },
        { id: 'reviews', label: 'Reseñas', icon: faCommentDots },
        { id: 'faqs', label: 'Preguntas Frecuentes', icon: faQuestionCircle },
        { id: 'policies', label: 'Políticas', icon: faFileContract }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'company':
                return <CompanyInfoManagement />;
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
            whatsapp: '',
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
                            whatsapp: '',
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
                toast.success('Información actualizada correctamente');
            } else {
                toast.error('Error al actualizar la información');
            }
        } catch (error) {
            console.error('Error updating company info:', error);
            toast.error('Error al actualizar la información');
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
                                <label>WhatsApp</label>
                                <input
                                    type="url"
                                    value={companyInfo.social_media.whatsapp}
                                    onChange={(e) => handleSocialMediaChange('whatsapp', e.target.value)}
                                    className="company-info-management__input"
                                    placeholder="https://wa.me/54..."
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
        const result = await Swal.fire({
            title: '¿Eliminar reseña?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#d1d5db'
        });
        if (!result.isConfirmed) return;

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
                toast.success(editingFaq ? 'FAQ actualizado' : 'FAQ creado');
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
            } else {
                toast.error('Error al guardar el FAQ');
            }
        } catch (error) {
            console.error('Error saving FAQ:', error);
            toast.error('Error al guardar el FAQ');
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
        const result = await Swal.fire({
            title: '¿Eliminar FAQ?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#d1d5db'
        });
        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:3000/api/admin/public-content/faqs/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                toast.success('FAQ eliminado');
                fetchFAQs();
            } else {
                toast.error('Error al eliminar el FAQ');
            }
        } catch (error) {
            console.error('Error deleting FAQ:', error);
            toast.error('Error al eliminar el FAQ');
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
                toast.success(editingPolicy ? 'Política actualizada' : 'Política creada');
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
            } else {
                toast.error('Error al guardar la política');
            }
        } catch (error) {
            console.error('Error saving policy:', error);
            toast.error('Error al guardar la política');
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
        const result = await Swal.fire({
            title: '¿Eliminar política?',
            text: 'Esta acción no se puede deshacer.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            background: '#1f2937',
            color: '#d1d5db'
        });
        if (!result.isConfirmed) return;

        try {
            const response = await fetch(`http://localhost:3000/api/admin/public-content/service-policies/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                toast.success('Política eliminada');
                fetchPolicies();
            } else {
                toast.error('Error al eliminar la política');
            }
        } catch (error) {
            console.error('Error deleting policy:', error);
            toast.error('Error al eliminar la política');
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