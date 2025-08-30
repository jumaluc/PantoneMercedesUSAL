// CreateClientModal.jsx
import React, { useState } from 'react';
import './CreateClientModal.css';
import { toast } from "react-toastify";

const CreateClientModal = ({ isOpen, onClose, onClientCreated }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    number: '',
    service: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const serviceTypes = [
    'Fotografía de Bodas',
    'Fotografía de Retrato',
    'Fotografía de Producto',
    'Fotografía de Eventos',
    'Fotografía de Moda',
    'Fotografía Arquitectónica',
    'Video Corporativo',
    'Video Musical',
    'Video de Eventos'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) newErrors.first_name = 'El nombre es obligatorio';
    if (!formData.last_name.trim()) newErrors.last_name = 'El apellido es obligatorio';
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    if (!formData.number.trim()) newErrors.number = 'El teléfono es obligatorio';
    if (!formData.service) newErrors.service = 'Selecciona un tipo de servicio';
    
    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma la contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/admin/createClient', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          number: formData.number,
          service: formData.service,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Cliente creado correctamente');
        onClientCreated(); 
        handleClose();
      } else {
        toast.error('Error al crear el cliente');
      }
    } catch (error) {
      console.error('Error:', error);
        toast.error('Error al crear el cliente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      number: '',
      service: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Crear Nuevo Cliente</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="client-form">
          <div className="form-row-client-modal">
            <div className="form-group-client-modal">
              <label>Nombre *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                className={errors.first_name ? 'error' : ''}
                placeholder="Ingresa el nombre"
              />
              {errors.first_name && <span className="error-text">{errors.first_name}</span>}
            </div>

            <div className="form-group-client-modal">
              <label>Apellido *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                className={errors.last_name ? 'error' : ''}
                placeholder="Ingresa el apellido"
              />
              {errors.last_name && <span className="error-text">{errors.last_name}</span>}
            </div>
          </div>

          <div className="form-group-client-modal">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={errors.email ? 'error' : ''}
              placeholder="ejemplo@email.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group-client-modal">
            <label>Teléfono *</label>
            <input
              type="tel"
              name="number"
              value={formData.number}
              onChange={handleInputChange}
              className={errors.number ? 'error' : ''}
              placeholder="+54 123 456 789"
            />
            {errors.number && <span className="error-text">{errors.number}</span>}
          </div>

          <div className="form-group-client-modal">
            <label>Tipo de Servicio *</label>
            <select
              name="service"
              value={formData.service}
              onChange={handleInputChange}
              className={errors.service ? 'error' : ''}
            >
              <option value="">Selecciona un servicio</option>
              {serviceTypes.map((service, index) => (
                <option key={index} value={service}>{service}</option>
              ))}
            </select>
            {errors.service && <span className="error-text">{errors.service}</span>}
          </div>

          <div className="form-row-client-modal">
            <div className="form-group-client-modal">
              <label>Contraseña *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Mínimo 6 caracteres"
              />
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-group-client-modal">
              <label>Confirmar Contraseña *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Repite la contraseña"
              />
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-create" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClientModal;