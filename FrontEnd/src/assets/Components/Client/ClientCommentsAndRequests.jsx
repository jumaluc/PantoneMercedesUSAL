import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faComment, 
    faPaperPlane, 
    faHistory, 
    faImage,
    faClock,
    faCheckCircle,
    faSpinner,
    faTimes,
    faSearch,
    faFilter,
    faEye,
    faReply,
    faExclamationCircle,
    faEnvelope,
    faListAlt
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './ClientCommentsAndRequests.css';

const ClientCommentsAndRequests = ({ user }) => {
    const [activeTab, setActiveTab] = useState('comments');
    const [comments, setComments] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingRequest, setSendingRequest] = useState(false);
    const [newRequest, setNewRequest] = useState({
        type: 'general',
        subject: '',
        message: '',
        priority: 'medium'
    });
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            if (activeTab === 'comments') {
                await fetchComments();
            } else {
                await fetchRequests();
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        console.log("Intentado agarrar los comentarios (fetchComments)")
        const response = await fetch('http://localhost:3000/user/getMyComments', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            setComments(data.comments || []);
        } else {
            throw new Error('Error al cargar comentarios');
        }
    };

    const fetchRequests = async () => {
        const response = await fetch('http://localhost:3000/user/getMyRequests', {
            credentials: 'include'
        });
        
        if (response.ok) {
            const data = await response.json();
            setRequests(data.requests || []);
        } else {
            throw new Error('Error al cargar solicitudes');
        }
    };

    const handleSubmitRequest = async (e) => {
        e.preventDefault();
        if (!newRequest.subject.trim() || !newRequest.message.trim()) {
            toast.error('Por favor completa todos los campos obligatorios');
            return;
        }

        setSendingRequest(true);
        try {
            const response = await fetch('http://localhost:3000/user/createRequest', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newRequest)
            });

            if (response.ok) {
                toast.success('Solicitud enviada correctamente');
                setNewRequest({
                    type: 'general',
                    subject: '',
                    message: '',
                    priority: 'medium'
                });
                await fetchRequests();
            } else {
                throw new Error('Error al enviar la solicitud');
            }
        } catch (error) {
            console.error('Error sending request:', error);
            toast.error('Error al enviar la solicitud');
        } finally {
            setSendingRequest(false);
        }
    };

    const filteredComments = comments.filter(comment => {
        const matchesSearch = searchTerm === '' || 
            comment.image_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            comment.comment_text?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        if (filter === 'replied') return matchesSearch && comment.admin_reply;
        if (filter === 'pending') return matchesSearch && !comment.admin_reply;
        
        return matchesSearch;
    });

    const filteredRequests = requests.filter(request => {
        const matchesSearch = searchTerm === '' || 
            request.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.message?.toLowerCase().includes(searchTerm.toLowerCase());
        
        if (filter === 'all') return matchesSearch;
        return matchesSearch && request.status === filter;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPriorityColor = (priority) => {
        const colors = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444',
            urgent: '#dc2626'
        };
        return colors[priority] || '#6b7280';
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: '#f59e0b',
            in_progress: '#3b82f6',
            resolved: '#10b981',
            cancelled: '#6b7280'
        };
        return colors[status] || '#6b7280';
    };

    if (loading) {
        return (
            <div className="comment-comments-requests-loading">
                <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                <p>Cargando {activeTab === 'comments' ? 'comentarios' : 'solicitudes'}...</p>
            </div>
        );
    }

    return (
        <div className="comment-comments-requests-container">
            {/* Header */}
            <div className="comment-cr-header">
                <h1>Comentarios y Solicitudes</h1>
                <p>Gestiona tus comentarios en las fotos y envía solicitudes al administrador</p>
            </div>

            {/* Tabs */}
            <div className="comment-cr-tabs">
                <button 
                    className={`comment-cr-tab ${activeTab === 'comments' ? 'comment-active' : ''}`}
                    onClick={() => setActiveTab('comments')}
                >
                    <FontAwesomeIcon icon={faComment} />
                    Mis Comentarios ({comments.length})
                </button>
                <button 
                    className={`comment-cr-tab ${activeTab === 'requests' ? 'comment-active' : ''}`}
                    onClick={() => setActiveTab('requests')}
                >
                    <FontAwesomeIcon icon={faEnvelope} />
                    Mis Solicitudes ({requests.length})
                </button>
                <button 
                    className={`comment-cr-tab ${activeTab === 'new-request' ? 'comment-active' : ''}`}
                    onClick={() => setActiveTab('new-request')}
                >
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Nueva Solicitud
                </button>
            </div>

            {/* Contenido según pestaña activa */}
            <div className="comment-cr-content">
                {activeTab === 'comments' && (
                    <div className="comment-comments-section">
                        {/* Filtros y búsqueda */}
                        <div className="comment-cr-filters">
                            <div className="comment-search-box">
                                <FontAwesomeIcon icon={faSearch} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar en comentarios..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="comment-filter-buttons">
                                <button 
                                    className={`comment-filter-btn ${filter === 'all' ? 'comment-active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    Todos
                                </button>
                                <button 
                                    className={`comment-filter-btn ${filter === 'replied' ? 'comment-active' : ''}`}
                                    onClick={() => setFilter('replied')}
                                >
                                    Con respuesta
                                </button>
                                <button 
                                    className={`comment-filter-btn ${filter === 'pending' ? 'comment-active' : ''}`}
                                    onClick={() => setFilter('pending')}
                                >
                                    Pendientes
                                </button>
                            </div>
                        </div>

                        {/* Lista de comentarios */}
                        <div className="comment-comments-list">
                            {filteredComments.length > 0 ? (
                                filteredComments.map((comment) => (
                                    <div key={comment.id} className="comment-comment-card">
                                        <div className="comment-comment-header">
                                            <div className="comment-image-info">
                                                {comment.image_url && (
                                                    <div className="comment-image-container">
                                                        <img 
                                                            src={comment.image_url} 
                                                            alt={comment.image_name || 'Imagen'} 
                                                            className="comment-image-preview"
                                                        />
                                                    </div>
                                                )}
                                                <div className="comment-image-details">

                                                    <span className="comment-date">
                                                        <FontAwesomeIcon icon={faClock} />
                                                        {formatDate(comment.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="comment-comment-content">
                                            <div className="comment-user-comment">
                                                <div className="comment-comment-bubble">
                                                    <p className="comment-comment-text">{comment.comment}</p>
                                                </div>
                                            </div>

                                            {comment.admin_reply && (
                                                <div className="comment-admin-reply">
                                                    <div className="comment-reply-header">
                                                        <FontAwesomeIcon icon={faReply} />
                                                        <strong>Respuesta del administrador:</strong>
                                                        <span className="comment-reply-date">{formatDate(comment.updated_at)}</span>
                                                    </div>
                                                    <div className="comment-admin-comment-bubble">
                                                        <p className="comment-reply-text">{comment.admin_reply}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {!comment.admin_reply && (
                                                <div className="comment-comment-status comment-pending">
                                                    <FontAwesomeIcon icon={faClock} />
                                                    Esperando respuesta del administrador
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="comment-empty-state">
                                    <FontAwesomeIcon icon={faComment} size="3x" />
                                    <h3>No hay comentarios para mostrar</h3>
                                    <p>No has realizado comentarios en ninguna foto aún.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'requests' && (
                    <div className="comment-requests-section">
                        {/* Filtros y búsqueda */}
                        <div className="comment-cr-filters">
                            <div className="comment-search-box">
                                <FontAwesomeIcon icon={faSearch} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar en solicitudes..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="comment-filter-buttons">
                                <button 
                                    className={`comment-filter-btn ${filter === 'all' ? 'comment-active' : ''}`}
                                    onClick={() => setFilter('all')}
                                >
                                    Todas
                                </button>
                                <button 
                                    className={`comment-filter-btn ${filter === 'pending' ? 'comment-active' : ''}`}
                                    onClick={() => setFilter('pending')}
                                >
                                    Pendientes
                                </button>
                                <button 
                                    className={`comment-filter-btn ${filter === 'in_progress' ? 'comment-active' : ''}`}
                                    onClick={() => setFilter('in_progress')}
                                >
                                    En progreso
                                </button>
                                <button 
                                    className={`comment-filter-btn ${filter === 'resolved' ? 'comment-active' : ''}`}
                                    onClick={() => setFilter('resolved')}
                                >
                                    Resueltas
                                </button>
                            </div>
                        </div>

                        {/* Lista de solicitudes */}
                        <div className="comment-requests-list">
                            {filteredRequests.length > 0 ? (
                                filteredRequests.map((request) => (
                                    <div key={request.id} className="comment-request-card">
                                        <div className="comment-request-header">
                                            <div className="comment-request-title-section">
                                                <h4 className="comment-request-subject">{request.subject}</h4>
                                                <span 
                                                    className="comment-request-priority"
                                                    style={{ backgroundColor: getPriorityColor(request.priority) }}
                                                >
                                                    {request.priority}
                                                </span>
                                            </div>
                                            <span 
                                                className="comment-request-status"
                                                style={{ color: getStatusColor(request.status) }}
                                            >
                                                <FontAwesomeIcon icon={
                                                    request.status === 'resolved' ? faCheckCircle :
                                                    request.status === 'in_progress' ? faSpinner :
                                                    request.status === 'cancelled' ? faTimes : faClock
                                                } />
                                                {request.status === 'pending' ? 'Pendiente' :
                                                 request.status === 'in_progress' ? 'En progreso' :
                                                 request.status === 'resolved' ? 'Resuelta' : 'Cancelada'}
                                            </span>
                                        </div>
                                        
                                        <div className="comment-request-meta">
                                            <span className="comment-request-type">
                                                <FontAwesomeIcon icon={faListAlt} />
                                                Tipo: {request.type}
                                            </span>
                                            <span className="comment-request-date">
                                                <FontAwesomeIcon icon={faClock} />
                                                {formatDate(request.created_at)}
                                            </span>
                                        </div>

                                        <div className="comment-request-content">
                                            <p className="comment-request-message">{request.message}</p>
                                        </div>

                                        {request.admin_response && (
                                            <div className="comment-admin-response">
                                                <div className="comment-response-header">
                                                    <FontAwesomeIcon icon={faReply} />
                                                    <strong>Respuesta del administrador:</strong>
                                                    <span className="comment-response-date">{formatDate(request.updated_at)}</span>
                                                </div>
                                                <p className="comment-response-text">{request.admin_response}</p>
                                            </div>
                                        )}

                                        {request.status === 'pending' && (
                                            <div className="comment-request-actions">
                                                <button className="comment-action-btn comment-view-btn">
                                                    <FontAwesomeIcon icon={faEye} />
                                                    Ver detalles
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="comment-empty-state">
                                    <FontAwesomeIcon icon={faEnvelope} size="3x" />
                                    <h3>No hay solicitudes para mostrar</h3>
                                    <p>No has enviado ninguna solicitud aún.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'new-request' && (
                    <div className="comment-new-request-section">
                        <div className="comment-request-form-container">
                            <h3>Nueva Solicitud</h3>
                            <p>Envía una solicitud al administrador para cualquier consulta o necesidad</p>
                            
                            <form onSubmit={handleSubmitRequest} className="comment-request-form">
                                <div className="comment-form-row">
                                    <div className="comment-form-group">
                                        <label>Tipo de solicitud *</label>
                                        <select 
                                            value={newRequest.type}
                                            onChange={(e) => setNewRequest({...newRequest, type: e.target.value})}
                                            required
                                        >
                                            <option value="general">General</option>
                                            <option value="technical">Problema técnico</option>
                                            <option value="gallery">Consulta sobre galería</option>
                                            <option value="billing">Facturación</option>
                                            <option value="other">Otro</option>
                                        </select>
                                    </div>
                                    
                                    <div className="comment-form-group">
                                        <label>Prioridad *</label>
                                        <select 
                                            value={newRequest.priority}
                                            onChange={(e) => setNewRequest({...newRequest, priority: e.target.value})}
                                            required
                                        >
                                            <option value="low">Baja</option>
                                            <option value="medium">Media</option>
                                            <option value="high">Alta</option>
                                            <option value="urgent">Urgente</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="comment-form-group">
                                    <label>Asunto *</label>
                                    <input 
                                        type="text" 
                                        value={newRequest.subject}
                                        onChange={(e) => setNewRequest({...newRequest, subject: e.target.value})}
                                        placeholder="Ej: Problema con la descarga de imágenes"
                                        required
                                    />
                                </div>

                                <div className="comment-form-group">
                                    <label>Mensaje *</label>
                                    <textarea 
                                        value={newRequest.message}
                                        onChange={(e) => setNewRequest({...newRequest, message: e.target.value})}
                                        placeholder="Describe tu solicitud en detalle..."
                                        rows="6"
                                        required
                                    />
                                </div>

                                <div className="comment-form-actions">
                                    <button 
                                        type="button" 
                                        className="comment-cancel-btn"
                                        onClick={() => setActiveTab('requests')}
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="comment-submit-btn"
                                        disabled={sendingRequest}
                                    >
                                        {sendingRequest ? (
                                            <>
                                                <FontAwesomeIcon icon={faSpinner} spin />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <FontAwesomeIcon icon={faPaperPlane} />
                                                Enviar Solicitud
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientCommentsAndRequests;