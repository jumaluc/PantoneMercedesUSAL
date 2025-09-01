const pool = require('../database/dbConnect');


class Gallery {

    static async newGallery(id, title,service,description,status, photos_count,cover_image, folder_path,created_by){
        try{
            const [result] = await pool.execute('INSERT into galleries(client_id,title,service_type,description,status,photos_count,cover_image_url,folder_path,created_by) VALUES(?,?,?,?,?,?,?,?,?)', [id, title, service, description, status, photos_count, cover_image, folder_path, created_by]);
            return result;
        }
        catch(err){console.log(err)}

    }
    static async uploadedImages(){

    }
}

module.exports = Gallery;