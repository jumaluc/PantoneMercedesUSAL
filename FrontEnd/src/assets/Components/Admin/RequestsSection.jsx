import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEnvelope, faCheckCircle, faClock, faSpinner,
    faSearch, faExclamationTriangle, faBan, faSync,
    faChevronDown, faChevronUp, faSave
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import './RequestsSection.css';
import { API_URL } from '../../../config/api';

const PRIORITY_MAP = {
    urgent: { label: 'Urgente',  color: '#ef4444' },
    high:   { label: 'Alta',     color: '#f97316' },
    medium: { label: 'Media',    color: '#f59e0b' },
    low:    { label: 'Baja',     color: '#10b981' }
};

const STATUS_MAP = {
    pending:     { label: 'Pendiente',    color: '#f59e0b', icon: faClock },
    in_progress: { label: 'En progreso',  color: '#3b82f6', icon: faSync },
    resolved:    { label: 'Resuelto',     color: '#10b981', icon: faCheckCircle },
    cancelled:   { label: 'Cancelado',    color: '#6b7280', icon: faBan }
};

const TYPE_LABELS = {
    general:   'General',
    technical: 'Problema técnico',
    gallery:   'Consulta galería',
    billing:   'Facturación',
    other:     'Otro'
};

const RequestsSection = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [editing, setEditing] = useState({});
    const [saving, setSaving] = useState(null);

    useEffect(() => { fetchRequests(); }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/admin/requests`, { credentials: 'include' });
            if (!res.ok) throw new Error();
            const data = await res.json();
            const list = data.data || [];
            setRequests(list);
            setFilter(list.some(r => !r.status || r.status === 'pending') ? 'pending' : 'all');
        } catch {
            toast.error('Error al cargar las solicitudes', { id: 'req-fetch' });
        } finally {
            setLoading(false);
        }
    };

    const saveRequest = async (id) => {
        const { status, admin_response } = editing[id] || {};
        setSaving(id);
        try {
            const res = await fetch(`${API_URL}/admin/requests/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, admin_response })
            });
            if (!res.ok) throw new Error();
            setRequests(prev => prev.map(r =>
                r.id === id ? { ...r, status, admin_response } : r
            ));
            setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
            toast.success('Solicitud actualizada');
        } catch {
            toast.error('Error al guardar');
        } finally {
            setSaving(null);
        }
    };

    const initEdit = (r) => {
        if (!editing[r.id]) {
            setEditing(prev => ({
                ...prev,
                [r.id]: { status: r.status || 'pending', admin_response: r.admin_response || '' }
            }));
        }
        setExpanded(prev => prev === r.id ? null : r.id);
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('es-AR', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    const filtered = requests.filter(r => {
        const matchFilter = filter === 'all' || r.status === filter || (!r.status && filter === 'pending');
        const matchSearch = !search ||
            `${r.first_name} ${r.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
            r.subject?.toLowerCase().includes(search.toLowerCase()) ||
            r.message?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    const pendingCount = requests.filter(r => !r.status || r.status === 'pending').length;

    if (loading) return (
        <div className="rs-loading">
            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
            <p>Cargando solicitudes...</p>
        </div>
    );

    return (
        <div className="rs-container">
            <div className="rs-header">
                <div className="rs-header-left">
                    <h2><FontAwesomeIcon icon={faEnvelope} /> Solicitudes de Clientes</h2>
                    <p>Consultas y pedidos enviados por los clientes</p>
                </div>
                {pendingCount > 0 && (
                    <div className="rs-pending-badge">
                        <span>{pendingCount}</span>
                        <label>pendiente{pendingCount !== 1 ? 's' : ''}</label>
                    </div>
                )}
            </div>

            <div className="rs-toolbar">
                <div className="rs-search">
                    <FontAwesomeIcon icon={faSearch} />
                    <input
                        type="text"
                        placeholder="Buscar por cliente o asunto..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="rs-filters">
                    {Object.entries({
                        pending:     `Pendientes (${pendingCount})`,
                        in_progress: 'En progreso',
                        resolved:    'Resueltas',
                        all:         'Todas'
                    }).map(([key, label]) => (
                        <button
                            key={key}
                            className={`rs-filter-btn ${filter === key ? 'active' : ''}`}
                            onClick={() => setFilter(key)}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="rs-empty">
                    <FontAwesomeIcon icon={faEnvelope} />
                    <h3>Sin solicitudes</h3>
                    <p>{filter === 'pending'
                        ? 'No hay solicitudes pendientes.'
                        : 'No hay solicitudes para mostrar.'}</p>
                </div>
            ) : (
                <div className="rs-list">
                    {filtered.map(r => {
                        const status  = editing[r.id]?.status  ?? r.status  ?? 'pending';
                        const statusInfo   = STATUS_MAP[status]   || STATUS_MAP.pending;
                        const priorityInfo = PRIORITY_MAP[r.priority] || PRIORITY_MAP.medium;
                        const isExpanded   = expanded === r.id;
                        const isDirty      = !!editing[r.id];

                        return (
                            <div key={r.id} className={`rs-card ${isExpanded ? 'rs-card--open' : ''}`}>
                                {/* Header row */}
                                <div className="rs-card-header" onClick={() => initEdit(r)}>
                                    <div className="rs-card-left">
                                        <div className="rs-avatar">
                                            {r.first_name?.[0]}{r.last_name?.[0]}
                                        </div>
                                        <div className="rs-client-text">
                                            <span className="rs-client-name">{r.first_name} {r.last_name}</span>
                                            <span className="rs-client-email">{r.email}</span>
                                        </div>
                                    </div>

                                    <div className="rs-card-center">
                                        <span className="rs-subject">{r.subject}</span>
                                        <div className="rs-badges">
                                            <span className="rs-type-badge">{TYPE_LABELS[r.type] || r.type}</span>
                                            <span
                                                className="rs-priority-badge"
                                                style={{ background: priorityInfo.color }}
                                            >
                                                {r.priority === 'urgent' && <FontAwesomeIcon icon={faExclamationTriangle} />}
                                                {priorityInfo.label}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="rs-card-right">
                                        <span className="rs-status-chip" style={{ color: statusInfo.color, borderColor: statusInfo.color }}>
                                            <FontAwesomeIcon icon={statusInfo.icon} />
                                            {statusInfo.label}
                                        </span>
                                        <span className="rs-date">{formatDate(r.created_at)}</span>
                                        <FontAwesomeIcon
                                            icon={isExpanded ? faChevronUp : faChevronDown}
                                            className="rs-chevron"
                                        />
                                    </div>
                                </div>

                                {/* Expanded body */}
                                {isExpanded && (
                                    <div className="rs-card-body">
                                        <div className="rs-message">
                                            <label>Mensaje del cliente</label>
                                            <p>{r.message}</p>
                                        </div>

                                        <div className="rs-edit-row">
                                            <div className="rs-edit-group">
                                                <label>Estado</label>
                                                <div className="rs-status-buttons">
                                                    {Object.entries(STATUS_MAP).map(([key, info]) => (
                                                        <button
                                                            key={key}
                                                            className={`rs-status-btn ${status === key ? 'active' : ''}`}
                                                            style={status === key ? { background: info.color, borderColor: info.color } : {}}
                                                            onClick={() => setEditing(prev => ({
                                                                ...prev,
                                                                [r.id]: { ...prev[r.id], status: key }
                                                            }))}
                                                        >
                                                            <FontAwesomeIcon icon={info.icon} />
                                                            {info.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="rs-edit-group rs-edit-group--full">
                                                <label>Respuesta al cliente <span>(opcional)</span></label>
                                                <textarea
                                                    value={editing[r.id]?.admin_response ?? r.admin_response ?? ''}
                                                    onChange={e => setEditing(prev => ({
                                                        ...prev,
                                                        [r.id]: { ...prev[r.id], admin_response: e.target.value }
                                                    }))}
                                                    placeholder="Escribí una respuesta para el cliente..."
                                                    rows={3}
                                                />
                                            </div>
                                        </div>

                                        <div className="rs-save-row">
                                            <button
                                                className="rs-save-btn"
                                                onClick={() => saveRequest(r.id)}
                                                disabled={saving === r.id}
                                            >
                                                {saving === r.id
                                                    ? <FontAwesomeIcon icon={faSpinner} spin />
                                                    : <FontAwesomeIcon icon={faSave} />
                                                }
                                                Guardar cambios
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RequestsSection;
