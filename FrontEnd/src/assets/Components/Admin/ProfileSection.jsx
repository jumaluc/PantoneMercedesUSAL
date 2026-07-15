import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faSave, faPen, faXmark } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import './ProfileSection.css';
import { API_URL } from '../../../config/api';

const ProfileSection = ({ adminData, onUpdated }) => {
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        id: '', first_name: '', last_name: '', email: '', number: '', service: ''
    });

    useEffect(() => {
        if (adminData) {
            setForm({
                id:         adminData.id         || '',
                first_name: adminData.first_name || '',
                last_name:  adminData.last_name  || '',
                email:      adminData.email      || '',
                number:     adminData.number     || '',
                service:    adminData.service    || '',
            });
        }
    }, [adminData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        if (adminData) {
            setForm({
                id: adminData.id || '', first_name: adminData.first_name || '',
                last_name: adminData.last_name || '', email: adminData.email || '',
                number: adminData.number || '', service: adminData.service || '',
            });
        }
        setEditing(false);
    };

    const handleSave = async () => {
        if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
            toast.error('Nombre, apellido y email son obligatorios');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/user/editProfile`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Perfil actualizado correctamente');
                setEditing(false);
                onUpdated?.(data.data || form);
            } else {
                toast.error(data.message || 'Error al actualizar perfil');
            }
        } catch {
            toast.error('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    if (!adminData) {
        return (
            <div className="profile-section__loading">
                <div className="profile-section__spinner" />
                <p>Cargando perfil...</p>
            </div>
        );
    }

    const initials = `${form.first_name?.[0] || ''}${form.last_name?.[0] || ''}`.toUpperCase();

    return (
        <div className="profile-section">
            <div className="profile-section__header">
                <div className="profile-section__title">
                    <FontAwesomeIcon icon={faUser} />
                    <h2>Mi Perfil</h2>
                </div>
                {!editing && (
                    <button className="profile-section__edit-btn" onClick={() => setEditing(true)}>
                        <FontAwesomeIcon icon={faPen} /> Editar
                    </button>
                )}
            </div>

            <div className="profile-section__card">
                <div className="profile-section__avatar-wrap">
                    <div className="profile-section__avatar">{initials}</div>
                    <div className="profile-section__role-badge">Administrador</div>
                </div>

                <div className="profile-section__fields">
                    <div className="profile-section__row">
                        <div className="profile-section__field">
                            <label>Nombre</label>
                            {editing
                                ? <input name="first_name" value={form.first_name} onChange={handleChange} className="profile-section__input" placeholder="Nombre" />
                                : <span>{form.first_name || '—'}</span>
                            }
                        </div>
                        <div className="profile-section__field">
                            <label>Apellido</label>
                            {editing
                                ? <input name="last_name" value={form.last_name} onChange={handleChange} className="profile-section__input" placeholder="Apellido" />
                                : <span>{form.last_name || '—'}</span>
                            }
                        </div>
                    </div>

                    <div className="profile-section__field profile-section__field--full">
                        <label>Email</label>
                        {editing
                            ? <input name="email" type="email" value={form.email} onChange={handleChange} className="profile-section__input" placeholder="email@ejemplo.com" />
                            : <span>{form.email || '—'}</span>
                        }
                    </div>

                    <div className="profile-section__row">
                        <div className="profile-section__field">
                            <label>Teléfono</label>
                            {editing
                                ? <input name="number" value={form.number} onChange={handleChange} className="profile-section__input" placeholder="+54 9 11 ..." />
                                : <span>{form.number || '—'}</span>
                            }
                        </div>
                        <div className="profile-section__field">
                            <label>Servicio</label>
                            {editing
                                ? <input name="service" value={form.service} onChange={handleChange} className="profile-section__input" placeholder="Servicio" />
                                : <span>{form.service || '—'}</span>
                            }
                        </div>
                    </div>
                </div>

                {editing && (
                    <div className="profile-section__actions">
                        <button className="profile-section__cancel-btn" onClick={handleCancel} disabled={saving}>
                            <FontAwesomeIcon icon={faXmark} /> Cancelar
                        </button>
                        <button className="profile-section__save-btn" onClick={handleSave} disabled={saving}>
                            <FontAwesomeIcon icon={faSave} />
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSection;
