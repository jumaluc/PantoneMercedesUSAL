const pool = require('../database/dbConnect');


class Client_videos {

    static async getAllVideosById(userId){
        try{
            const [result] = await pool.execute('SELECT id, title, video_url, thumbnail_url, storage_path, status, file_size, duration, resolution, format FROM client_videos WHERE user_id = ?',[userId]);
            return result;
        }
        catch(err){console.log(err)}
    };
}

module.exports = Client_videos;