import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPaperPlane, faComment, faEdit, faTrash, faSave, faUndo } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ImageCommentsOverlay = ({ image, isOpen, onClose, galleryId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (isOpen && image) {
      fetchImageComments();
      // Resetear el estado de edición cuando se abre el overlay
      setEditingCommentId(null);
      setEditText('');
    }
  }, [isOpen, image]);

  const fetchImageComments = async () => {
    try {
      const response = await fetch(`http://localhost:3000/user/getImageComments?image_id=${image.id}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Comentarios recibidos:", data.comments);
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching image comments:', error);
    }
  };

const addImageComment = async () => {
  if (newComment.trim().length === 0) {
    toast.info('El comentario no puede estar vacío');
    return;
  }
  
  if (newComment.length > 100) {
    toast.info('El comentario no puede tener más de 100 caracteres');
    return;
  }

  setLoading(true);
  try {
    console.log("Datos a enviar:", {
      image_id: image.id,
      gallery_id: galleryId,
      comment: newComment.trim()
    });
    
    const response = await fetch('http://localhost:3000/user/addComment', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_id: image.id,
        gallery_id: galleryId,
        comment: newComment.trim()
      })
    });

    const result = await response.json();
    console.log("Respuesta del servidor:", result);
    
    if (response.ok) {
      // Verificar diferentes posibles nombres para el ID del comentario
      const commentId = result.commentId || result.insertId || result.id;
      
      if (!commentId) {
        console.warn("El servidor no devolvió un ID de comentario, recargando comentarios...");
        await fetchImageComments(); // Recargar todos los comentarios
      } else {
        // Agregar el nuevo comentario al estado local
        setComments(prevComments => [...prevComments, {
          id: commentId,
          comment: newComment.trim(),
          created_at: new Date().toISOString()
        }]);
      }
      
      setNewComment('');
      toast.success(result.message || 'Comentario agregado correctamente');
    } else {
      throw new Error(result.message || 'Error al agregar comentario');
    }
  } catch (error) {
    console.error('Error adding image comment:', error);
    toast.error(error.message || 'Error al agregar comentario');
  } finally {
    setLoading(false);
  }
};

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditText(comment.comment);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditText('');
  };

  const updateComment = async (commentId) => {
    if (editText.trim().length === 0) {
      toast.info('El comentario no puede estar vacío');
      return;
    }
    
    if (editText.length > 100) {
      toast.info('El comentario no puede tener más de 100 caracteres');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/user/updateImageComment', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          comment_id: commentId,
          comment: editText.trim()
        })
      });

      if (response.ok) {
        // Actualizar el comentario en el estado local
        console.log("ENTRO AL OK")
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === commentId 
              ? { ...comment, comment: editText.trim() }
              : comment
          )
        );
        setEditingCommentId(null);
        setEditText('');
        toast.success('Comentario actualizado correctamente');
      } else {
                console.log("ENTRO AL ERROR")

        throw new Error('Error al actualizar comentario');
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Error al actualizar comentario');
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
        const response = await fetch('http://localhost:3000/user/deleteImageComment', {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            comment_id: commentId
          })
        });

        if (response.ok) {
          // Eliminar el comentario del estado local
          setComments(prevComments => 
            prevComments.filter(comment => comment.id !== commentId)
          );
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

  if (!isOpen || !image) return null;

  return (
    <div className="image-comments-overlay" onClick={onClose}>
      <div className="image-comments-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-comments-close" onClick={onClose}>
          <FontAwesomeIcon icon={faTimes} />
        </button>
        
        <div className="image-comments-container">
          <div className="image-comments-preview">
            <img src={image.image_url} alt={image.original_filename} />
          </div>
          
          <div className="image-comments-section">
            <h3>Comentarios sobre esta imagen</h3>
            
            <div className="image-comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">No hay comentarios para esta imagen</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="image-comment-item">
                    {editingCommentId === comment.id ? (
                      <div className="comment-edit-mode">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          maxLength={100}
                          rows={3}
                          className="comment-edit-textarea"
                        />
                        <div className="comment-edit-actions">
                          <span className="char-count">{editText.length}/100</span>
                          <div className="comment-edit-buttons">
                            <button 
                              onClick={() => updateComment(comment.id)}
                              className="save-edit-btn-a"
                              title="Guardar cambios"
                            >
                              <FontAwesomeIcon icon={faSave} /> Guardar
                            </button>
                            <button 
                              onClick={cancelEditing}
                              className="cancel-edit-btn-a"
                              title="Cancelar edición"
                            >
                              <FontAwesomeIcon icon={faUndo} /> Cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="image-comment-text">{comment.comment}</p>
                        <div className="image-comment-meta">
                          <span className="image-comment-date">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                          <div className="image-comment-item-actions">
                            <button 
                              onClick={() => startEditing(comment)}
                              className="edit-comment-btn"
                              title="Editar comentario"
                            >
                              <FontAwesomeIcon icon={faEdit} />
                            </button>
                            <button 
                              onClick={() => deleteComment(comment.id)}
                              className="delete-comment-btn"
                              title="Eliminar comentario"
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
            
            <div className="image-add-comment">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario sobre esta imagen (máx. 100 caracteres)"
                maxLength={100}
                rows={3}
              />
              <div className="image-comment-form-actions">
                <span className="char-count">{newComment.length}/100</span>
                <button 
                  onClick={addImageComment} 
                  className="send-image-comment-btn"
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={faPaperPlane} /> Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCommentsOverlay;