const { Storage } = require('@google-cloud/storage');
const path = require('path');
const fs = require('fs').promises;
console.log("HOLA")
// Configuración
const KEY_FILENAME =  "C:\\Users\\grete\\Desktop\\PantoneMercedes\\BackEnd\\src\\config\\google-credentials.json"
const PROJECT_ID =  'Pantone-web';
const BUCKET_NAME = 'pantone-almacen-imagenes';


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
checkCredentials();
// Inicializar Storage
const storage = new Storage({
  keyFilename: KEY_FILENAME,
  projectId: PROJECT_ID,
});

const bucket = storage.bucket(BUCKET_NAME);

// Función para subir archivo
async function uploadFile(fileBuffer, fileName, folderName, mimetype) {
  try {
    const hasCredentials = await checkCredentials();
    if (!hasCredentials) {
      throw new Error('Credenciales de Google Cloud no configuradas');
    }

    const destination = `${folderName}/${fileName}`;
    const file = bucket.file(destination);

    // Subir el buffer sin intentar ACL
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



// Función para obtener múltiples URLs
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

// Helper para content type
function getContentType(extension) {
  const types = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    svg: 'image/svg+xml'
  };
  return types[extension.toLowerCase()] || 'application/octet-stream';
}

// Función para eliminar archivo
async function deleteFile(filePath) {
  try {
    await bucket.file(filePath).delete();
    console.log(`✓ Archivo eliminado: ${filePath}`);
    return true;
  } catch (error) {
    console.error('✗ Error eliminando archivo:', error.message);
    return false;
  }
}

module.exports = {
  storage,
  bucket,
  uploadFile,
  getFileUrls,
  deleteFile,
  checkCredentials
};