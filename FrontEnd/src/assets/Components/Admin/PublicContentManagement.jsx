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
    faPlus
} from '@fortawesome/free-solid-svg-icons';
import './PublicContentManagement.css';

const PublicContentManagement = () => {
    const [activeTab, setActiveTab] = useState('company');

    const tabs = [
        { id: 'company', label: 'Información Empresa', icon: faBuilding },
        { id: 'projects', label: 'Proyectos', icon: faImages },
        { id: 'testimonials', label: 'Testimonios', icon: faCommentDots },
        { id: 'faqs', label: 'Preguntas Frecuentes', icon: faQuestionCircle },
        { id: 'policies', label: 'Políticas', icon: faFileContract }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'company':
                return <CompanyInfoManagement />;
            case 'projects':
                return <ProjectsManagement />;
            case 'testimonials':
                return <TestimonialsManagement />;
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

// Subcomponentes para cada sección
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
        },
        logo_url: ''
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

                    <div className="company-info-management__form-group company-info-management__form-group--full">
                        <label className="company-info-management__label">URL del Logo</label>
                        <input
                            type="url"
                            name="logo_url"
                            value={companyInfo.logo_url}
                            onChange={handleChange}
                            className="company-info-management__input"
                            placeholder="https://ejemplo.com/logo.jpg"
                        />
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

const ProjectsManagement = () => {
    const [projects, setProjects] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        image_url: '',
        client_name: '',
        project_date: '',
        featured: false,
        status: 'active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/admin/public-content/projects', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setProjects(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingProject 
                ? `http://localhost:3000/api/admin/public-content/projects/${editingProject.id}`
                : 'http://localhost:3000/api/admin/public-content/projects';
            
            const method = editingProject ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(editingProject ? 'Proyecto actualizado' : 'Proyecto creado');
                setShowForm(false);
                setEditingProject(null);
                setFormData({
                    title: '',
                    description: '',
                    category: '',
                    image_url: '',
                    client_name: '',
                    project_date: '',
                    featured: false,
                    status: 'active'
                });
                fetchProjects();
            }
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Error al guardar el proyecto');
        }
    };

    const handleEdit = (project) => {
        setEditingProject(project);
        setFormData({
            title: project.title,
            description: project.description,
            category: project.category,
            image_url: project.image_url,
            client_name: project.client_name,
            project_date: project.project_date,
            featured: project.featured,
            status: project.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este proyecto?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/public-content/projects/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('Proyecto eliminado');
                    fetchProjects();
                }
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Error al eliminar el proyecto');
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    if (loading) {
        return (
            <div className="public-content-management__loading">
                <div className="public-content-management__loading-spinner"></div>
                <p>Cargando proyectos...</p>
            </div>
        );
    }

    return (
        <div className="projects-management">
            <div className="projects-management__header">
                <h2 className="projects-management__title">Gestión de Proyectos</h2>
                <button 
                    className="projects-management__add-btn"
                    onClick={() => {
                        setShowForm(true);
                        setEditingProject(null);
                        setFormData({
                            title: '',
                            description: '',
                            category: '',
                            image_url: '',
                            client_name: '',
                            project_date: new Date().toISOString().split('T')[0],
                            featured: false,
                            status: 'active'
                        });
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Agregar Proyecto
                </button>
            </div>

            {showForm && (
                <div className="projects-management__form-overlay">
                    <div className="projects-management__form">
                        <h3>{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</h3>
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
                                    <label className="company-info-management__label">Cliente</label>
                                    <input
                                        type="text"
                                        name="client_name"
                                        value={formData.client_name}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">Fecha del Proyecto</label>
                                    <input
                                        type="date"
                                        name="project_date"
                                        value={formData.project_date}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                    />
                                </div>
                                <div className="company-info-management__form-group company-info-management__form-group--full">
                                    <label className="company-info-management__label">URL de la Imagen</label>
                                    <input
                                        type="url"
                                        name="image_url"
                                        value={formData.image_url}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                        placeholder="https://ejemplo.com/imagen.jpg"
                                    />
                                </div>
                                <div className="company-info-management__form-group company-info-management__form-group--full">
                                    <label className="company-info-management__label">Descripción</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleFormChange}
                                        className="company-info-management__textarea"
                                        rows="4"
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">
                                        <input
                                            type="checkbox"
                                            name="featured"
                                            checked={formData.featured}
                                            onChange={handleFormChange}
                                        />
                                        Proyecto Destacado
                                    </label>
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
                                    {editingProject ? 'Actualizar' : 'Crear'} Proyecto
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

            {projects.length === 0 ? (
                <div className="public-content-management__empty">
                    <FontAwesomeIcon icon={faImages} className="public-content-management__empty-icon" />
                    <p className="public-content-management__empty-text">No hay proyectos registrados</p>
                    <button 
                        className="projects-management__add-btn"
                        onClick={() => setShowForm(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Agregar Primer Proyecto
                    </button>
                </div>
            ) : (
                <div className="projects-management__grid">
                    {projects.map(project => (
                        <div key={project.id} className="projects-management__card">
                            <div className="projects-management__card-image">
                                <img src={project.image_url || '/default-project.jpg'} alt={project.title} />
                                {project.featured && (
                                    <span className="projects-management__featured-badge">Destacado</span>
                                )}
                            </div>
                            <div className="projects-management__card-content">
                                <h3 className="projects-management__card-title">{project.title}</h3>
                                <p className="projects-management__card-description">
                                    {project.description?.substring(0, 100)}...
                                </p>
                                <div className="projects-management__card-meta">
                                    <div className="projects-management__card-client">
                                        <strong>Cliente:</strong> {project.client_name}
                                    </div>
                                    <div className="projects-management__card-date">
                                        {new Date(project.project_date).toLocaleDateString('es-ES')}
                                    </div>
                                    {project.category && (
                                        <div className="projects-management__card-category">
                                            {project.category}
                                        </div>
                                    )}
                                </div>
                                <div className="projects-management__card-actions">
                                    <button 
                                        onClick={() => handleEdit(project)}
                                        className="projects-management__edit-btn"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(project.id)}
                                        className="projects-management__delete-btn"
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

const TestimonialsManagement = () => {
    const [testimonials, setTestimonials] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingTestimonial, setEditingTestimonial] = useState(null);
    const [formData, setFormData] = useState({
        client_name: '',
        client_image: '',
        content: '',
        rating: 5,
        project_type: '',
        featured: false,
        status: 'active'
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchTestimonials();
    }, []);

    const fetchTestimonials = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/admin/public-content/testimonials', {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setTestimonials(data.data || []);
            }
        } catch (error) {
            console.error('Error fetching testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingTestimonial 
                ? `http://localhost:3000/api/admin/public-content/testimonials/${editingTestimonial.id}`
                : 'http://localhost:3000/api/admin/public-content/testimonials';
            
            const method = editingTestimonial ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert(editingTestimonial ? 'Testimonio actualizado' : 'Testimonio creado');
                setShowForm(false);
                setEditingTestimonial(null);
                setFormData({
                    client_name: '',
                    client_image: '',
                    content: '',
                    rating: 5,
                    project_type: '',
                    featured: false,
                    status: 'active'
                });
                fetchTestimonials();
            }
        } catch (error) {
            console.error('Error saving testimonial:', error);
            alert('Error al guardar el testimonio');
        }
    };

    const handleEdit = (testimonial) => {
        setEditingTestimonial(testimonial);
        setFormData({
            client_name: testimonial.client_name,
            client_image: testimonial.client_image,
            content: testimonial.content,
            rating: testimonial.rating,
            project_type: testimonial.project_type,
            featured: testimonial.featured,
            status: testimonial.status
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (confirm('¿Estás seguro de eliminar este testimonio?')) {
            try {
                const response = await fetch(`http://localhost:3000/api/admin/public-content/testimonials/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    alert('Testimonio eliminado');
                    fetchTestimonials();
                }
            } catch (error) {
                console.error('Error deleting testimonial:', error);
                alert('Error al eliminar el testimonio');
            }
        }
    };

    const handleFormChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FontAwesomeIcon 
                key={i} 
                icon={faStar} 
                className={i < rating ? "testimonials-management__star--active" : "testimonials-management__star"} 
            />
        ));
    };

    if (loading) {
        return (
            <div className="public-content-management__loading">
                <div className="public-content-management__loading-spinner"></div>
                <p>Cargando testimonios...</p>
            </div>
        );
    }

    return (
        <div className="testimonials-management">
            <div className="testimonials-management__header">
                <h2 className="testimonials-management__title">Gestión de Testimonios</h2>
                <button 
                    className="testimonials-management__add-btn"
                    onClick={() => {
                        setShowForm(true);
                        setEditingTestimonial(null);
                        setFormData({
                            client_name: '',
                            client_image: '',
                            content: '',
                            rating: 5,
                            project_type: '',
                            featured: false,
                            status: 'active'
                        });
                    }}
                >
                    <FontAwesomeIcon icon={faPlus} />
                    Agregar Testimonio
                </button>
            </div>

            {showForm && (
                <div className="projects-management__form-overlay">
                    <div className="projects-management__form">
                        <h3>{editingTestimonial ? 'Editar Testimonio' : 'Nuevo Testimonio'}</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="company-info-management__form-grid">
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">Nombre del Cliente</label>
                                    <input
                                        type="text"
                                        name="client_name"
                                        value={formData.client_name}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                        required
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">Rating</label>
                                    <select
                                        name="rating"
                                        value={formData.rating}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                    >
                                        {[1,2,3,4,5].map(num => (
                                            <option key={num} value={num}>{num} Estrellas</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">Tipo de Proyecto</label>
                                    <input
                                        type="text"
                                        name="project_type"
                                        value={formData.project_type}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">URL de la Imagen</label>
                                    <input
                                        type="url"
                                        name="client_image"
                                        value={formData.client_image}
                                        onChange={handleFormChange}
                                        className="company-info-management__input"
                                        placeholder="https://ejemplo.com/avatar.jpg"
                                    />
                                </div>
                                <div className="company-info-management__form-group company-info-management__form-group--full">
                                    <label className="company-info-management__label">Contenido</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleFormChange}
                                        className="company-info-management__textarea"
                                        rows="4"
                                        required
                                    />
                                </div>
                                <div className="company-info-management__form-group">
                                    <label className="company-info-management__label">
                                        <input
                                            type="checkbox"
                                            name="featured"
                                            checked={formData.featured}
                                            onChange={handleFormChange}
                                        />
                                        Testimonio Destacado
                                    </label>
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
                                    {editingTestimonial ? 'Actualizar' : 'Crear'} Testimonio
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

            {testimonials.length === 0 ? (
                <div className="public-content-management__empty">
                    <FontAwesomeIcon icon={faCommentDots} className="public-content-management__empty-icon" />
                    <p className="public-content-management__empty-text">No hay testimonios registrados</p>
                    <button 
                        className="testimonials-management__add-btn"
                        onClick={() => setShowForm(true)}
                    >
                        <FontAwesomeIcon icon={faPlus} />
                        Agregar Primer Testimonio
                    </button>
                </div>
            ) : (
                <div className="testimonials-management__grid">
                    {testimonials.map(testimonial => (
                        <div key={testimonial.id} className="testimonials-management__card">
                            <div className="testimonials-management__card-header">
                                <div className="testimonials-management__client-info">
                                    <div className="testimonials-management__client-avatar">
                                        <img src={testimonial.client_image || '/default-avatar.jpg'} alt={testimonial.client_name} />
                                    </div>
                                    <div className="testimonials-management__client-details">
                                        <h4 className="testimonials-management__client-name">{testimonial.client_name}</h4>
                                        <p className="testimonials-management__client-project">
                                            {testimonial.project_type}
                                        </p>
                                    </div>
                                </div>
                                <div className="testimonials-management__rating">
                                    {renderStars(testimonial.rating)}
                                </div>
                            </div>
                            <div className="testimonials-management__content">
                                "{testimonial.content}"
                            </div>
                            <div className="testimonials-management__card-actions">
                                <button 
                                    onClick={() => handleEdit(testimonial)}
                                    className="testimonials-management__edit-btn"
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDelete(testimonial.id)}
                                    className="testimonials-management__delete-btn"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

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
                                    <button 
                                        onClick={() => handleEdit(faq)}
                                        className="faqs-management__edit-btn"
                                    >
                                        <FontAwesomeIcon icon={faEdit} />
                                        Editar
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(faq.id)}
                                        className="faqs-management__delete-btn"
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
                                <button 
                                    onClick={() => handleEdit(policy)}
                                    className="policies-management__edit-btn"
                                >
                                    <FontAwesomeIcon icon={faEdit} />
                                    Editar
                                </button>
                                <button 
                                    onClick={() => handleDelete(policy.id)}
                                    className="policies-management__delete-btn"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                    Eliminar
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