const pool = require('../database/dbConnect');

class SongSelection {
    static async save(galleryId, userId, songs = [], letAdminChoose = false, notes = null) {
        const [song1 = null, song2 = null, song3 = null] = songs;
        const [result] = await pool.execute(
            `INSERT INTO song_selections (gallery_id, user_id, song_1, song_2, song_3, let_admin_choose, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
               song_1 = VALUES(song_1), song_2 = VALUES(song_2), song_3 = VALUES(song_3),
               let_admin_choose = VALUES(let_admin_choose), notes = VALUES(notes),
               updated_at = CURRENT_TIMESTAMP`,
            [galleryId, userId, song1 || null, song2 || null, song3 || null, letAdminChoose ? 1 : 0, notes || null]
        );
        return result.affectedRows;
    }

    static async getByGalleryAndUser(galleryId, userId) {
        const [result] = await pool.execute(
            'SELECT * FROM song_selections WHERE gallery_id = ? AND user_id = ?',
            [galleryId, userId]
        );
        return result[0] || null;
    }

    static async getAllForAdmin() {
        const [result] = await pool.execute(
            `SELECT ss.*, g.title AS gallery_title, g.service_type,
                    u.first_name, u.last_name, u.email
             FROM song_selections ss
             INNER JOIN galleries g ON ss.gallery_id = g.id
             INNER JOIN users u ON ss.user_id = u.id
             ORDER BY ss.created_at DESC`
        );
        return result;
    }

    static async deleteByGallery(galleryId) {
        const [result] = await pool.execute(
            'DELETE FROM song_selections WHERE gallery_id = ?',
            [galleryId]
        );
        return result.affectedRows;
    }
}

module.exports = SongSelection;
