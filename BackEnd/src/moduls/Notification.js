const pool = require('../database/dbConnect');

class Notification {

    static async create(userId, type, title, message = null) {
        try {
            const [result] = await pool.execute(
                'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
                [userId, type, title, message]
            );
            return result.insertId;
        } catch (err) { console.error('Notification.create error:', err); }
    }

    static async createForAllAdmins(type, title, message = null) {
        try {
            const [admins] = await pool.execute('SELECT id FROM users WHERE role = "admin"');
            for (const admin of admins) {
                await pool.execute(
                    'INSERT INTO notifications (user_id, type, title, message) VALUES (?, ?, ?, ?)',
                    [admin.id, type, title, message]
                );
            }
        } catch (err) { console.error('Notification.createForAllAdmins error:', err); }
    }

    static async getByUser(userId, limit = 40) {
        try {
            const [rows] = await pool.execute(
                'SELECT id, type, title, message, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
                [userId, limit]
            );
            return rows;
        } catch (err) { console.error('Notification.getByUser error:', err); return []; }
    }

    static async getUnreadCount(userId) {
        try {
            const [rows] = await pool.execute(
                'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
                [userId]
            );
            return rows[0].count;
        } catch (err) { console.error('Notification.getUnreadCount error:', err); return 0; }
    }

    static async markRead(notifId, userId) {
        try {
            const [result] = await pool.execute(
                'UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?',
                [notifId, userId]
            );
            return result.affectedRows;
        } catch (err) { console.error('Notification.markRead error:', err); }
    }

    static async markAllRead(userId) {
        try {
            const [result] = await pool.execute(
                'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
                [userId]
            );
            return result.affectedRows;
        } catch (err) { console.error('Notification.markAllRead error:', err); }
    }
}

module.exports = Notification;
