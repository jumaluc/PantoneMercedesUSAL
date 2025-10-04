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
        static async getByGalleryId(galleryId) {
            try {
                const [result] = await pool.execute(
                    'SELECT id, image_url, original_filename FROM gallery_images WHERE gallery_id = ?', 
                    [galleryId]
                );
                return result;
            } catch(err) {
                console.log(err);
                throw err;
            }
        }
    static async updateSelectionStatus(imageIds, isSelected){
    try {
        const placeholders = imageIds.map(() => '?').join(',');
        const query = `UPDATE gallery_images SET is_selected = ? WHERE id IN (${placeholders})`;
        
        const [result] = await pool.execute(query, [isSelected, ...imageIds]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error updating selection status:', error);
        throw error;
    }
}
static async getTotalImages() {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM gallery_images');
        return rows[0].total;
    } catch (error) {
        console.error('Error getting total images:', error);
        throw error;
    }
}

static async getNewImagesCount(startDate, endDate) {
    try {
        const [rows] = await pool.execute(
            `SELECT COUNT(*) as count FROM gallery_images gi 
             JOIN galleries g ON gi.gallery_id = g.id 
             WHERE gi.created_at BETWEEN ? AND ?`,
            [startDate, endDate]
        );
        return rows[0].count;
    } catch (error) {
        console.error('Error getting new images count:', error);
        throw error;
    }
}
}


module.exports = Gallery_images