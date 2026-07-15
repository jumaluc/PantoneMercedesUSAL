import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTimes, faSave, faTrash, faPlus, faSpinner, faImages, faCloudUploadAlt, faChevronDown
} from '@fortawesome/free-solid-svg-icons';
import toast from 'react-hot-toast';
import './EditGalleryModal.css';
import { API_URL } from '../../../../config/api';

const INITIAL_PREVIEW_COUNT = 20;
const PREVIEW_LOAD_MORE_COUNT = 30;

const fmtTime = (secs) => {
    if (secs == null || !isFinite(secs)) return '...';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const EditGalleryModal = ({ gallery, isOpen, onClose, onUpdated }) => {
    const [formData, setFormData] = useState({ title: '', description: '', status: 'active' });
    const [images, setImages] = useState([]);
    const [loadingImages, setLoadingImages] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingImage, setDeletingImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [visibleCount, setVisibleCount] = useState(INITIAL_PREVIEW_COUNT);
    const fileInputRef = useRef(null);
    const startTimeRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (uploading) {
            startTimeRef.current = Date.now();
            setElapsed(0);
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [uploading]);

    useEffect(() => {
        if (isOpen && gallery) {
            setFormData({
                title: gallery.title || '',
                description: gallery.description || '',
                status: gallery.status || 'active'
            });
            fetchImages();
            setVisibleCount(INITIAL_PREVIEW_COUNT);
        }
    }, [isOpen, gallery]);

    const fetchImages = async () => {
        setLoadingImages(true);
        try {
            const res = await fetch(`${API_URL}/admin/getGalleryImages/${gallery.id}`, { credentials: 'include' });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setImages(data.data || []);
        } catch {
            toast.error('Error al cargar las imágenes');
        } finally {
            setLoadingImages(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title.trim()) { toast.error('El título es obligatorio'); return; }
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/admin/updateGallery/${gallery.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error();
            toast.success('Galería actualizada');
            onUpdated();
            onClose();
        } catch {
            toast.error('Error al actualizar la galería');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteImage = async (imageId) => {
        setDeletingImage(imageId);
        try {
            const res = await fetch(`${API_URL}/admin/deleteGalleryImage/${imageId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (!res.ok) throw new Error();
            setImages(prev => prev.filter(img => img.id !== imageId));
            toast.success('Imagen eliminada');
        } catch {
            toast.error('Error al eliminar la imagen');
        } finally {
            setDeletingImage(null);
        }
    };

    const handleAddImages = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;
        if (fileInputRef.current) fileInputRef.current.value = '';

        setUploading(true);
        setUploadProgress({ done: 0, total: files.length, failed: 0 });

        let done = 0;
        let failed = 0;

        await Promise.all(files.map(async (file) => {
            const form = new FormData();
            form.append('images', file);
            try {
                const res = await fetch(`${API_URL}/admin/addImagesToGallery/${gallery.id}`, {
                    method: 'POST',
                    credentials: 'include',
                    body: form,
                });
                if (res.ok) done++; else failed++;
            } catch {
                failed++;
            }
            setUploadProgress(prev => ({ ...prev, done: done, failed }));
        }));

        fetchImages();
        if (failed === 0) toast.success(`${done} imagen(es) subida(s)`);
        else toast.error(`${done} subidas, ${failed} fallaron`);
        setUploading(false);
        setUploadProgress(null);
    };

    if (!isOpen) return null;

    return (
        <div className="egm-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="egm-modal">
                <div className="egm-header">
                    <div className="egm-title">
                        <FontAwesomeIcon icon={faImages} />
                        <h2>Editar Galería</h2>
                    </div>
                    <button className="egm-close" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className="egm-body">
                    <div className="egm-fields">
                        <div className="egm-field">
                            <label>Título *</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                placeholder="Título de la galería"
                            />
                        </div>
                        <div className="egm-field">
                            <label>Descripción</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                placeholder="Descripción..."
                                rows={2}
                            />
                        </div>
                        <div className="egm-field">
                            <label>Estado</label>
                            <select value={formData.status} onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}>
                                <option value="active">Activa</option>
                                <option value="inactive">Inactiva</option>
                            </select>
                        </div>
                    </div>

                    <div className="egm-save-row">
                        <button className="egm-save-btn" onClick={handleSave} disabled={saving}>
                            {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSave} />}
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>

                    <div className="egm-images-section">
                        <div className="egm-images-header">
                            <h3>Imágenes ({images.length})</h3>
                            <button className="egm-add-btn" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                                {uploading ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />}
                                {uploading ? 'Subiendo...' : 'Agregar fotos'}
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleAddImages}
                                style={{ display: 'none' }}
                            />
                        </div>

                        {uploading && uploadProgress && (
                            <div className="egm-upload-progress">
                                <div className="egm-upload-progress-header">
                                    <FontAwesomeIcon icon={faCloudUploadAlt} />
                                    <span>
                                        Subiendo a Google Cloud... {uploadProgress.done} / {uploadProgress.total}
                                    </span>
                                    <span className="egm-upload-elapsed">
                                        {fmtTime(elapsed)} transcurridos
                                    </span>
                                </div>
                                <div className="egm-progress-bar-track">
                                    <div
                                        className="egm-progress-bar-fill"
                                        style={{ width: `${(uploadProgress.done / uploadProgress.total) * 100}%` }}
                                    />
                                </div>
                                <div className="egm-upload-progress-footer">
                                    <span>
                                        {uploadProgress.failed > 0 && `${uploadProgress.failed} fallaron`}
                                    </span>
                                    <span>
                                        {uploadProgress.done < uploadProgress.total
                                            ? `Faltan ${uploadProgress.total - uploadProgress.done} fotos`
                                            : 'Finalizando...'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {loadingImages ? (
                            <div className="egm-loading">
                                <FontAwesomeIcon icon={faSpinner} spin />
                                <span>Cargando imágenes...</span>
                            </div>
                        ) : (
                            <>
                                <div className="egm-images-grid">
                                    {images.slice(0, visibleCount).map(img => (
                                        <div key={img.id} className="egm-image-item">
                                            <img src={img.image_url} alt={img.original_filename || 'foto'} />
                                            <button
                                                className="egm-delete-img"
                                                onClick={() => handleDeleteImage(img.id)}
                                                disabled={deletingImage === img.id}
                                                title="Eliminar imagen"
                                            >
                                                {deletingImage === img.id
                                                    ? <FontAwesomeIcon icon={faSpinner} spin />
                                                    : <FontAwesomeIcon icon={faTrash} />
                                                }
                                            </button>
                                        </div>
                                    ))}
                                    {images.length === 0 && (
                                        <p className="egm-no-images">No hay imágenes en esta galería</p>
                                    )}
                                </div>
                                {images.length > visibleCount && (
                                    <button
                                        type="button"
                                        className="egm-load-more"
                                        onClick={() => setVisibleCount(prev => prev + PREVIEW_LOAD_MORE_COUNT)}
                                    >
                                        <FontAwesomeIcon icon={faChevronDown} />
                                        Cargar más ({images.length - visibleCount} restantes)
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditGalleryModal;
