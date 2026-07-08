const multer = require('multer');

// Configurar multer para usar memoria (no guardar en disco)
const memoryStorage = multer.memoryStorage();

// Filtro para validar tipos de video y miniatura
const allowedVideoMimeTypes = [
  'video/mp4',
  'video/avi',
  'video/mov',
  'video/wmv',
  'video/mkv',
  'video/flv',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo'
];

const allowedThumbnailMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnail') {
    if (allowedThumbnailMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de imagen no permitido para la miniatura. Formatos aceptados: JPEG, PNG'), false);
    }
    return;
  }

  if (allowedVideoMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido. Formatos aceptados: MP4, AVI, MOV, WMV, MKV, FLV, WEBM`), false);
  }
};

// Configurar multer
const uploadVideo = multer({
  storage: memoryStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB máximo
    files: 2
  }
});

// Middleware para manejar errores de multer
const handleUploadErrors = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 500MB permitido.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Demasiados archivos. Solo se permite un video por upload.'
      });
    }
  } else if (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  next();
};

module.exports = {
  uploadVideo: uploadVideo.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  handleUploadErrors
};