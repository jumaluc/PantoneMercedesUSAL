// config/multer.js
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Validar tipos de archivo
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes'), false);
  }
};

const uploadGaleria = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB límite por archivo
    files: 50 // Máximo 50 archivos por galería
  }
}).array('images', 50); // 'images' es el nombre del campo

// Middleware para manejar errores de multer y devolver un JSON legible
// en lugar de que Express tire el stack trace crudo con un 500.
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Una de las imágenes es demasiado grande. Máximo 50MB por imagen.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT' || error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Demasiadas imágenes en un mismo envío. Máximo 50 por galería.'
      });
    }
    return res.status(400).json({ success: false, message: error.message });
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message || 'Error al subir las imágenes'
    });
  }
  next();
};

module.exports = uploadGaleria;
module.exports.handleUploadErrors = handleUploadErrors;