const pool = require('../database/dbConnect');

class AdminLog {
    static async createLog(logData) {
        try {
            const {
                admin_id,
                admin_name,
                action_type,
                action_description,
                resource_type = null,
                resource_id = null,
                resource_name = null,
                ip_address = null,
                user_agent = null,
                old_values = null,
                new_values = null,
                additional_data = null
            } = logData;

            const query = `
                INSERT INTO admin_activity_logs 
                (admin_id, admin_name, action_type, action_description, resource_type, 
                 resource_id, resource_name, ip_address, user_agent, old_values, 
                 new_values, additional_data) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const [result] = await pool.execute(query, [
                admin_id, admin_name, action_type, action_description, resource_type,
                resource_id, resource_name, ip_address, user_agent,
                old_values ? JSON.stringify(old_values) : null,
                new_values ? JSON.stringify(new_values) : null,
                additional_data ? JSON.stringify(additional_data) : null
            ]);
            
            return result.insertId;
        } catch (error) {
            console.error('Error creating admin log:', error);
            throw error;
        }
    }

    static async getLogs(filters = {}) {
        try {
            let query = `
                SELECT * FROM admin_activity_logs 
                WHERE 1=1
            `;
            const params = [];

            if (filters.admin_id) {
                query += ' AND admin_id = ?';
                params.push(filters.admin_id);
            }

            if (filters.action_type) {
                query += ' AND action_type = ?';
                params.push(filters.action_type);
            }

            if (filters.resource_type) {
                query += ' AND resource_type = ?';
                params.push(filters.resource_type);
            }

            if (filters.start_date) {
                query += ' AND created_at >= ?';
                params.push(filters.start_date);
            }

            if (filters.end_date) {
                query += ' AND created_at <= ?';
                params.push(filters.end_date);
            }

            query += ' ORDER BY created_at DESC';
            
            if (filters.limit) {
                query += ' LIMIT ?';
                params.push(filters.limit);
            }

            if (filters.page && filters.limit) {
                const offset = (filters.page - 1) * filters.limit;
                query += ' OFFSET ?';
                params.push(offset);
            }

            const [logs] = await pool.execute(query, params);
            
            // Parsear JSON fields de manera segura
            return logs.map(log => ({
                ...log,
                old_values: log.old_values ? this.safeJsonParse(log.old_values) : null,
                new_values: log.new_values ? this.safeJsonParse(log.new_values) : null,
                additional_data: log.additional_data ? this.safeJsonParse(log.additional_data) : null
            }));
        } catch (error) {
            console.error('Error getting admin logs:', error);
            throw error;
        }
    }

    static safeJsonParse(str) {
        try {
            return JSON.parse(str);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return null;
        }
    }

    static async getLogsCount(filters = {}) {
        try {
            let query = `
                SELECT COUNT(*) as total FROM admin_activity_logs 
                WHERE 1=1
            `;
            const params = [];

            if (filters.admin_id) {
                query += ' AND admin_id = ?';
                params.push(filters.admin_id);
            }

            if (filters.action_type) {
                query += ' AND action_type = ?';
                params.push(filters.action_type);
            }

            if (filters.start_date) {
                query += ' AND created_at >= ?';
                params.push(filters.start_date);
            }

            if (filters.end_date) {
                query += ' AND created_at <= ?';
                params.push(filters.end_date);
            }

            const [result] = await pool.execute(query, params);
            return result[0]?.total || 0;
        } catch (error) {
            console.error('Error getting logs count:', error);
            throw error;
        }
    }

    // MÉTODOS PARA ESTADÍSTICAS

    static async getRecentActivity(limit = 10) {
        try {
            const query = `
                SELECT 
                    id,
                    admin_name,
                    action_type,
                    action_description,
                    resource_type,
                    resource_name,
                    created_at
                FROM admin_activity_logs 
                ORDER BY created_at DESC 
                LIMIT ?
            `;
            
            const [logs] = await pool.execute(query, [limit]);
            return logs || [];
        } catch (error) {
            console.error('Error getting recent activity:', error);
            return [];
        }
    }

    static async getActionSummary(startDate, endDate = new Date()) {
        try {
            let query = `
                SELECT 
                    action_type,
                    COUNT(*) as count
                FROM admin_activity_logs 
                WHERE created_at BETWEEN ? AND ?
                GROUP BY action_type
                ORDER BY count DESC
            `;
            
            const [summary] = await pool.execute(query, [startDate, endDate]);
            return summary || [];
        } catch (error) {
            console.error('Error getting action summary:', error);
            return [];
        }
    }

    static async getActionsCount(startDate, endDate) {
        try {
            const query = `
                SELECT COUNT(*) as count 
                FROM admin_activity_logs 
                WHERE created_at BETWEEN ? AND ?
            `;
            
            const [result] = await pool.execute(query, [startDate, endDate]);
            return result[0]?.count || 0;
        } catch (error) {
            console.error('Error getting actions count:', error);
            return 0;
        }
    }

    static async getActionsCountByType(startDate, endDate, actionType) {
        try {
            const query = `
                SELECT COUNT(*) as count 
                FROM admin_activity_logs 
                WHERE created_at BETWEEN ? AND ? AND action_type = ?
            `;
            
            const [result] = await pool.execute(query, [startDate, endDate, actionType]);
            return result[0]?.count || 0;
        } catch (error) {
            console.error('Error getting actions count by type:', error);
            return 0;
        }
    }

    static async getStatsSummary(days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const query = `
                SELECT 
                    DATE(created_at) as date,
                    action_type,
                    COUNT(*) as count
                FROM admin_activity_logs 
                WHERE created_at >= ?
                GROUP BY DATE(created_at), action_type
                ORDER BY date DESC, count DESC
            `;
            
            const [summary] = await pool.execute(query, [startDate]);
            return summary || [];
        } catch (error) {
            console.error('Error getting stats summary:', error);
            return [];
        }
    }

    static async getAdminActivity(adminId, days = 30) {
        try {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const query = `
                SELECT 
                    action_type,
                    COUNT(*) as count,
                    DATE(created_at) as date
                FROM admin_activity_logs 
                WHERE admin_id = ? AND created_at >= ?
                GROUP BY action_type, DATE(created_at)
                ORDER BY date DESC, count DESC
            `;
            
            const [activity] = await pool.execute(query, [adminId, startDate]);
            return activity || [];
        } catch (error) {
            console.error('Error getting admin activity:', error);
            return [];
        }
    }
}

module.exports = AdminLog;