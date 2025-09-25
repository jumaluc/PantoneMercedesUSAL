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
    faEdit
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const StatsSection = () => {
    const [stats, setStats] = useState({
        todayStats: {},
        weekStats: {},
        recentActivity: [],
        actionSummary: []
    });
    const [timeRange, setTimeRange] = useState('today');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats();
    }, [timeRange]);

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:3000/admin/dashboard-stats?range=${timeRange}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const data = await response.json();
                setStats(data.data);
            } else {
                throw new Error('Error al cargar estadísticas');
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            toast.error('Error al cargar las estadísticas');
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (actionType) => {
        const colors = {
            'CREATE': '#10b981',
            'UPDATE': '#3b82f6',
            'DELETE': '#ef4444',
            'VIEW': '#8b5cf6',
            'LOGIN': '#f59e0b'
        };
        return colors[actionType] || '#6b7280';
    };

    const getActionIcon = (actionType) => {
        const icons = {
            'CREATE': faUserPlus,
            'UPDATE': faEdit,
            'DELETE': faTrash,
            'VIEW': faEye,
            'GALLERY_CREATE': faImage,
            'CLIENT_CREATE': faUserPlus
        };
        return icons[actionType] || faChartBar;
    };

    const formatNumber = (num) => {
        return num?.toLocaleString('es-ES') || '0';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="stats-section-loading">
                <div className="stats-loading-spinner"></div>
                <p>Cargando estadísticas...</p>
            </div>
        );
    }

    return (
        <div className="stats-section">
            {/* Header con controles de tiempo */}
            <div className="stats-header">
                <h2>Dashboard de Estadísticas</h2>
                <div className="time-range-selector">
                    <button 
                        className={`time-btn ${timeRange === 'today' ? 'active' : ''}`}
                        onClick={() => setTimeRange('today')}
                    >
                        Hoy
                    </button>
                    <button 
                        className={`time-btn ${timeRange === 'week' ? 'active' : ''}`}
                        onClick={() => setTimeRange('week')}
                    >
                        Esta Semana
                    </button>
                    <button 
                        className={`time-btn ${timeRange === 'month' ? 'active' : ''}`}
                        onClick={() => setTimeRange('month')}
                    >
                        Este Mes
                    </button>
                </div>
            </div>

            {/* Tarjetas de estadísticas principales */}
            <div className="stats-cards-grid">
                <div className="stat-card">
                    <div className="stat-icon clients">
                        <FontAwesomeIcon icon={faUsers} />
                    </div>
                    <div className="stat-info">
                        <h3>{formatNumber(stats.todayStats?.totalClients || stats.weekStats?.totalClients)}</h3>
                        <p>Total Clientes</p>
                        <span className="stat-change">
                            +{formatNumber(stats.todayStats?.newClients || 0)} nuevos
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon galleries">
                        <FontAwesomeIcon icon={faImages} />
                    </div>
                    <div className="stat-info">
                        <h3>{formatNumber(stats.todayStats?.totalGalleries || stats.weekStats?.totalGalleries)}</h3>
                        <p>Galerías Activas</p>
                        <span className="stat-change">
                            +{formatNumber(stats.todayStats?.newGalleries || 0)} nuevas
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon actions">
                        <FontAwesomeIcon icon={faChartBar} />
                    </div>
                    <div className="stat-info">
                        <h3>{formatNumber(stats.todayStats?.totalActions || stats.weekStats?.totalActions)}</h3>
                        <p>Acciones Hoy</p>
                        <span className="stat-change">
                            {stats.todayStats?.actionsChange || 0}% vs ayer
                        </span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon images">
                        <FontAwesomeIcon icon={faImage} />
                    </div>
                    <div className="stat-info">
                        <h3>{formatNumber(stats.todayStats?.totalImages || stats.weekStats?.totalImages)}</h3>
                        <p>Imágenes Subidas</p>
                        <span className="stat-change">
                            +{formatNumber(stats.todayStats?.newImages || 0)} nuevas
                        </span>
                    </div>
                </div>
            </div>

            {/* Gráficos y actividad reciente */}
            <div className="stats-content-grid">
                {/* Resumen de actividades por tipo */}
                <div className="activity-summary">
                    <h3>Resumen de Actividades</h3>
                    <div className="activity-list">
                        {stats.actionSummary?.map((action, index) => (
                            <div key={index} className="activity-item">
                                <div className="activity-icon" style={{ color: getActionColor(action.action_type) }}>
                                    <FontAwesomeIcon icon={getActionIcon(action.action_type)} />
                                </div>
                                <div className="activity-details">
                                    <span className="activity-type">{action.action_type}</span>
                                    <span className="activity-count">{formatNumber(action.count)} acciones</span>
                                </div>
                                <div 
                                    className="activity-bar"
                                    style={{ 
                                        width: `${(action.count / Math.max(...stats.actionSummary.map(a => a.count))) * 100}%`,
                                        backgroundColor: getActionColor(action.action_type)
                                    }}
                                ></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actividad reciente */}
                <div className="recent-activity">
                    <h3>Actividad Reciente</h3>
                    <div className="activity-timeline">
                        {stats.recentActivity?.slice(0, 8).map((activity, index) => (
                            <div key={activity.id || index} className="timeline-item">
                                <div 
                                    className="timeline-marker"
                                    style={{ backgroundColor: getActionColor(activity.action_type) }}
                                ></div>
                                <div className="timeline-content">
                                    <div className="activity-header">
                                        <span className="admin-name">{activity.admin_name}</span>
                                        <span className="activity-time">
                                            <FontAwesomeIcon icon={faClock} />
                                            {formatDate(activity.created_at)}
                                        </span>
                                    </div>
                                    <p className="activity-description">{activity.action_description}</p>
                                    {activity.resource_type && (
                                        <span className="activity-resource">
                                            {activity.resource_type}: {activity.resource_name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Estadísticas detalladas */}
            <div className="detailed-stats">
                <h3>Estadísticas Detalladas</h3>
                <div className="stats-grid">
                    <div className="detail-stat">
                        <FontAwesomeIcon icon={faUserPlus} />
                        <div>
                            <strong>{formatNumber(stats.weekStats?.clientsCreated || 0)}</strong>
                            <span>Clientes creados</span>
                        </div>
                    </div>
                    <div className="detail-stat">
                        <FontAwesomeIcon icon={faImage} />
                        <div>
                            <strong>{formatNumber(stats.weekStats?.galleriesCreated || 0)}</strong>
                            <span>Galerías creadas</span>
                        </div>
                    </div>
                    <div className="detail-stat">
                        <FontAwesomeIcon icon={faEdit} />
                        <div>
                            <strong>{formatNumber(stats.weekStats?.updatesPerformed || 0)}</strong>
                            <span>Actualizaciones</span>
                        </div>
                    </div>
                    <div className="detail-stat">
                        <FontAwesomeIcon icon={faTrash} />
                        <div>
                            <strong>{formatNumber(stats.weekStats?.deletionsPerformed || 0)}</strong>
                            <span>Eliminaciones</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsSection;