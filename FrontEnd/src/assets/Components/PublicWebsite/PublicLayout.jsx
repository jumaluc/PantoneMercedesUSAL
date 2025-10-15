import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faArrowRight, faCamera, faUsers, faTrophy } from '@fortawesome/free-solid-svg-icons';
import './PublicHome.css';

const PublicHome = () => {
    const [companyInfo, setCompanyInfo] = useState(null);
    const [featuredProjects, setFeaturedProjects] = useState([]);
    const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPublicData();
    }, []);

    const fetchPublicData = async () => {
        try {
            setLoading(true);
            const [companyRes, projectsRes, testimonialsRes] = await Promise.all([
                fetch('http://localhost:3000/api/public/company-info'),
                fetch('http://localhost:3000/api/public/projects?featured=true'),
                fetch('http://localhost:3000/api/public/testimonials?featured=true')
            ]);
            console.log(companyInfo, projectsRes, testimonialsRes)
            if (companyRes.ok) {
                const companyData = await companyRes.json();
                setCompanyInfo(companyData.data);
            }

            if (projectsRes.ok) {
                const projectsData = await projectsRes.json();
                setFeaturedProjects(projectsData.data || []);
            }

            if (testimonialsRes.ok) {
                const testimonialsData = await testimonialsRes.json();
                setFeaturedTestimonials(testimonialsData.data || []);
            }
        } catch (error) {
            console.error('Error fetching public data:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <FontAwesomeIcon 
                key={i} 
                icon={faStar} 
                className={i < rating ? "public-home__star public-home__star--active" : "public-home__star"} 
            />
        ));
    };

    if (loading) {
        return (
            <div className="public-home__loading">
                <div className="public-home__loading-spinner"></div>
                <p>Cargando...</p>
            </div>
        );
    }

    return (
        <div className="public-home">
            {/* Hero Section */}
            <section className="public-home__hero">
                <div className="public-home__hero-content">
                    <h1 className="public-home__hero-title">
                        {companyInfo?.company_name || 'Pantone Mercedes'}
                    </h1>
                    <p className="public-home__hero-subtitle">
                        {companyInfo?.description || 'Capturamos momentos especiales con arte y profesionalismo'}
                    </p>
                    <div className="public-home__hero-actions">
                        <Link to="/public/projects" className="public-home__cta-button public-home__cta-button--primary">
                            Ver Nuestros Proyectos
                        </Link>
                        <Link to="/public/contact" className="public-home__cta-button public-home__cta-button--secondary">
                            Contáctanos
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Projects */}
            <section className="public-home__section">
                <div className="public-home__container">
                    <h2 className="public-home__section-title">Proyectos Destacados</h2>
                    <div className="public-home__projects-grid">
                        {featuredProjects.slice(0, 3).map(project => (
                            <div key={project.id} className="public-home__project-card">
                                <div className="public-home__project-image">
                                    <img src={project.image_url || '/default-project.jpg'} alt={project.title} />
                                </div>
                                <div className="public-home__project-content">
                                    <h3 className="public-home__project-title">{project.title}</h3>
                                    <p className="public-home__project-description">
                                        {project.description?.substring(0, 100)}...
                                    </p>
                                    <div className="public-home__project-meta">
                                        <span className="public-home__project-client">{project.client_name}</span>
                                        <span className="public-home__project-date">
                                            {new Date(project.project_date).toLocaleDateString('es-ES')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {featuredProjects.length > 0 && (
                        <div className="public-home__section-actions">
                            <Link to="/public/projects" className="public-home__view-all">
                                Ver Todos los Proyectos <FontAwesomeIcon icon={faArrowRight} />
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Section */}
            <section className="public-home__stats">
                <div className="public-home__container">
                    <div className="public-home__stats-grid">
                        <div className="public-home__stat">
                            <FontAwesomeIcon icon={faCamera} className="public-home__stat-icon" />
                            <div className="public-home__stat-number">1000+</div>
                            <div className="public-home__stat-label">Proyectos Completados</div>
                        </div>
                        <div className="public-home__stat">
                            <FontAwesomeIcon icon={faUsers} className="public-home__stat-icon" />
                            <div className="public-home__stat-number">500+</div>
                            <div className="public-home__stat-label">Clientes Satisfechos</div>
                        </div>
                        <div className="public-home__stat">
                            <FontAwesomeIcon icon={faTrophy} className="public-home__stat-icon" />
                            <div className="public-home__stat-number">25+</div>
                            <div className="public-home__stat-label">Años de Experiencia</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="public-home__section public-home__section--testimonials">
                <div className="public-home__container">
                    <h2 className="public-home__section-title">Lo Que Dicen Nuestros Clientes</h2>
                    <div className="public-home__testimonials-grid">
                        {featuredTestimonials.slice(0, 3).map(testimonial => (
                            <div key={testimonial.id} className="public-home__testimonial-card">
                                <div className="public-home__testimonial-content">
                                    <div className="public-home__testimonial-stars">
                                        {renderStars(testimonial.rating)}
                                    </div>
                                    <p className="public-home__testimonial-text">"{testimonial.content}"</p>
                                </div>
                                <div className="public-home__testimonial-author">
                                    <div className="public-home__testimonial-avatar">
                                        <img 
                                            src={testimonial.client_image || '/default-avatar.jpg'} 
                                            alt={testimonial.client_name} 
                                        />
                                    </div>
                                    <div className="public-home__testimonial-info">
                                        <div className="public-home__testimonial-name">
                                            {testimonial.client_name}
                                        </div>
                                        <div className="public-home__testimonial-project">
                                            {testimonial.project_type}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="public-home__cta">
                <div className="public-home__container">
                    <div className="public-home__cta-content">
                        <h2 className="public-home__cta-title">¿Listo para Capturar Tus Momentos Especiales?</h2>
                        <p className="public-home__cta-text">
                            Contáctanos hoy mismo para discutir tu proyecto y obtener un presupuesto personalizado.
                        </p>
                        <Link to="/public/contact" className="public-home__cta-button public-home__cta-button--primary">
                            Solicitar Presupuesto
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PublicHome;