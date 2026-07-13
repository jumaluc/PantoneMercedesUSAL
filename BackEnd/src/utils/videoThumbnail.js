const { execFile } = require('child_process');
const { promisify } = require('util');
const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const execFileAsync = promisify(execFile);

// Extrae un frame del video (por defecto, el del segundo 1) usando el binario ffmpeg.
// Si el video dura menos de ese segundo, reintenta con el primer frame disponible.
async function extractVideoThumbnail(videoFile, atSecond = 1) {
    const tmpDir = os.tmpdir();
    const videoExt = path.extname(videoFile.originalname) || '.mp4';
    const videoPath = path.join(tmpDir, `${uuidv4()}${videoExt}`);
    const thumbPath = path.join(tmpDir, `${uuidv4()}.jpg`);

    try {
        await fs.writeFile(videoPath, videoFile.buffer);

        try {
            await execFileAsync('ffmpeg', [
                '-i', videoPath,
                '-ss', String(atSecond),
                '-vframes', '1',
                '-q:v', '2',
                '-y', thumbPath
            ]);
        } catch {
            // Video más corto que atSecond: usar el primer frame disponible
            await execFileAsync('ffmpeg', [
                '-i', videoPath,
                '-vframes', '1',
                '-q:v', '2',
                '-y', thumbPath
            ]);
        }

        return await fs.readFile(thumbPath);
    } finally {
        await fs.unlink(videoPath).catch(() => {});
        await fs.unlink(thumbPath).catch(() => {});
    }
}

module.exports = { extractVideoThumbnail };
