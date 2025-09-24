// CommentsSection.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faTimes, faEdit, faTrash, faPaperPlane, faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const CommentsSection = ({ user, galleryId }) => {
  const [comments, setComments] = useState([]);
  const [generalRequests, setGeneralRequests] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRequest, setNewRequest] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [activeTab, setActiveTab] = useState('comments');

  useEffect(() => {
    if (showComments) {
      fetchComments();
      fetchGeneralRequests();
    }
  }, [showComments]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`http://localhost:3000/user/getComments?gallery_id=${galleryId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchGeneralRequests = async () => {
    try {
      const response = await fetch(`http://localhost:3000/user/getGeneralRequests?gallery_id=${galleryId}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneralRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching general requests:', error);
    }
  };

  const addComment = async () => {
    if (newComment.trim().length === 0) {
      toast.info('El comentario no puede estar vacío');
      return;
    }

    if (newComment.length > 100) {
      toast.info('El comentario no puede tener más de 100 caracteres');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/user/addComment', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gallery_id: galleryId,
          comment: newComment.trim()
        })
      });

      if (response.ok) {
        setNewComment('');
        fetchComments();
        toast.success('Comentario agregado correctamente');
      } else {
        throw new Error('Error al agregar comentario');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error al agregar comentario');
    }
  };

  const addGeneralRequest = async () => {
    if (newRequest.trim().length === 0) {
      toast.info('La solicitud no puede estar vacía');
      return;
    }

    if (newRequest.length > 100) {
      toast.info('La solicitud no puede tener más de 100 caracteres');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/user/addGeneralRequest', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gallery_id: galleryId,
          request: newRequest.trim()
        })
      });

      if (response.ok) {
        setNewRequest('');
        fetchGeneralRequests();
        toast.success('Solicitud agregada correctamente');
      } else {
        throw new Error('Error al agregar solicitud');
      }
    } catch (error) {
      console.error('Error adding request:', error);
      toast.error('Error al agregar solicitud');
    }
  };

  const updateComment = async (commentId, newText) => {
    if (newText.trim().length === 0) {
      toast.info('El comentario no puede estar vacío');
      return;
    }

    if (newText.length > 100) {
      toast.info('El comentario no puede tener más de 100 caracteres');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/user/updateComment', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: commentId,
          comment: newText.trim()
        })
      });

      if (response.ok) {
        setEditingComment(null);
        fetchComments();
        toast.success('Comentario actualizado correctamente');
      } else {
        throw new Error('Error al actualizar comentario');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error al actualizar comentario');
    }
  };

  const updateGeneralRequest = async (requestId, newText) => {
    if (newText.trim().length === 0) {
      toast.info('La solicitud no puede estar vacía');
      return;
    }

    if (newText.length > 100) {
      toast.info('La solicitud no puede tener más de 100 caracteres');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/user/updateGeneralRequest', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request_id: requestId,
          request: newText.trim()
        })
      });

      if (response.ok) {
        setEditingRequest(null);
        fetchGeneralRequests();
        toast.success('Solicitud actualizada correctamente');
      } else {
        throw new Error('Error al actualizar solicitud');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error('Error al actualizar solicitud');
    }
  };

  const deleteComment = async (commentId) => {
    const result = await Swal.fire({
      title: '¿Eliminar comentario?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('http://localhost:3000/user/deleteComment', {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ comment_id: commentId })
        });

        if (response.ok) {
          fetchComments();
          toast.success('Comentario eliminado correctamente');
        } else {
          throw new Error('Error al eliminar comentario');
        }
      } catch (error) {
        console.error('Error deleting comment:', error);
        toast.error('Error al eliminar comentario');
      }
    }
  };

  const deleteGeneralRequest = async (requestId) => {
    const result = await Swal.fire({
      title: '¿Eliminar solicitud?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch('http://localhost:3000/user/deleteGeneralRequest', {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ request_id: requestId })
        });

        if (response.ok) {
          fetchGeneralRequests();
          toast.success('Solicitud eliminada correctamente');
        } else {
          throw new Error('Error al eliminar solicitud');
        }
      } catch (error) {
        console.error('Error deleting request:', error);
        toast.error('Error al eliminar solicitud');
      }
    }
  };

  return (
    <>
      <button 
        className="comments-toggle-btn"
        onClick={() => setShowComments(!showComments)}
      >
        <FontAwesomeIcon icon={faComment} />
        Comentarios y Solicitudes
      </button>

      {showComments && (
        <div className="comments-overlay">
          <div className="comments-content">
            <div className="comments-header">
              <h2>Comentarios y Solicitudes</h2>
              <button 
                className="comments-close"
                onClick={() => setShowComments(false)}
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="comments-tabs">
              <button 
                className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                onClick={() => setActiveTab('comments')}
              >
                Comentarios ({comments.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
                onClick={() => setActiveTab('requests')}
              >
                Solicitudes Generales ({generalRequests.length})
              </button>
            </div>

            {activeTab === 'comments' && (
              <div className="comments-tab">
                <div className="add-comment">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe tu comentario (máx. 100 caracteres)"
                    maxLength={100}
                    rows={3}
                  />
                  <div className="comment-actions">
                    <span className="char-count">{newComment.length}/100</span>
                    <button onClick={addComment} className="send-btn">
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Enviar
                    </button>
                  </div>
                </div>

                <div className="comments-list">
                  {comments.length === 0 ? (
                    <p className="no-items">No hay comentarios aún</p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="comment-item">
                        {editingComment === comment.id ? (
                          <>
                            <textarea
                              value={comment.editingText || comment.comment}
                              onChange={(e) => {
                                const updatedComments = comments.map(c => 
                                  c.id === comment.id 
                                    ? { ...c, editingText: e.target.value }
                                    : c
                                );
                                setComments(updatedComments);
                              }}
                              maxLength={100}
                              rows={2}
                            />
                            <div className="comment-edit-actions">
                              <span className="char-count">
                                {(comment.editingText || comment.comment).length}/100
                              </span>
                              <button 
                                onClick={() => updateComment(comment.id, comment.editingText || comment.comment)}
                                className="save-btn"
                              >
                                Guardar
                              </button>
                              <button 
                                onClick={() => setEditingComment(null)}
                                className="cancel-btn"
                              >
                                Cancelar
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="comment-text">{comment.comment}</p>
                            <div className="comment-meta">
                              <span className="comment-date">
                                {new Date(comment.created_at).toLocaleDateString()}
                              </span>
                              <div className="comment-actions">
                                <button 
                                  onClick={() => setEditingComment(comment.id)}
                                  className="edit-btn"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button 
                                  onClick={() => deleteComment(comment.id)}
                                  className="delete-btn"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="requests-tab">
                <div className="add-request">
                  <textarea
                    value={newRequest}
                    onChange={(e) => setNewRequest(e.target.value)}
                    placeholder="Escribe tu solicitud general (máx. 100 caracteres)"
                    maxLength={100}
                    rows={3}
                  />
                  <div className="request-actions">
                    <span className="char-count">{newRequest.length}/100</span>
                    <button onClick={addGeneralRequest} className="send-btn">
                      <FontAwesomeIcon icon={faPaperPlane} />
                      Enviar
                    </button>
                  </div>
                </div>

                <div className="requests-list">
                  {generalRequests.length === 0 ? (
                    <p className="no-items">No hay solicitudes aún</p>
                  ) : (
                    generalRequests.map((request) => (
                      <div key={request.id} className="request-item">
                        {editingRequest === request.id ? (
                          <>
                            <textarea
                              value={request.editingText || request.request}
                              onChange={(e) => {
                                const updatedRequests = generalRequests.map(r => 
                                  r.id === request.id 
                                    ? { ...r, editingText: e.target.value }
                                    : r
                                );
                                setGeneralRequests(updatedRequests);
                              }}
                              maxLength={100}
                              rows={2}
                            />
                            <div className="request-edit-actions">
                              <span className="char-count">
                                {(request.editingText || request.request).length}/100
                              </span>
                              <button 
                                onClick={() => updateGeneralRequest(request.id, request.editingText || request.request)}
                                className="save-btn"
                              >
                                Guardar
                              </button>
                              <button 
                                onClick={() => setEditingRequest(null)}
                                className="cancel-btn"
                              >
                                Cancelar
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="request-text">{request.request}</p>
                            <div className="request-meta">
                              <span className="request-date">
                                {new Date(request.created_at).toLocaleDateString()}
                              </span>
                              <div className="request-actions">
                                <button 
                                  onClick={() => setEditingRequest(request.id)}
                                  className="edit-btn"
                                >
                                  <FontAwesomeIcon icon={faEdit} />
                                </button>
                                <button 
                                  onClick={() => deleteGeneralRequest(request.id)}
                                  className="delete-btn"
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default CommentsSection;