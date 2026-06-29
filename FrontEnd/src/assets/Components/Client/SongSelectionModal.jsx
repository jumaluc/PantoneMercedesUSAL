import React, { useState } from 'react';
import './SongSelectionModal.css';

const MusicIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
    </svg>
);

const SongSelectionModal = ({ isOpen, onClose, onConfirm, imageCount, galleryTitle, loading }) => {
    const [songs, setSongs] = useState(['', '', '']);
    const [letAdminChoose, setLetAdminChoose] = useState(false);
    const [notes, setNotes] = useState('');

    if (!isOpen) return null;

    const handleSongChange = (index, value) => {
        const next = [...songs];
        next[index] = value;
        setSongs(next);
    };

    const hasAtLeastOneSong = songs.some(s => s.trim() !== '');
    const canConfirm = letAdminChoose || hasAtLeastOneSong;

    const handleConfirm = () => {
        onConfirm(
            letAdminChoose ? [] : songs.map(s => s.trim()).filter(Boolean),
            letAdminChoose,
            notes.trim() || null
        );
    };

    return (
        <div className="ssm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="ssm-modal">
                <div className="ssm-header">
                    <div className="ssm-header-icon">
                        <MusicIcon />
                    </div>
                    <div className="ssm-header-text">
                        <h2>Selección de canciones</h2>
                        <p>Para el video de <strong>{galleryTitle}</strong> · {imageCount} foto{imageCount !== 1 ? 's' : ''} seleccionada{imageCount !== 1 ? 's' : ''}</p>
                    </div>
                </div>

                <div className="ssm-body">
                    <div className="ssm-toggle-row">
                        <div className="ssm-toggle-info">
                            <span className="ssm-toggle-label">Que el equipo de Pantone elija las canciones</span>
                            <span className="ssm-toggle-desc">Dejaremos que nuestros fotógrafos elijan la música ideal para tu video</span>
                        </div>
                        <button
                            type="button"
                            className={`ssm-toggle ${letAdminChoose ? 'ssm-toggle--on' : ''}`}
                            onClick={() => setLetAdminChoose(v => !v)}
                        >
                            <span className="ssm-toggle-knob" />
                        </button>
                    </div>

                    <div className={`ssm-songs-section ${letAdminChoose ? 'ssm-songs-section--disabled' : ''}`}>
                        <p className="ssm-songs-label">
                            Elegí hasta 3 canciones en orden de preferencia
                        </p>
                        {[0, 1, 2].map(i => (
                            <div key={i} className="ssm-song-row">
                                <span className="ssm-song-num">{i + 1}</span>
                                <input
                                    type="text"
                                    className="ssm-song-input"
                                    placeholder={i === 0 ? 'Artista — Nombre de la canción (requerida)' : `Artista — Nombre de la canción (opcional)`}
                                    value={songs[i]}
                                    onChange={e => handleSongChange(i, e.target.value)}
                                    disabled={letAdminChoose}
                                    maxLength={280}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="ssm-notes-section">
                        <label className="ssm-notes-label">
                            Aclaraciones para el editor <span>(opcional)</span>
                        </label>
                        <textarea
                            className="ssm-notes-input"
                            placeholder="Ej: prefiero algo instrumental, sin letra, estilo romántico..."
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={2}
                            maxLength={500}
                        />
                    </div>
                </div>

                <div className="ssm-footer">
                    <button className="ssm-btn-cancel" onClick={onClose} disabled={loading}>
                        Volver
                    </button>
                    <button
                        className="ssm-btn-confirm"
                        onClick={handleConfirm}
                        disabled={!canConfirm || loading}
                    >
                        {loading ? (
                            <span className="ssm-spinner" />
                        ) : (
                            <MusicIcon />
                        )}
                        Confirmar selección
                    </button>
                </div>

                {!canConfirm && (
                    <p className="ssm-hint">
                        Ingresá al menos una canción o activá la opción "que el equipo elija"
                    </p>
                )}
            </div>
        </div>
    );
};

export default SongSelectionModal;
