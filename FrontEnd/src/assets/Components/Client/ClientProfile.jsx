import React, { useState } from 'react';
import { toast } from "react-toastify";

const ClientProfile = ({ user }) => {
  const [profileData, setProfileData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    number: user.number || '',
    service: user.service || ''
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch("http://localhost:3000/user/editProfile", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        toast.success('Perfil actualizado correctamente');
        setIsEditing(false);
      } else {
        throw new Error('Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  const serviceOptions = [
    'XV',
    'Casamiento', 
    'Book',
    'Bautismo',
    'Evento Corporativo',
    'Otros'
  ];

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Mi Perfil</h2>
        {!isEditing && (
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(true)}
          >
            Editar Perfil
          </button>
        )}
      </div>
      
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="profile-form-group">
            <label>Nombre</label>
            <input
              type="text"
              name="first_name"
              value={profileData.first_name}
              onChange={handleChange}
              className="profile-form-input"
              disabled={!isEditing}
            />
          </div>

          <div className="profile-form-group">
            <label>Apellido</label>
            <input
              type="text"
              name="last_name"
              value={profileData.last_name}
              onChange={handleChange}
              className="profile-form-input"
              disabled={!isEditing}
            />
          </div>
        </div>

        <div className="profile-form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            className="profile-form-input"
            disabled={!isEditing}
          />
        </div>

        <div className="profile-form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            name="number"
            value={profileData.number}
            onChange={handleChange}
            className="profile-form-input"
            disabled={!isEditing}
            placeholder="Ingresa tu teléfono"
          />
        </div>

        <div className="profile-form-group">
          <label>Tipo de servicio</label>
          <select
            name="service"
            value={profileData.service}
            onChange={handleChange}
            className="profile-form-input"
            disabled={!isEditing}
          >
            <option value="">Selecciona un servicio</option>
            {serviceOptions.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>
        </div>

        {isEditing && (
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => {
                setIsEditing(false);
                setProfileData({
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email,
                  number: user.number || '',
                  service: user.service || ''
                });
              }}
            >
              Cancelar
            </button>
            <button type="submit" className="save-btn">
              Guardar Cambios
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ClientProfile;