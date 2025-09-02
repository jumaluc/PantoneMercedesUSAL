const pool = require('../database/dbConnect');

class Gallery_images{

    static async createImage(gallery_id,original_name,storage_name,image_url,storage_path,is_primary,upload_order){
        const [result] = await pool.execute('INSERT into gallery_images(gallery_id,original_filename,storage_filename,image_url,file_path,is_primary,upload_order) VALUES(?,?,?,?,?,?,?)',[gallery_id, original_name,storage_name,image_url,storage_path,is_primary,upload_order])
        return result;
    }
    static async getAllImagesPathGallery(id){
        try{
            const [result] = await pool.execute('SELECT file_path from gallery_images WHERE gallery_id = ?',[id]);
            return result;
        }
        catch(err){console.log(err)}
    };
}


module.exports = Gallery_images