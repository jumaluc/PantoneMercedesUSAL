import React, { useState, useEffect } from 'react';
import './PoliciesModal.css';

const PoliciesModal = ({ onClose }) => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        fetch('http://localhost:3000/api/public/service-policies')
            .then(r => r.json())
            .then(data => setPolicies(data.data || []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className="pm-overlay" onClick={handleOverlayClick}>
            <div className="pm-modal">
                <div className="pm-modal-header">
                    <div className="pm-header-content">
                        <h2 className="pm-modal-title">Términos y Condiciones</h2>
                        <p className="pm-modal-subtitle">Políticas de servicio de Pantone Mercedes</p>
                    </div>
                    <button className="pm-close-btn" onClick={onClose}>✕</button>
                </div>

                {loading ? (
                    <div className="pm-loading">
                        <div className="pm-spinner" />
                    </div>
                ) : (
                    <div className="pm-body">
                        <div className="pm-sidebar">
                            {policies.map((p, i) => (
                                <button
                                    key={p.id}
                                    className={`pm-nav-item ${i === activeIndex ? 'pm-nav-item--active' : ''}`}
                                    onClick={() => setActiveIndex(i)}
                                >
                                    <span className="pm-nav-number">{String(i + 1).padStart(2, '0')}</span>
                                    <span className="pm-nav-label">{p.title}</span>
                                </button>
                            ))}
                        </div>

                        <div className="pm-content">
                            {policies[activeIndex] && (
                                <>
                                    <h3 className="pm-policy-title">{policies[activeIndex].title}</h3>
                                    <div className="pm-policy-body">
                                        {policies[activeIndex].content.split('\n').map((line, i) =>
                                            line.trim() === '' ? <br key={i} /> : <p key={i}>{line}</p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="pm-footer">
                    <span className="pm-footer-text">
                        Al registrarte en nuestra plataforma aceptás estas políticas.
                    </span>
                    <button className="pm-accept-btn" onClick={onClose}>Entendido</button>
                </div>
            </div>
        </div>
    );
};

export default PoliciesModal;
