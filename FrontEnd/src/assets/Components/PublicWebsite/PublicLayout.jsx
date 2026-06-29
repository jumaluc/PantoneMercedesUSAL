import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faStar,
    faArrowRight,
    faCamera,
    faUsers,
    faTrophy,
    faEnvelope,
    faPhone,
    faUser,
    faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';
import './PublicHome.css';
import PoliciesModal from './PoliciesModal';

const PublicHome = ({ hideLogin = false }) => {
    const [companyInfo, setCompanyInfo] = useState(null);
    const [featuredTestimonials, setFeaturedTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [showPolicies, setShowPolicies] = useState(false);
    const navigate = useNavigate();
    
    // Referencia para la sección de especialidades
    const specialtiesSectionRef = useRef(null);

    // Imágenes preestablecidas para las categorías
    const categoryImages = {
        'Casamientos': '/casamiento-hero.jpeg',
        'XV Años': '/xv.jpg',
        'Bautizos': '/bautismo.jpg'
    };

    const categories = [
        {
            id: 'Casamientos',
            name: 'Casamientos',
            description: 'Capturamos el amor y la magia de tu día especial',
            image: categoryImages['Casamientos'],
            route: '/public/gallery/casamientos'
        },
        {
            id: 'XV Años',
            name: 'XV Años',
            description: 'La celebración más importante de tus quince años',
            image: categoryImages['XV Años'],
            route: '/public/gallery/xv-anos'
        },
        {
            id: 'Bautizos',
            name: 'Bautizos',
            description: 'Memorias eternas del primer sacramento',
            image: categoryImages['Bautizos'],
            route: '/public/gallery/bautizos'
        }
    ];

    useEffect(() => {
        checkUserSession();
        fetchPublicData();
    }, []);

    const checkUserSession = async () => {
        try {
            const response = await fetch('http://localhost:3000/api/auth/check-session', {
                credentials: 'include' // Importante para enviar cookies
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.authenticated) {
                    setUserLoggedIn(true);
                    // Si el usuario está logueado, redirigir a su dashboard según el rol
                    if (data.user.role === 'client') {
                        navigate('/clientDashboard');
                    } else if (data.user.role === 'admin') {
                        navigate('/adminDashboard');
                    }
                }
            }
        } catch (error) {
            console.error('Error checking session:', error);
        }
    };

    const fetchPublicData = async () => {
        try {
            setLoading(true);
            const [companyRes, testimonialsRes] = await Promise.all([
                fetch('http://localhost:3000/api/public/company-info'),
                fetch('http://localhost:3000/api/public/testimonials?featured=true')
            ]);

            if (companyRes.ok) {
                const companyData = await companyRes.json();
                setCompanyInfo(companyData.data);
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

    const handleLoginClick = () => {
        // Verificar sesión antes de redirigir al login
        checkUserSession().then(() => {
            // Si después de verificar no está logueado, redirigir al login
            if (!userLoggedIn) {
                navigate('/login');
            }
        });
    };

    const scrollToSpecialties = () => {
        if (specialtiesSectionRef.current) {
            specialtiesSectionRef.current.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
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

    const renderSocialLinks = () => {
        if (!companyInfo?.social_media) return null;

        const socialMedia = companyInfo.social_media;
        
        return (
            <div className="public-home__social-links">
                {socialMedia.instagram && (
                    <a 
                        href={socialMedia.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="public-home__social-link public-home__social-link--instagram"
                    >
                        <FontAwesomeIcon icon={faInstagram} />
                    </a>
                )}
                {socialMedia.facebook && (
                    <a 
                        href={socialMedia.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="public-home__social-link public-home__social-link--facebook"
                    >
                        <FontAwesomeIcon icon={faFacebook} />
                    </a>
                )}
                {companyInfo.email && (
                    <a 
                        href={`mailto:${companyInfo.email}`}
                        className="public-home__social-link public-home__social-link--email"
                    >
                        <FontAwesomeIcon icon={faEnvelope} />
                    </a>
                )}
                {companyInfo.phone && (
                    <a 
                        href={`tel:${companyInfo.phone}`}
                        className="public-home__social-link public-home__social-link--phone"
                    >
                        <FontAwesomeIcon icon={faPhone} />
                    </a>
                )}
            </div>
        );
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
            {/* Botón fijo de login */}
            {!hideLogin && (
                <button
                    onClick={handleLoginClick}
                    className="public-home__floating-login-btn"
                >
                    <FontAwesomeIcon icon={faSignInAlt} />
                    <span>Acceder</span>
                </button>
            )}

            {/* Hero Section */}
            <section className="public-home__hero">
                <div className="public-home__hero-content">
                    <img
                        src="/logoPantone.jpg"
                        alt="Pantone Mercedes"
                        className="public-home__hero-logo"
                    />
                    <h1 className="public-home__hero-title">
                        {companyInfo?.company_name || 'Pantone Mercedes'}
                    </h1>
                    <p className="public-home__hero-subtitle">
                        {companyInfo?.description || 'Capturamos momentos especiales con arte y profesionalismo'}
                    </p>
                    <div className="public-home__hero-actions">
                        <button 
                            onClick={scrollToSpecialties}
                            className="public-home__cta-button public-home__cta-button--primary"
                        >
                            Ver Nuestras Galerías
                        </button>
                        <button 
                            onClick={handleLoginClick}
                            className="public-home__cta-button public-home__cta-button--secondary"
                        >
                            <FontAwesomeIcon icon={faUser} />
                            Acceder a Mi Cuenta
                        </button>
                    </div>
                    {/* Redes Sociales en el Hero */}
                    {renderSocialLinks()}
                </div>
            </section>

            {/* Categorías Destacadas */}
            <section 
                ref={specialtiesSectionRef} 
                className="public-home__section public-home__section--specialties"
            >
                <div className="public-home__container">
                    <h2 className="public-home__section-title">Nuestras Especialidades</h2>
                    <p className="public-home__section-subtitle">
                        Descubre nuestros trabajos en cada categoría
                    </p>
                    <div className="public-home__categories-grid">
                        {categories.map(category => (
                            <Link 
                                key={category.id} 
                                to={category.route}
                                className="public-home__category-card"
                            >
                                <div className="public-home__category-image">
                                    <img 
                                        src={category.image} 
                                        alt={category.name}
                                        onError={(e) => {
                                            e.target.src = '/default-category.jpg';
                                        }}
                                    />
                                    <div className="public-home__category-overlay">
                                        <h3 className="public-home__category-name">{category.name}</h3>
                                        <p className="public-home__category-description">
                                            {category.description}
                                        </p>
                                        <span className="public-home__category-cta">
                                            Ver Galería <FontAwesomeIcon icon={faArrowRight} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
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
                        {featuredTestimonials.map(testimonial => (
                            <div key={testimonial.id} className="public-home__testimonial-card">
                                <div className="public-home__testimonial-content">
                                    <div className="public-home__testimonial-stars">
                                        {renderStars(testimonial.rating)}
                                    </div>
                                    <p className="public-home__testimonial-text">"{testimonial.content}"</p>
                                </div>
                                <div className="public-home__testimonial-author">
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

            {/* CTA Section con Redes Sociales */}
            <section className="public-home__cta">
                <div className="public-home__container">
                    <div className="public-home__cta-content">
                        <h2 className="public-home__cta-title">¿Listo para Capturar Tus Momentos Especiales?</h2>
                        <p className="public-home__cta-text">
                            Accede a tu cuenta para ver tus galerías personalizadas o contáctanos para más información
                        </p>
                        <div className="public-home__cta-actions">
                            <button 
                                onClick={handleLoginClick}
                                className="public-home__cta-button public-home__cta-button--primary"
                            >
                                <FontAwesomeIcon icon={faUser} />
                                Acceder a Mi Cuenta
                            </button>
                            <Link to="/public/gallery" className="public-home__cta-button public-home__cta-button--secondary">
                                Ver Galerías Públicas
                            </Link>
                        </div>
                        <div className="public-home__cta-social">
                            {renderSocialLinks()}
                        </div>
                        <div className="public-home__cta-contact">
                            {companyInfo?.phone && (
                                <a href={`tel:${companyInfo.phone}`} className="public-home__contact-link">
                                    <FontAwesomeIcon icon={faPhone} />
                                    {companyInfo.phone}
                                </a>
                            )}
                            {companyInfo?.email && (
                                <a href={`mailto:${companyInfo.email}`} className="public-home__contact-link">
                                    <FontAwesomeIcon icon={faEnvelope} />
                                    {companyInfo.email}
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="public-home__footer">
                <div className="public-home__container">
                    <div className="public-home__footer-content">
                        <span className="public-home__footer-copy">
                            © {new Date().getFullYear()} Pantone Mercedes. Todos los derechos reservados.
                        </span>
                        <button
                            className="public-home__footer-policies-btn"
                            onClick={() => setShowPolicies(true)}
                        >
                            Términos y Políticas
                        </button>
                    </div>
                </div>
            </footer>

            {showPolicies && <PoliciesModal onClose={() => setShowPolicies(false)} />}
        </div>
    );
};

export default PublicHome;