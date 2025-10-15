import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFilter } from '@fortawesome/free-solid-svg-icons';
import './PublicProjects.css';

const PublicProjects = () => {
    const [projects, setProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        filterProjects();
    }, [projects, searchTerm, selectedCategory]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3000/api/public/projects');
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

    const filterProjects = () => {
        let filtered = projects;

        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.client_name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(project =>
                project.category === selectedCategory
            );
        }

        setFilteredProjects(filtered);
    };

    const categories = ['all', ...new Set(projects.map(p => p.category).filter(Boolean))];

    if (loading) {
        return (
            <div className="public-projects__loading">
                <div className="public-projects__loading-spinner"></div>
                <p>Cargando proyectos...</p>
            </div>
        );
    }

    return (
        <div className="public-projects">
            <div className="public-projects__container">
                <div className="public-projects__header">
                    <h1 className="public-projects__title">Nuestros Proyectos</h1>
                    <p className="public-projects__subtitle">
                        Descubre nuestra galería de trabajos realizados para clientes satisfechos
                    </p>
                </div>

                {/* Filters */}
                <div className="public-projects__filters">
                    <div className="public-projects__search">
                        <FontAwesomeIcon icon={faSearch} className="public-projects__search-icon" />
                        <input
                            type="text"
                            placeholder="Buscar proyectos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="public-projects__search-input"
                        />
                    </div>
                    <div className="public-projects__category-filter">
                        <FontAwesomeIcon icon={faFilter} className="public-projects__filter-icon" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="public-projects__category-select"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'Todas las categorías' : category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Projects Grid */}
                <div className="public-projects__grid">
                    {filteredProjects.length > 0 ? (
                        filteredProjects.map(project => (
                            <div key={project.id} className="public-projects__card">
                                <div className="public-projects__card-image">
                                    <img src={project.image_url || '/default-project.jpg'} alt={project.title} />
                                    {project.featured && (
                                        <span className="public-projects__featured-badge">Destacado</span>
                                    )}
                                </div>
                                <div className="public-projects__card-content">
                                    <h3 className="public-projects__card-title">{project.title}</h3>
                                    <p className="public-projects__card-description">
                                        {project.description}
                                    </p>
                                    <div className="public-projects__card-meta">
                                        <div className="public-projects__card-client">
                                            <strong>Cliente:</strong> {project.client_name}
                                        </div>
                                        <div className="public-projects__card-date">
                                            <strong>Fecha:</strong> {new Date(project.project_date).toLocaleDateString('es-ES')}
                                        </div>
                                        {project.category && (
                                            <div className="public-projects__card-category">
                                                <span className="public-projects__category-tag">
                                                    {project.category}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="public-projects__empty">
                            <p>No se encontraron proyectos con los filtros aplicados.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicProjects;