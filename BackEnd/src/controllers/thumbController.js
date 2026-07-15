const sharp = require('sharp');

const BUCKET_NAME = process.env.BUCKETNAME || 'pantone-almacen-imagenes';
const ALLOWED_PREFIX = `https://storage.googleapis.com/${BUCKET_NAME}/`;
const MAX_WIDTH = 800;
const DEFAULT_WIDTH = 400;

// Cache en memoria (no persiste nada en disco ni en GCS, solo evita
// reprocesar la misma miniatura mientras el proceso siga vivo)
const cache = new Map();
const MAX_CACHE_ENTRIES = 300;

function cacheSet(key, value) {
    if (cache.size >= MAX_CACHE_ENTRIES) {
        cache.delete(cache.keys().next().value);
    }
    cache.set(key, value);
}

const thumbController = {
    getThumbnail: async (req, res) => {
        try {
            const { url, w } = req.query;
            if (!url || !url.startsWith(ALLOWED_PREFIX)) {
                return res.status(400).json({ message: 'URL inválida' });
            }

            const width = Math.min(parseInt(w, 10) || DEFAULT_WIDTH, MAX_WIDTH);
            const cacheKey = `${url}|${width}`;

            const cached = cache.get(cacheKey);
            if (cached) {
                res.set('Content-Type', cached.contentType);
                res.set('Cache-Control', 'public, max-age=31536000, immutable');
                return res.send(cached.buffer);
            }

            const originalResponse = await fetch(url);
            if (!originalResponse.ok) {
                return res.status(502).json({ message: 'No se pudo obtener la imagen original' });
            }
            const originalBuffer = Buffer.from(await originalResponse.arrayBuffer());

            const resizedBuffer = await sharp(originalBuffer)
                .rotate() // respeta la orientación EXIF
                .resize({ width, withoutEnlargement: true })
                .jpeg({ quality: 78 })
                .toBuffer();

            cacheSet(cacheKey, { buffer: resizedBuffer, contentType: 'image/jpeg' });

            res.set('Content-Type', 'image/jpeg');
            res.set('Cache-Control', 'public, max-age=31536000, immutable');
            res.send(resizedBuffer);
        } catch (error) {
            console.error('Error generando thumbnail:', error);
            res.status(500).json({ message: 'Error generando la miniatura' });
        }
    }
};

module.exports = thumbController;
