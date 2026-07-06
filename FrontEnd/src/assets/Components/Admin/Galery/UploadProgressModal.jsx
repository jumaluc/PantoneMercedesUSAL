import React from 'react';
import './UploadProgressModal.css';

const formatTime = (seconds) => {
  if (!seconds || !isFinite(seconds) || seconds <= 0) return '...';
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.ceil(seconds % 60);
  return `${m}m ${s}s`;
};

const formatSpeed = (bytesPerSec) => {
  if (!bytesPerSec || bytesPerSec <= 0) return '...';
  const mbps = bytesPerSec / (1024 * 1024);
  return mbps >= 1 ? `${mbps.toFixed(1)} MB/s` : `${(bytesPerSec / 1024).toFixed(0)} KB/s`;
};

const UploadProgressModal = ({
  isOpen, galleryTitle, phase,
  uploaded, total, percentage,
  speedBps, estimatedSeconds, totalElapsedSeconds,
  error, onCancel, cancelling
}) => {
  if (!isOpen) return null;

  const isDone = phase === 'done';
  const isActive = !isDone && !error && !cancelling;

  return (
    <div className="upm-overlay">
      <div className="upm-card">
        <div className="upm-header">
          <img src="/logoPantone.jpg" alt="Pantone" className="upm-logo" />
          <h2 className="upm-title">
            {isDone
              ? 'Fotos subidas correctamente'
              : cancelling
              ? 'Cancelando...'
              : 'Subiendo galería'}
          </h2>
          {galleryTitle && <p className="upm-gallery-name">{galleryTitle}</p>}
        </div>

        <div className="upm-phase">
          {cancelling && 'Eliminando imágenes subidas...'}
          {!cancelling && phase === 'creating' && 'Creando galería...'}
          {!cancelling && phase === 'uploading' && `${uploaded} de ${total} fotos subidas`}
          {!cancelling && phase === 'finalizing' && 'Finalizando...'}
          {!cancelling && isDone && `${total} foto${total !== 1 ? 's' : ''} en ${formatTime(totalElapsedSeconds)}`}
        </div>

        <div className="upm-progress-section">
          <div className="upm-bar-track">
            <div
              className={`upm-bar-fill${cancelling ? ' upm-cancelling' : ''}`}
              style={{ width: `${cancelling ? 100 : percentage}%` }}
            />
          </div>
          <div className="upm-bar-labels">
            <span className="upm-percentage">{cancelling ? '—' : `${percentage}%`}</span>
            <span className="upm-count">{uploaded} / {total} fotos</span>
          </div>
        </div>

        {phase === 'uploading' && !cancelling && (
          <div className="upm-stats">
            <div className="upm-stat">
              <span className="upm-stat-label">Velocidad</span>
              <span className="upm-stat-value">{formatSpeed(speedBps)}</span>
            </div>
            <div className="upm-stat">
              <span className="upm-stat-label">Tiempo restante</span>
              <span className="upm-stat-value">{formatTime(estimatedSeconds)}</span>
            </div>
          </div>
        )}

        {isActive && (
          <div className="upm-footer-note">No cierres esta ventana</div>
        )}

        <button
          className={`upm-cancel-btn${isDone ? ' upm-cancel-btn--close' : ''}`}
          onClick={onCancel}
          disabled={cancelling}
        >
          {isDone ? 'Cerrar' : cancelling ? 'Cancelando...' : 'Cancelar subida'}
        </button>

        {error && <div className="upm-error">⚠ {error}</div>}
      </div>
    </div>
  );
};

export default UploadProgressModal;
