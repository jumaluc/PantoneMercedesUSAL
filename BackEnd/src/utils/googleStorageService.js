const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid'); // ✅ Agregar esta importación

// Configuración
const KEY_FILENAME = "C:\\Users\\HP\\OneDrive\\Escritorio\\PantoneMercedesUSAL\\BackEnd\\src\\config\\google-credentials.json";
const PROJECT_ID = 'Pantone-web';
const BUCKET_NAME = 'pantone-almacen-imagenes'; // ✅ Usar constante consistente

async function checkCredentials() {
  try {
    await fs.access(KEY_FILENAME);
    console.log('✓ Credenciales de Google Cloud encontradas');
    return true;
  } catch (error) {
    console.error('✗ Error: Archivo de credenciales no encontrado en:', KEY_FILENAME);
    console.log('Por favor, descarga el JSON de credenciales desde Google Cloud Console');
    return false;
  }
}

// Inicializar Storage
const storage = new Storage({
  keyFilename: KEY_FILENAME,
  projectId: PROJECT_ID,
});

const bucket = storage.bucket(BUCKET_NAME);

// ✅ FUNCIÓN PARA VIDEOS - Simplificada y corregida
const uploadVideoToGCS = async (file, folder = 'videos', clientId = null) => {
  try {
    // Verificar credenciales primero
    const hasCredentials = await checkCredentials();
    if (!hasCredentials) {
      throw new Error('Credenciales de Google Cloud no configuradas');
    }

    // Generar nombre único para el archivo
    const fileExtension = path.extname(file.originalname);
    const fileName = clientId 
      ? `${folder}/client-${clientId}/${uuidv4()}${fileExtension}`
      : `${folder}/${uuidv4()}${fileExtension}`;
    
    // Subir usando el método save (más simple que streams)
    const blob = bucket.file(fileName);
    
    await blob.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        cacheControl: 'public, max-age=31536000',
        metadata: {
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
          clientId: clientId
        }
      }
    });

    console.log(`✓ Video subido: ${fileName}`);
    
    // Obtener URL pública (NO usar makePublic si el bucket ya es público)
    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
    
    return {
      url: publicUrl,
      fileName: fileName,
      bucket: BUCKET_NAME,
      size: file.size,
      contentType: file.mimetype,
      originalName: file.originalname
    };
    
  } catch (error) {
    console.error('✗ Error subiendo video a GCS:', error.message);
    throw new Error(`Error al subir video: ${error.message}`);
  }
};

// ✅ FUNCIÓN PARA THUMBNAILS
const uploadThumbnailToGCS = async (file, folder = 'thumbnails', clientId = null) => {
  try {
    const hasCredentials = await checkCredentials();
    if (!hasCredentials) {
      throw new Error('Credenciales de Google Cloud no configuradas');
    }

    const fileExtension = path.extname(file.originalname);
    const fileName = clientId 
      ? `${folder}/client-${clientId}/${uuidv4()}${fileExtension}`
      : `${folder}/${uuidv4()}${fileExtension}`;

    const blob = bucket.file(fileName);
    
    await blob.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        cacheControl: 'public, max-age=31536000',
        metadata: {
          originalName: file.originalname,
          uploadDate: new Date().toISOString(),
          clientId: clientId
        }
      }
    });

    console.log(`✓ Thumbnail subido: ${fileName}`);
    
    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${fileName}`;
    
    return {
      url: publicUrl,
      fileName: fileName,
      bucket: BUCKET_NAME,
      size: file.size,
      contentType: file.mimetype
    };
    
  } catch (error) {
    console.error('✗ Error subiendo thumbnail a GCS:', error.message);
    throw new Error(`Error al subir thumbnail: ${error.message}`);
  }
};

// ✅ FUNCIÓN PARA ELIMINAR ARCHIVOS
const deleteFileFromGCS = async (fileName) => {
  try {
    await bucket.file(fileName).delete();
    console.log(`✓ Archivo eliminado de GCS: ${fileName}`);
    return true;
  } catch (error) {
    console.error('✗ Error eliminando archivo de GCS:', error.message);
    return false;
  }
};

// ✅ Función original para imágenes (mantener si la necesitas)
async function uploadFile(fileBuffer, fileName, folderName, mimetype) {
  try {
    const hasCredentials = await checkCredentials();
    if (!hasCredentials) {
      throw new Error('Credenciales de Google Cloud no configuradas');
    }

    const destination = `${folderName}/${fileName}`;
    const file = bucket.file(destination);

    await file.save(fileBuffer, {
      metadata: {
        contentType: mimetype || 'application/octet-stream',
        cacheControl: 'public, max-age=31536000',
      }
    });

    console.log(`✓ Archivo subido: ${destination}`);

    const publicUrl = `https://storage.googleapis.com/${BUCKET_NAME}/${destination}`;

    return {
      success: true,
      url: publicUrl,
      path: destination,
      fileName,
      folder: folderName
    };

  } catch (error) {
    console.error('✗ Error subiendo archivo:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// ✅ Mantener las otras funciones existentes
async function getFileUrls(clientId, clientName) {
  try {
    const safeClientName = clientName.replace(/[^a-zA-Z0-9]/g, '-');
    const folderName = `${clientId}-${safeClientName}`;
    const prefix = `${folderName}/`;

    const [files] = await bucket.getFiles({ prefix });

    const urls = files.map(file => ({
      name: file.name.replace(prefix, ''),
      url: `https://storage.googleapis.com/${BUCKET_NAME}/${file.name}`,
      createdAt: file.metadata.timeCreated
    }));

    return urls;

  } catch (error) {
    console.error('Error obteniendo URLs:', error);
    return [];
  }
}

async function downloadFile(filePath, res) {
  try {
    const file = bucket.file(filePath);
    const [exists] = await file.exists();

    if (!exists) {
      return { success: false, error: 'Archivo no encontrado' };
    }

    const fileStream = file.createReadStream();
    return { success: true, stream: fileStream };

  } catch (error) {
    console.error('Error descargando archivo:', error);
    return { success: false, error: error.message };
  }
}

async function getFileInfo(filePath) {
  try {
    const file = bucket.file(filePath);
    const [metadata] = await file.getMetadata();
    
    return {
      success: true,
      metadata: metadata,
      size: metadata.size,
      contentType: metadata.contentType,
      lastModified: metadata.updated
    };
  } catch (error) {
    console.error('Error obteniendo información del archivo:', error);
    return { success: false, error: error.message };
  }
}

function getContentType(extension) {
  const types = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    zip: 'application/zip',
    mp4: 'video/mp4',
    avi: 'video/avi',
    mov: 'video/quicktime',
    wmv: 'video/x-ms-wmv'
  };
  return types[extension.toLowerCase()] || 'application/octet-stream';
}

// Verificar credenciales al iniciar
checkCredentials().then(hasCredentials => {
  if (hasCredentials) {
    console.log('✓ Google Cloud Storage configurado correctamente');
  } else {
    console.log('✗ Google Cloud Storage no está configurado');
  }
});

module.exports = {
  storage,
  bucket,
  uploadFile,
  getFileUrls,
  downloadFile,
  getFileInfo,
  deleteFile: deleteFileFromGCS, // ✅ Usar la función corregida
  checkCredentials,
  getContentType,
  uploadVideoToGCS, // ✅ Exportar la función corregida
  uploadThumbnailToGCS // ✅ Exportar función de thumbnails
};