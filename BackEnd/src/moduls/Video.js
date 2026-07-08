const pool = require('../database/dbConnect');

class Video {
    
    static async create(videoData) {
        try {
            const {
                user_id, title, description, estimated_delivery, status, video_url, file_name, original_filename, file_size, format, thumbnail_url, created_by} = videoData;

            const query = `
                INSERT INTO client_videos
                (user_id, description, title, estimated_delivery, status, video_url,
                 file_name, original_filename, file_size, format, thumbnail_url, created_by)
                VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const [result] = await pool.execute(query, [
                user_id,
                description,
                title,
                estimated_delivery,
                status,
                video_url,
                file_name,
                original_filename,
                file_size,
                format,
                thumbnail_url,
                created_by
            ]);

            return result;

        } catch (error) {
            console.error('Error creating video:', error);
            throw error;
        }
    }
    static async getAllWithClients(){
        try{

            const [result] = await pool.execute('SELECT client_videos.*, users.first_name, users.last_name, users.email FROM client_videos INNER JOIN users ON client_videos.user_id = users.id');
            return result
        }
        catch(err){console.log(err)}
    }
    static async  updateStatus(videoId, status){
        try{
            const [result] = await pool.execute('UPDATE client_videos SET status = ? WHERE id = ?', [status, videoId])
            return result.affectedRows;
        }
        catch(err){console.log(err)}
    }
    static async deleteVideo(videoId){
        try{
            const [result] = await pool.execute('DELETE from client_videos WHERE id = ? ', [videoId])
            return result.affectedRows;
        }
        catch(err){console.log(err)}

    }
    static async getById(videoId){
        try{
            const [result] = await pool.execute('SELECT * FROM client_videos WHERE id = ? ', [videoId])
            return result;
        }
        catch(err){console.log(err)}
    }
    static async getMyVideos(userId){
        try{
            const [result] = await pool.execute('SELECT * FROM client_videos WHERE user_id = ? ', [userId])
            return result;
        }
        catch(err){console.log(err)}
    }

    static async update(videoId, { title, description, estimated_delivery }) {
        try {
            const [result] = await pool.execute(
                'UPDATE client_videos SET title = ?, description = ?, estimated_delivery = ? WHERE id = ?',
                [title, description, estimated_delivery, videoId]
            );
            return result.affectedRows > 0;
        } catch (err) {
            console.error('Error in Video.update:', err);
            throw err;
        }
    }

}

module.exports = Video;