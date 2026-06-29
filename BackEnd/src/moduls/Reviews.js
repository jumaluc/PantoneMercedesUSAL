const pool = require('../database/dbConnect');

class Reviews {
    static async submitReview(userId, rating, message) {
        const [result] = await pool.execute(
            `INSERT INTO reviews (user_id, rating, message)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE rating = VALUES(rating), message = VALUES(message), updated_at = CURRENT_TIMESTAMP`,
            [userId, rating, message]
        );
        return result.affectedRows;
    }

    static async getMyReview(userId) {
        const [result] = await pool.execute(
            'SELECT * FROM reviews WHERE user_id = ?',
            [userId]
        );
        return result[0] || null;
    }

    static async getAllReviews(currentUserId = null) {
        const [result] = await pool.execute(
            `SELECT r.id, r.rating, r.message, r.created_at, r.updated_at,
                    u.first_name, u.last_name, u.service,
                    COUNT(rl.id) AS likes_count,
                    MAX(CASE WHEN rl.user_id = ? THEN 1 ELSE 0 END) AS user_has_liked
             FROM reviews r
             JOIN users u ON u.id = r.user_id
             LEFT JOIN review_likes rl ON rl.review_id = r.id
             GROUP BY r.id, r.rating, r.message, r.created_at, r.updated_at,
                      u.first_name, u.last_name, u.service
             ORDER BY r.created_at DESC`,
            [currentUserId || 0]
        );
        return result;
    }

    static async toggleLike(userId, reviewId) {
        const [existing] = await pool.execute(
            'SELECT id FROM review_likes WHERE user_id = ? AND review_id = ?',
            [userId, reviewId]
        );
        if (existing.length > 0) {
            await pool.execute('DELETE FROM review_likes WHERE user_id = ? AND review_id = ?', [userId, reviewId]);
            return 'unliked';
        } else {
            await pool.execute('INSERT INTO review_likes (user_id, review_id) VALUES (?, ?)', [userId, reviewId]);
            return 'liked';
        }
    }

    static async deleteReview(id) {
        const [result] = await pool.execute('DELETE FROM reviews WHERE id = ?', [id]);
        return result.affectedRows;
    }
}

module.exports = Reviews;
