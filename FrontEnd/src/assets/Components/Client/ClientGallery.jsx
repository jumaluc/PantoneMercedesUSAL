import React from 'react';

const Gallery = ({ user }) => {

  const galleryPhotos = [
    { id: 1, src: '/photo1.jpg', selected: false },
    { id: 2, src: '/photo2.jpg', selected: true },
    { id: 3, src: '/photo3.jpg', selected: false },
    { id: 4, src: '/photo4.jpg', selected: true },
    { id: 5, src: '/photo5.jpg', selected: false },
    { id: 6, src: '/photo6.jpg', selected: true }
  ];

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Mi Galería - {user.service}</h2>
        <p>Selecciona tus fotos favoritas para tu álbum</p>
      </div>

      {/* <div className="gallery-grid">
        {galleryPhotos.map(photo => (
          <div key={photo.id} className={`gallery-item ${photo.selected ? 'selected' : ''}`}>
            <img src={photo.src} alt={`Foto ${photo.id}`} />
            <div className="photo-actions">
              <button className="select-btn">
                {photo.selected ? 'Seleccionada' : 'Seleccionar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="gallery-actions">
        <button className="primary-btn">
         Descargar Seleccionadas
        </button>
        <button className="secondary-btn">
          Solicitar Ediciones
        </button>
      </div> */}
    </div>
  );
};

export default Gallery;