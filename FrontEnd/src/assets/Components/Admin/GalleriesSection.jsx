import React, { useState, useEffect } from 'react';

const GalleriesSection = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      const response = await fetch('http://localhost:3000/admin/galleries', {
        credentials: 'include'
      });
      const data = await response.json();
      setGalleries(data.galleries || []);
    } catch (error) {
      console.error('Error fetching galleries:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando galerías...</div>;

  return (
    <div className="galleries-section">
      <div className="section-header">
        <h2>Todas las Galerías</h2>
        <button className="btn-primary">➕ Nueva Galería</button>
      </div>

      <div className="table-container">
        <table className="galleries-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Servicio</th>
              <th>Fotos</th>
              <th>Fecha Creación</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {galleries.map(gallery => (
              <tr key={gallery.id}>
                <td>{gallery.client_name}</td>
                <td>{gallery.service_type}</td>
                <td>{gallery.photos_count}</td>
                <td>{new Date(gallery.created_at).toLocaleDateString()}</td>
                <td>
                  <span className={`status ${gallery.status}`}>
                    {gallery.status}
                  </span>
                </td>
                <td>
                  <button className="btn-sm">👀 Ver</button>
                  <button className="btn-sm">✏️ Editar</button>
                  <button className="btn-sm btn-danger">🗑️ Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GalleriesSection;