import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHistory, faFilter, faRotateRight,
    faChevronLeft, faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import './AuditSection.css';
import { API_URL } from '../../../config/api';

const ACTION_LABELS = {
    CLIENT_VIEW:            'Ver Clientes',
    CLIENT_CREATE:          'Crear Cliente',
    CLIENT_UPDATE:          'Editar Cliente',
    CLIENT_DELETE:          'Eliminar Cliente',
    GALLERY_VIEW:           'Ver Galerías',
    GALLERY_CREATE:         'Crear Galería',
    GALLERY_UPDATE:         'Editar Galería',
    GALLERY_DELETE:         'Eliminar Galería',
    VIDEO_CREATE:           'Crear Video',
    VIDEO_UPDATE:           'Editar Video',
    VIDEO_UPDATE_STATUS:    'Actualizar Estado Video',
    VIDEO_UPDATE_PROGRESS:  'Actualizar Progreso Video',
    VIDEO_DELETE:           'Eliminar Video',
    COMMENT_SEEN:           'Comentario Visto',
    REQUEST_UPDATE:         'Actualizar Solicitud',
    SELECTION_CANCEL:       'Cancelar Selección',
    SELECTION_VIDEO_READY:  'Entrega de Video',
    REVIEW_DELETE:          'Eliminar Reseña',
};

const ACTION_COLORS = {
    CLIENT_CREATE:          '#27ae60',
    CLIENT_UPDATE:          '#FF8C00',
    CLIENT_DELETE:          '#dc3545',
    GALLERY_CREATE:         '#27ae60',
    GALLERY_UPDATE:         '#FF8C00',
    GALLERY_DELETE:         '#dc3545',
    VIDEO_CREATE:           '#3b82f6',
    VIDEO_UPDATE:           '#FF8C00',
    VIDEO_UPDATE_STATUS:    '#8b5cf6',
    VIDEO_UPDATE_PROGRESS:  '#8b5cf6',
    VIDEO_DELETE:           '#dc3545',
    COMMENT_SEEN:           '#10b981',
    REQUEST_UPDATE:         '#FF8C00',
    SELECTION_CANCEL:       '#ef4444',
    SELECTION_VIDEO_READY:  '#10b981',
    REVIEW_DELETE:          '#dc3545',
    CLIENT_VIEW:            '#374151',
    GALLERY_VIEW:           '#374151',
};

const AuditSection = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ page: 1, limit: 25, total: 0, totalPages: 1 });
    const [filters, setFilters] = useState({ action_type: '', start_date: '', end_date: '' });

    useEffect(() => {
        fetchLogs();
    }, [pagination.page, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({ page: pagination.page, limit: pagination.limit });
            if (filters.action_type) params.append('action_type', filters.action_type);
            if (filters.start_date)  params.append('start_date', filters.start_date);
            if (filters.end_date)    params.append('end_date', filters.end_date);

            const res = await fetch(`${API_URL}/admin/activity-logs?${params}`, {
                credentials: 'include'
            });
            if (res.ok) {
                const data = await res.json();
                setLogs(data.data.logs || []);
                setPagination(prev => ({ ...prev, ...data.data.pagination }));
            }
        } catch (err) {
            console.error('Error fetching logs:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleString('es-AR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

    return (
        <div className="audit-section">
            <div className="audit-section__header">
                <div className="audit-section__title">
                    <FontAwesomeIcon icon={faHistory} />
                    <h2>Historial de Actividad</h2>
                </div>
                <button className="audit-section__refresh-btn" onClick={fetchLogs}>
                    <FontAwesomeIcon icon={faRotateRight} />
                    Actualizar
                </button>
            </div>

            <div className="audit-section__filters">
                <FontAwesomeIcon icon={faFilter} className="audit-section__filter-icon" />
                <select
                    name="action_type"
                    value={filters.action_type}
                    onChange={handleFilterChange}
                    className="audit-section__select"
                >
                    <option value="">Todas las acciones</option>
                    {Object.entries(ACTION_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <input
                    type="date"
                    name="start_date"
                    value={filters.start_date}
                    onChange={handleFilterChange}
                    className="audit-section__input"
                />
                <span className="audit-section__sep">—</span>
                <input
                    type="date"
                    name="end_date"
                    value={filters.end_date}
                    onChange={handleFilterChange}
                    className="audit-section__input"
                />
            </div>

            {loading ? (
                <div className="audit-section__loading">
                    <div className="audit-section__spinner" />
                    <p>Cargando historial...</p>
                </div>
            ) : logs.length === 0 ? (
                <div className="audit-section__empty">
                    <FontAwesomeIcon icon={faHistory} className="audit-section__empty-icon" />
                    <p>No hay registros para los filtros seleccionados.</p>
                </div>
            ) : (
                <>
                    <div className="audit-section__table-wrapper">
                        <table className="audit-section__table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Admin</th>
                                    <th>Acción</th>
                                    <th>Descripción</th>
                                    <th>Recurso</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.id}>
                                        <td className="audit-section__cell--date">{formatDate(log.created_at)}</td>
                                        <td className="audit-section__cell--admin">{log.admin_name}</td>
                                        <td>
                                            <span
                                                className="audit-section__badge"
                                                style={{ background: ACTION_COLORS[log.action_type] || '#374151' }}
                                            >
                                                {ACTION_LABELS[log.action_type] || log.action_type}
                                            </span>
                                        </td>
                                        <td className="audit-section__cell--desc">{log.action_description}</td>
                                        <td className="audit-section__cell--resource">
                                            {log.resource_name || log.resource_type || '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="audit-section__pagination">
                        <span className="audit-section__count">
                            {pagination.total} registros · Página {pagination.page} de {pagination.totalPages}
                        </span>
                        <div className="audit-section__page-btns">
                            <button
                                className="audit-section__page-btn"
                                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                                disabled={pagination.page <= 1}
                            >
                                <FontAwesomeIcon icon={faChevronLeft} />
                            </button>
                            <button
                                className="audit-section__page-btn"
                                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                                disabled={pagination.page >= pagination.totalPages}
                            >
                                <FontAwesomeIcon icon={faChevronRight} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AuditSection;
