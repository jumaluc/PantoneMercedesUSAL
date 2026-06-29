import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import './ClientReviews.css';

const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="rv-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`rv-star ${star <= (hovered || value) ? 'rv-star-filled' : ''}`}
          onClick={() => !readOnly && onChange(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          disabled={readOnly}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, onToggleLike }) => {
  const initials = `${review.first_name[0]}${review.last_name[0]}`.toUpperCase();
  const date = new Date(review.created_at).toLocaleDateString('es-AR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  const liked = Number(review.user_has_liked) === 1;

  return (
    <div className="rv-card">
      <div className="rv-card-header">
        <div className="rv-avatar">{initials}</div>
        <div className="rv-card-info">
          <span className="rv-name">{review.first_name} {review.last_name}</span>
          <span className="rv-service">{review.service || 'Cliente'}</span>
        </div>
        <div className="rv-card-rating">
          <StarRating value={review.rating} readOnly />
          <span className="rv-rating-num">{review.rating}/5</span>
        </div>
      </div>
      <p className="rv-message">"{review.message}"</p>
      <div className="rv-card-footer">
        <span className="rv-date">{date}</span>
        <button
          className={`rv-like-btn ${liked ? 'rv-like-btn--active' : ''}`}
          onClick={() => onToggleLike(review.id)}
        >
          ♥ {review.likes_count > 0 ? review.likes_count : ''}
        </button>
      </div>
    </div>
  );
};

const ClientReviews = ({ user }) => {
  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const fetchData = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        fetch('http://localhost:3000/user/getAllReviews', { credentials: 'include' }),
        fetch('http://localhost:3000/user/getMyReview', { credentials: 'include' })
      ]);
      const allData = await allRes.json();
      const myData = await myRes.json();
      setReviews(allData.reviews || []);
      if (myData.review) {
        setMyReview(myData.review);
        setRating(myData.review.rating);
        setMessage(myData.review.message);
      }
    } catch {
      toast.error('Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (reviewId) => {
    try {
      const res = await fetch(`http://localhost:3000/user/toggleLike/${reviewId}`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!res.ok) return;
      setReviews(prev => prev.map(r => {
        if (r.id !== reviewId) return r;
        const liked = Number(r.user_has_liked) === 1;
        return {
          ...r,
          user_has_liked: liked ? 0 : 1,
          likes_count: liked ? Number(r.likes_count) - 1 : Number(r.likes_count) + 1
        };
      }));
    } catch {
      toast.error('Error al procesar el like');
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) { toast.error('Escribí un mensaje'); return; }
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:3000/user/submitReview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rating, message })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(myReview ? 'Reseña actualizada' : 'Reseña enviada');
      setEditing(false);
      await fetchData();
    } catch (err) {
      toast.error(err.message || 'Error al enviar la reseña');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  if (loading) return <div className="rv-loading"><div className="rv-spinner" /></div>;

  const showForm = !myReview || editing;

  return (
    <div className="rv-container">
      <div className="rv-header">
        <h1 className="rv-title">Reseñas</h1>
        <p className="rv-subtitle">Lo que dicen nuestros clientes</p>
        {avgRating && (
          <div className="rv-global-rating">
            <span className="rv-global-num">{avgRating}</span>
            <StarRating value={Math.round(avgRating)} readOnly />
            <span className="rv-global-count">({reviews.length} {reviews.length === 1 ? 'reseña' : 'reseñas'})</span>
          </div>
        )}
      </div>

      {/* Formulario */}
      <div className="rv-form-section">
        {myReview && !editing ? (
          <div className="rv-my-review">
            <div className="rv-my-review-header">
              <span className="rv-my-label">Tu reseña</span>
              <button className="rv-edit-btn" onClick={() => setEditing(true)}>Editar</button>
            </div>
            <StarRating value={myReview.rating} readOnly />
            <p className="rv-my-message">"{myReview.message}"</p>
          </div>
        ) : (
          <form className="rv-form" onSubmit={handleSubmit}>
            <h2 className="rv-form-title">{myReview ? 'Editar tu reseña' : 'Dejá tu reseña'}</h2>
            <div className="rv-form-group">
              <label className="rv-label">Puntaje</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <div className="rv-form-group">
              <label className="rv-label">Mensaje</label>
              <textarea
                className="rv-textarea"
                placeholder="Contá tu experiencia con Pantone Mercedes..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                maxLength={500}
              />
              <span className="rv-char-count">{message.length}/500</span>
            </div>
            <div className="rv-form-actions">
              {editing && (
                <button type="button" className="rv-cancel-btn" onClick={() => { setEditing(false); setMessage(myReview.message); setRating(myReview.rating); }}>
                  Cancelar
                </button>
              )}
              <button type="submit" className="rv-submit-btn" disabled={submitting}>
                {submitting ? 'Enviando...' : myReview ? 'Actualizar' : 'Enviar reseña'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Lista de reseñas */}
      <div className="rv-list-section">
        <h2 className="rv-list-title">Todas las reseñas ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="rv-empty">Todavía no hay reseñas. ¡Sé el primero!</div>
        ) : (
          <div className="rv-grid">
            {reviews.map((r) => <ReviewCard key={r.id} review={r} onToggleLike={handleToggleLike} />)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientReviews;
