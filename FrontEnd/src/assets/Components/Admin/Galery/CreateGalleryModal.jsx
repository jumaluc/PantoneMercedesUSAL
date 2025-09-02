import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faUpload, faTrash } from '@fortawesome/free-solid-svg-icons';
import { toast } from "react-toastify";

const CreateGalleryModal = ({ isOpen, onClose, onGalleryCreated, clients }) => {
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    service: '',
    description: '',
    status: 'active'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);

  const serviceTypes = [
    'Fotografía de Bodas',
    'Fotografía de Retrato',
    'Fotografía de Producto',
    'Fotografía de Eventos',
    'Fotografía de Moda',
    'Fotografía Arquitectónica'
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
  };

  const handleMainFileChange = (e) => {
    const file = e.target.files[0];
    setMainImage(file || null);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => {
    setMainImage(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.id) newErrors.id = 'Selecciona un cliente';
    if (!formData.title.trim()) newErrors.title = 'El título es obligatorio';
    if (!formData.service) newErrors.service = 'Selecciona un tipo de servicio';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
    if (mainImage) {
      formDataToSend.append("images", mainImage); // ← Mismo campo
    }
    
    // Agregar el resto de imágenes
    images.forEach((img) => {
      formDataToSend.append("images", img); // ← Mismo campo
    });
      const response = await fetch('http://localhost:3000/admin/createGallery', {
        method: 'POST',
        credentials: 'include',
        body: formDataToSend
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Galeria creada exitosamente!');
        //onGalleryCreated();
        handleClose();
      } else {
        toast.error('Error al crear la galeria')
      }
    } catch (error) {
      console.error('Error:', error);
        toast.error('Error al crear la galeria')
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      id: '',
      title: '',
      service: '',
      description: '',
      status: 'active'
    });
    setImages([]);
    setMainImage(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-create-client">
      <div className="modal-content-create-client">
        <div className="modal-header-create-client">
          <h2>Crear Nueva Galería</h2>
          <button className="close-btn" onClick={handleClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="client-form">
          {/* Cliente */}
          <div className="form-group-client-modal">
            <label>Cliente *</label>
            <select
              name="id"
              value={formData.id}
              onChange={handleInputChange}
              className={errors.id ? 'error' : ''}
            >
              <option value="">Selecciona un cliente</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name} - {client.email}
                </option>
              ))}
            </select>
            {errors.id && <span className="error-text">{errors.id}</span>}
          </div>

          {/* Título */}
          <div className="form-group-client-modal">
            <label>Título de la Galería *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={errors.title ? 'error' : ''}
              placeholder="Ej: Sesión de fotos de bodas"
            />
            {errors.title && <span className="error-text">{errors.title}</span>}
          </div>

          {/* Tipo de servicio */}
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

          {/* Descripción */}
          <div className="form-group-client-modal">
            <label>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descripción opcional de la galería..."
              rows="3"
            />
          </div>

          {/* Imágenes */}
          <div className="form-group-client-modal">
            <label>Selecciona las fotografías</label>
            <div className="file-upload">
              <label htmlFor="images" className="file-upload-label">
                <FontAwesomeIcon icon={faUpload} /> Subir imágenes
              </label>
              <input
                id="images"
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="image-preview">
              {images.map((img, index) => (
                <div key={index} className="image-item">
                  <img src={URL.createObjectURL(img)} alt="preview" />
                  <button type="button" className="remove-btn" onClick={() => removeImage(index)}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Fotografía principal */}
          <div className="form-group-client-modal">
            <label>Selecciona fotografía principal</label>
            <div className="file-upload">
              <label htmlFor="mainImage" className="file-upload-label">
                <FontAwesomeIcon icon={faUpload} /> Subir imagen principal
              </label>
              <input
                id="mainImage"
                type="file"
                accept="image/*"
                onChange={handleMainFileChange}
                style={{ display: 'none' }}
              />
            </div>
            <div className="image-preview">
              {mainImage && (
                <div className="image-item">
                  <img src={URL.createObjectURL(mainImage)} alt="preview" />
                  <button type="button" className="remove-btn" onClick={removeMainImage}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Estado */}
          <div className="form-group-client-modal">
            <label>Estado</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">Activa</option>
              <option value="inactive">Inactiva</option>
              <option value="draft">Borrador</option>
            </select>
          </div>

          {/* Botones */}
          <div className="form-actions">
            <button type="button" onClick={handleClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-create" disabled={isLoading}>
              {isLoading ? 'Creando...' : 'Crear Galería'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGalleryModal;
