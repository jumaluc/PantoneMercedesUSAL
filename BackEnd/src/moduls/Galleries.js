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
    static async getAllGalleries(){
        try{

            const [result] = await pool.execute('SELECT * FROM galleries');
            return result;

        }
        catch(err){console.log(err)}
    }
    static async deleteGallery(id){
        try{
            const [result] = await pool.execute('DELETE FROM galleries WHERE id = ?',[id]);
            return result.affectedRows;
        }
        catch(err){console.log(err);}
    }

static async getByClientId(clientId) {
    try {
        const [result] = await pool.execute(
            'SELECT id, title, service_type, description, photos_count, created_at FROM galleries WHERE client_id = ? AND status = "active" ORDER BY created_at DESC',
            [clientId]
        );
        return result;
    } catch(err) {
        console.log(err);
        throw err;
    }
}
    // En Gallery.js
static async getGalleryById(galleryId) {
    try {
        const [rows] = await pool.execute('SELECT * FROM galleries WHERE id = ?', [galleryId]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error getting gallery by id:', error);
        throw error;
    }
}
static async getTotalGalleries() {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM galleries WHERE status = "active"');
        return rows[0].total;
    } catch (error) {
        console.error('Error getting total galleries:', error);
        throw error;
    }
}

static async getNewGalleriesCount(startDate, endDate) {
    try {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM galleries WHERE created_at BETWEEN ? AND ?',
            [startDate, endDate]
        );
        return rows[0].count;
    } catch (error) {
        console.error('Error getting new galleries count:', error);
        throw error;
    }
}

static async getGalleriesGrowth(days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const query = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as new_galleries
            FROM galleries 
            WHERE created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        
        const [growth] = await pool.execute(query, [startDate]);
        return growth;
    } catch (error) {
        console.error('Error getting galleries growth:', error);
        throw error;
    }
}

 static async getGalleryByServiceTypes(service) {
    try{
        const [result] = await pool.execute('SELECT * FROM galleries WHERE service_type = ?' ,[service])
        return result;
    }
    catch(err){console.log(err)}
 }

 static async getPublicGalleries(){
    try{

        const [galeries] = await pool.execute('SELECT * from galleries WHERE service_type = "public-xv" || service_type = "public-casamientos" || service_type = "public-bautizos"');
        return galeries;
    }
    catch(err){console.log(err)};
 }

static async updateStatus(galleryId, status) {
    try {
        const [result] = await pool.execute(
            'UPDATE galleries SET status = ? WHERE id = ?',
            [status, galleryId]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error updating gallery status:', err);
        throw err;
    }
}

static async update(galleryId, { title, description, status }) {
    try {
        const [result] = await pool.execute(
            'UPDATE galleries SET title = ?, description = ?, status = ? WHERE id = ?',
            [title, description, status, galleryId]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error updating gallery:', err);
        throw err;
    }
}

static async updatePhotosCount(galleryId, count) {
    try {
        const [result] = await pool.execute(
            'UPDATE galleries SET photos_count = ? WHERE id = ?',
            [count, galleryId]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error updating photos count:', err);
        throw err;
    }
}

static async updateCoverImage(galleryId, imageUrl) {
    try {
        const [result] = await pool.execute(
            'UPDATE galleries SET cover_image_url = ? WHERE id = ?',
            [imageUrl, galleryId]
        );
        return result.affectedRows > 0;
    } catch (err) {
        console.error('Error updating cover image:', err);
        throw err;
    }
}

}

module.exports = Gallery;