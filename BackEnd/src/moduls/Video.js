const pool = require('../database/dbConnect');

class Video {
    
    // Crear un nuevo video
    static async create(videoData) {
        try {
            console.log('-----ENTRO AL LA BASE DE DATOS')
            console.log(videoData)

            const {
                client_id, title, description, service_type, estimated_delivery, status, progress, video_url, file_name, original_filename, file_size, format, created_by} = videoData;

            const query = `
                INSERT INTO client_videos 
                (user_id, gallery_id, title, video_url, thumbnail_url, storage_path,
                 status, file_size, duration, resolution, format, download_count,
                 is_approved, version, sort_order, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            `;

            const [result] = await pool.execute(query, [
                user_id,
                gallery_id,
                title,
                video_url,
                thumbnail_url,
                storage_path,
                status,
                file_size,
                duration,
                resolution,
                format,
                download_count,
                is_approved,
                version,
                sort_order
            ]);

            return result;

        } catch (error) {
            console.error('Error creating video:', error);
            throw error;
        }
    }

  
}

module.exports = Video;