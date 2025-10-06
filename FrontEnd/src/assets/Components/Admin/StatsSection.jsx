import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faUsers, 
    faImages, 
    faChartBar, 
    faCalendarAlt,
    faEye,
    faDownload,
    faClock,
    faUserPlus,
    faImage,
    faTrash,
    faEdit,
    faFilter,
    faSearch,
    faSync,
    faCheckCircle,
    faComment,
    faEnvelope,
    faVideo,
    faUserEdit,
    faUserTie,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './StatsSection.css'

const StatsSection = () => {
    const [stats, setStats] = useState({
        todayStats: {},
        weekStats: {},
        recentActivity: [],
        actionSummary: []
    });
    const [otherStats, setOtherStats] = useState([]);
    const [filteredStats, setFilteredStats] = useState([]);
    const [timeRange, setTimeRange] = useState('today');
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(false);
    
    // Filtros
    const [userFilter, setUserFilter] = useState('');
    const [actionTypeFilter, setActionTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    useEffect(() => {
        fetchDashboardStats();
        fetchStats();
    }, [timeRange]);

    useEffect(() => {
        filterStats();
    }, [otherStats, userFilter, actionTypeFilter, statusFilter]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/admin/dashboard-stats?range=${timeRange}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setStats(data.data);
                } else {
                    throw new Error(data.message || 'Error al cargar estadísticas');
                }
            } else {
                throw new Error('Error al cargar estadísticas');
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            toast.error(error.message || 'Error al cargar las estadísticas del dashboard');
        } finally {
            setLoading(false);
        }
    };
        
    const fetchStats = async () => {
        try {
            setStatsLoading(true);
            const response = await fetch(`http://localhost:3000/admin/getStats`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('Stats data received:', data);
                
                if (data.success) {
                    setOtherStats(data.data || []);
                } else {
                    throw new Error(data.message || 'Error al cargar estadísticas');
                }
            } else {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error(`Error al cargar las actividades: ${error.message}`);
        } finally {
            setStatsLoading(false);
        }
    };

    const filterStats = () => {
        let filtered = otherStats;

        if (userFilter) {
            filtered = filtered.filter(stat => 
                (stat.first_name && `${stat.first_name} ${stat.last_name}`.toLowerCase().includes(userFilter.toLowerCase())) ||
                (stat.userTipe && stat.userTipe.toLowerCase().includes(userFilter.toLowerCase()))
            );
        }

        if (actionTypeFilter) {
            filtered = filtered.filter(stat => 
                stat.action_type && stat.action_type.toLowerCase().includes(actionTypeFilter.toLowerCase())
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(stat => 
                stat.status && stat.status.toLowerCase().includes(statusFilter.toLowerCase())
            );
        }

        setFilteredStats(filtered);
    };

    const clearFilters = () => {
        setUserFilter('');
        setActionTypeFilter('');
        setStatusFilter('');
    };

    const getActionColor = (actionType) => {
        const colors = {
            'create': '#10b981',
            'update': '#3b82f6',
            'edit': '#3b82f6',
            'delete': '#ef4444',
            'view': '#8b5cf6',
            'download': '#10b981',
            'comment': '#f59e0b',
            'request': '#8b5cf6',
            'confirm selection': '#10b981'
        };
        return colors[actionType?.toLowerCase()] || '#6b7280';
    };

    const getActionIcon = (actionType) => {
        const action = actionType?.toLowerCase();
        const icons = {
            'create': faUserPlus,
            'update': faEdit,
            'edit': faUserEdit,
            'delete': faTrash,
            'view': faEye,
            'download': faDownload,
            'comment': faComment,
            'request': faEnvelope,
            'confirm selection': faCheckCircle
        };
        return icons[action] || faChartBar;
    };

    const getUserTypeIcon = (userType) => {
        const type = userType?.toLowerCase();
        if (type === 'admin') return faUserTie;
        if (type === 'client') return faUser;
        return faUser;
    };

    const getUserTypeColor = (userType) => {
        const type = userType?.toLowerCase();
        if (type === 'admin') return '#8b5cf6'; // Violeta para admin
        if (type === 'client') return '#3b82f6'; // Azul para cliente
        return '#6b7280'; // Gris por defecto
    };

    const translateUserType = (userType) => {
        const type = userType?.toLowerCase();
        if (type === 'admin') return 'Administrador';
        if (type === 'client') return 'Cliente';
        return userType;
    };

    const translateActionType = (actionType) => {
        const translations = {
            'create': 'Creación',
            'update': 'Actualización',
            'edit': 'Edición',
            'delete': 'Eliminación',
            'view': 'Visualización',
            'download': 'Descarga',
            'comment': 'Comentario',
            'request': 'Solicitud',
            'confirm selection': 'Confirmación de Selección'
        };
        
        return translations[actionType?.toLowerCase()] || actionType;
    };

    const getStatusColor = (status) => {
        const colors = {
            'success': '#10b981',
            'completed': '#10b981',
            'complete': '#10b981',
            'error': '#ef4444',
            'failed': '#ef4444',
            'pending': '#f59e0b',
            'in_progress': '#3b82f6'
        };
        return colors[status?.toLowerCase()] || '#6b7280';
    };

    const formatNumber = (num) => {
        if (num === null || num === undefined) return '0';
        return num.toLocaleString('es-ES');
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Fecha no disponible';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    // Agrupar estadísticas por tipo para el resumen
    const getActionSummary = () => {
        const summary = {};
        otherStats.forEach(stat => {
            const actionType = stat.action_type?.toLowerCase();
            if (actionType) {
                summary[actionType] = (summary[actionType] || 0) + 1;
            }
        });
        
        return Object.entries(summary).map(([action_type, count]) => ({
            action_type,
            count
        })).sort((a, b) => b.count - a.count);
    };

    const actionSummary = getActionSummary();

    if (loading) {
        return (
            <div className="stats-section__loading">
                <div className="stats-section__loading-spinner"></div>
                <p>Cargando estadísticas...</p>
            </div>
        );
    }

    return (
        <div className="stats-section">
            <div className="stats-section__header">
                <h2 className="stats-section__title">Dashboard de Estadísticas</h2>
                <div className="stats-section__time-selector">
                    <button className={`stats-section__time-btn ${timeRange === 'today' ? 'stats-section__time-btn--active' : ''}`} onClick={() => setTimeRange('today')}>
                        Hoy
                    </button>
                    <button className={`stats-section__time-btn ${timeRange === 'week' ? 'stats-section__time-btn--active' : ''}`} onClick={() => setTimeRange('week')}>
                        Esta Semana
                    </button>
                    <button className={`stats-section__time-btn ${timeRange === 'month' ? 'stats-section__time-btn--active' : ''}`} onClick={() => setTimeRange('month')}>
                        Este Mes
                    </button>
                </div>
            </div>

            <div className="stats-section__cards-grid">
                <div className="stats-section__card">
                    <div className="stats-section__card-icon stats-section__card-icon--clients">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className="stats-section__card-info">
                        <h3>{formatNumber(stats.todayStats?.totalClients || stats.weekStats?.totalClients || 0)}</h3>
                        <p>Total Clientes</p>
                        <span className="stats-section__card-change">+{formatNumber(stats.todayStats?.newClients || 0)} nuevos</span>
                    </div>
                </div>

                <div className="stats-section__card">
                    <div className="stats-section__card-icon stats-section__card-icon--galleries">
                        <FontAwesomeIcon icon={faImages} />
                    </div>
                    <div className="stats-section__card-info">
                        <h3>{formatNumber(stats.todayStats?.totalGalleries || stats.weekStats?.totalGalleries || 0)}</h3>
                        <p>Galerías Activas</p>
                        <span className="stats-section__card-change">+{formatNumber(stats.todayStats?.newGalleries || 0)} nuevas</span>
                    </div>
                </div>

                <div className="stats-section__card">
                    <div className="stats-section__card-icon stats-section__card-icon--actions">
                        <FontAwesomeIcon icon={faChartBar} />
                    </div>
                    <div className="stats-section__card-info">
                        <h3>{formatNumber(otherStats.length || 0)}</h3>
                        <p>Total Actividades</p>
                        <span className="stats-section__card-change">{filteredStats.length} filtradas</span>
                    </div>
                </div>

                <div className="stats-section__card">
                    <div className="stats-section__card-icon stats-section__card-icon--images">
                        <FontAwesomeIcon icon={faImage} />
                    </div>
                    <div className="stats-section__card-info">
                        <h3>{formatNumber(stats.todayStats?.totalImages || stats.weekStats?.totalImages || 0)}</h3>
                        <p>Imágenes Subidas</p>
                        <span className="stats-section__card-change">+{formatNumber(stats.todayStats?.newImages || 0)} nuevas</span>
                    </div>
                </div>
            </div>

            {/* Resumen de Actividades por Tipo */}
            <div className="stats-section__summary">
                <h3 className="stats-section__summary-title">Resumen de Actividades por Tipo</h3>
                <div className="stats-section__summary-list">
                    {actionSummary.length > 0 ? (
                        actionSummary.map((action, index) => {
                            const maxCount = Math.max(...actionSummary.map(a => a.count));
                            return (
                                <div key={index} className="stats-section__summary-item">
                                    <div className="stats-section__summary-icon" style={{ color: getActionColor(action.action_type) }}>
                                        <FontAwesomeIcon icon={getActionIcon(action.action_type)} />
                                    </div>
                                    <div className="stats-section__summary-details">
                                        <span className="stats-section__summary-type">
                                            {translateActionType(action.action_type)}
                                        </span>
                                        <span className="stats-section__summary-count">{formatNumber(action.count)} acciones</span>
                                    </div>
                                    <div 
                                        className="stats-section__summary-bar"
                                        style={{ 
                                            width: `${(action.count / maxCount) * 100}%`,
                                            backgroundColor: getActionColor(action.action_type)
                                        }}
                                    ></div>
                                </div>
                            );
                        })
                    ) : (
                        <p className="stats-section__no-data">No hay actividades para mostrar</p>
                    )}
                </div>
            </div>

            {/* Sección de Actividades con Filtros */}
            <div className="stats-section__activities">
                <div className="stats-section__activities-header">
                    <h3 className="stats-section__activities-title">Registro de Actividades</h3>
                    <div className="stats-section__activities-controls">
                        <button className="stats-section__refresh-btn" onClick={fetchStats} disabled={statsLoading}>
                            <FontAwesomeIcon icon={faSync} spin={statsLoading} />
                        </button>
                        <div className="stats-section__filter-badge">
                            Mostrando {filteredStats.length} de {otherStats.length} actividades
                        </div>
                    </div>
                </div>

                <div className="stats-section__filters">
                    <div className="stats-section__filter-group">
                        <FontAwesomeIcon icon={faSearch} className="stats-section__filter-icon" />
                        <input 
                            type="text" 
                            placeholder="Filtrar por usuario o tipo..." 
                            value={userFilter} 
                            onChange={(e) => setUserFilter(e.target.value)} 
                            className="stats-section__filter-input" 
                        />
                    </div>
                    
                    <div className="stats-section__filter-group">
                        <FontAwesomeIcon icon={faFilter} className="stats-section__filter-icon" />
                        <input 
                            type="text" 
                            placeholder="Filtrar por tipo de acción..." 
                            value={actionTypeFilter} 
                            onChange={(e) => setActionTypeFilter(e.target.value)} 
                            className="stats-section__filter-input" 
                        />
                    </div>

                    <div className="stats-section__filter-group">
                        <FontAwesomeIcon icon={faChartBar} className="stats-section__filter-icon" />
                        <input 
                            type="text" 
                            placeholder="Filtrar por estado..." 
                            value={statusFilter} 
                            onChange={(e) => setStatusFilter(e.target.value)} 
                            className="stats-section__filter-input" 
                        />
                    </div>

                    <button className="stats-section__clear-filters-btn" onClick={clearFilters}>
                        Limpiar Filtros
                    </button>
                </div>

                {statsLoading ? (
                    <div className="stats-section__activities-loading">
                        <div className="stats-section__loading-spinner"></div>
                        <p>Cargando actividades...</p>
                    </div>
                ) : (
                    <div className="stats-section__activities-list">
                        {filteredStats.length > 0 ? (
                            <div className="stats-section__activities-table">
                                <div className="stats-section__table-header">
                                    <div className="stats-section__table-col stats-section__table-col--user">Usuario</div>
                                    <div className="stats-section__table-col stats-section__table-col--type">Tipo de Usuario</div>
                                    <div className="stats-section__table-col stats-section__table-col--action">Tipo de Acción</div>
                                    <div className="stats-section__table-col stats-section__table-col--description">Descripción</div>
                                    <div className="stats-section__table-col stats-section__table-col--date">Fecha</div>
                                    <div className="stats-section__table-col stats-section__table-col--status">Estado</div>
                                </div>
                                
                                <div className="stats-section__table-body">
                                    {filteredStats.map((stat, index) => (
                                        <div key={stat.id || index} className="stats-section__table-row">
                                            <div className="stats-section__table-col stats-section__table-col--user">
                                                <div className="stats-section__user-info">
                                                    <div className="stats-section__user-name">
                                                        {stat.first_name && stat.last_name 
                                                            ? `${stat.first_name} ${stat.last_name}`
                                                            : 'Sistema'
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="stats-section__table-col stats-section__table-col--type">
                                                <div className="stats-section__user-type">
                                                    <div 
                                                        className="stats-section__user-type-icon"
                                                        style={{ color: getUserTypeColor(stat.userTipe) }}
                                                    >
                                                        <FontAwesomeIcon icon={getUserTypeIcon(stat.userTipe)} />
                                                    </div>
                                                    <span 
                                                        className="stats-section__user-type-badge"
                                                        style={{ backgroundColor: getUserTypeColor(stat.userTipe) }}
                                                    >
                                                        {translateUserType(stat.userTipe)}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="stats-section__table-col stats-section__table-col--action">
                                                <div className="stats-section__action-type">
                                                    <div 
                                                        className="stats-section__action-icon"
                                                        style={{ color: getActionColor(stat.action_type) }}
                                                    >
                                                        <FontAwesomeIcon icon={getActionIcon(stat.action_type)} />
                                                    </div>
                                                    <span>{translateActionType(stat.action_type)}</span>
                                                </div>
                                            </div>
                                            
                                            <div className="stats-section__table-col stats-section__table-col--description">
                                                {stat.action_descripcion || 'Sin descripción'}
                                            </div>
                                            
                                            <div className="stats-section__table-col stats-section__table-col--date">
                                                <FontAwesomeIcon icon={faCalendarAlt} className="stats-section__date-icon" />
                                                {formatDate(stat.created_at)}
                                            </div>
                                            
                                            <div className="stats-section__table-col stats-section__table-col--status">
                                                <span 
                                                    className="stats-section__status-badge"
                                                    style={{ backgroundColor: getStatusColor(stat.status) }}
                                                >
                                                    {stat.status || 'Completado'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="stats-section__no-activities">
                                <FontAwesomeIcon icon={faChartBar} size="3x" />
                                <p className="stats-section__no-activities-text">
                                    {otherStats.length === 0 
                                        ? 'No hay actividades registradas' 
                                        : 'No se encontraron actividades con los filtros aplicados'
                                    }
                                </p>
                                {(otherStats.length === 0 || userFilter || actionTypeFilter || statusFilter) && (
                                    <button 
                                        className="stats-section__clear-filters-btn stats-section__clear-filters-btn--center"
                                        onClick={clearFilters}
                                    >
                                        {otherStats.length === 0 ? 'Recargar actividades' : 'Mostrar todas las actividades'}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatsSection;