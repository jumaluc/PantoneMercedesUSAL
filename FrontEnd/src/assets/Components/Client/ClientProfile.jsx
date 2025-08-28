import React, { useState } from 'react';
import { toast } from "react-toastify";

const ClientProfile = ({ user }) => {
  const [profileData, setProfileData] = useState({
    id: user.id,
    name: user.nombre,
    email: user.email,
    telefono: user.telefono,
    service: user.service
  });
  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //EDITAR CAMBIOS 

    fetch("http://localhost:3000/user/editProfile",{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
    }).then(async (response) =>{
        const data = await response.json();
        toast.success('Perfil actualizado correctamente');
        console.log("Perfil actualizado correctamente")
    }
    
    )

  };

  return (
    <div className="profile-container">
      <h2>Mi Perfil</h2>
      
      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-form-group">
          <label>Nombre </label>
          <input
            type="text"
            name="name"
            value={user.first_name}
            onChange={handleChange}
            className="profile-form-input"
          />
        </div>
        <div className="profile-form-group">
          <label>Apellido </label>
          <input
            type="text"
            name="last_name"
            value={user.last_name}
            onChange={handleChange}
            className="profile-form-input"
          />
        </div>

        <div className="profile-form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="profile-form-input"
          />
        </div>

        <div className="profile-form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={user.number}
            onChange={handleChange}
            className="profile-form-input"
          />
        </div>

        <div className="profile-form-group">
          <label>Tipo de servicio</label>
          <select
            name="service"
            value={user.service}
            onChange={handleChange}
            className="profile-form-input"
          >
            <option value="fotografia">XV</option>
            <option value="video">Casamiento</option>
            <option value="retrato">Book</option>
            <option value="eventos">Bautismo</option>
            <option value="producto">Evento Corporativo</option>
            <option value="dron">Otros</option>
          </select>
        </div>

        <button type="submit" className="save-btn">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
};

export default ClientProfile;