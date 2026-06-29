const pool = require('../database/dbConnect');

class Gallery_images{

    static async createImage(gallery_id,original_name,storage_name,image_url,storage_path,is_primary,upload_order){
        const [result] = await pool.execute('INSERT into gallery_images(gallery_id,original_filename,storage_filename,image_url,file_path,is_primary,upload_order) VALUES(?,?,?,?,?,?,?)',[gallery_id, original_name,storage_name,image_url,storage_path,is_primary,upload_order])
        return result;
    }
    static async getAllImagesPathGallery(id){
        try{
            const [result] = await pool.execute(
                'SELECT id, image_url, file_path, original_filename, is_primary, upload_order FROM gallery_images WHERE gallery_id = ? ORDER BY upload_order ASC',
                [id]
            );
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
static async getByGalleryIdWithSelection(galleryId) {
    try {
        const [result] = await pool.execute(
            'SELECT id, image_url, original_filename, is_selected, upload_order FROM gallery_images WHERE gallery_id = ? ORDER BY upload_order',
            [galleryId]
        );
        return result;
    } catch(err) { console.log(err); throw err; }
}

static async hasConfirmedSelection(galleryId) {
    try {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM gallery_images WHERE gallery_id = ? AND is_selected = 1',
            [galleryId]
        );
        return rows[0].count > 0;
    } catch(err) { console.log(err); throw err; }
}

static async getSelectedByGallery(galleryId) {
    try {
        const [rows] = await pool.execute(
            'SELECT id, image_url, original_filename, upload_order FROM gallery_images WHERE gallery_id = ? AND is_selected = 1 ORDER BY upload_order',
            [galleryId]
        );
        return rows;
    } catch(err) { console.log(err); throw err; }
}

static async resetSelection(galleryId) {
    try {
        const [result] = await pool.execute(
            'UPDATE gallery_images SET is_selected = 0 WHERE gallery_id = ?',
            [galleryId]
        );
        return result.affectedRows;
    } catch(err) { console.log(err); throw err; }
}

static async deleteImage(imageId) {
    try {
        const [result] = await pool.execute('DELETE FROM gallery_images WHERE id = ?', [imageId]);
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error deleting gallery image:', err);
        throw err;
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