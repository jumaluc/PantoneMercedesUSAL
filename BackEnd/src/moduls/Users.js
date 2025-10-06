const pool = require('../database/dbConnect');


class User {

    static async editProfile(id, first_name,last_name, email, number, service){
        const [result] = await pool.execute('UPDATE users SET first_name = ?, last_name = ?, email=?, number=?, service=? WHERE id=?', [first_name, last_name, email, number, service, id]);
        return result.affectedRows;
    }
    static async getUser(id){
        try{
            const [result] = await pool.execute('SELECT id, first_name, last_name, email,number, service, role FROM users WHERE id = ? ', [id]);
            return result[0];
        }
        catch(error){console.log(error)}
    }
    static async registerUser(first_name, last_name, email, number, service, password){
        try{
        console.log(first_name, last_name, email, number, service, password)
        const [result] = await pool.execute('INSERT INTO users(first_name, last_name, email, number, service, password) VALUES (?,?,?,?,?,?)', [first_name, last_name, email, number, service, password]);
        return result.affectedRows;
        }
        catch(error){
            console.log(error);
        }
    }
    static async verifyEmail(email){
        const [result] = await pool.execute('SELECT id FROM users WHERE email=?', [email]);
        return result[0];
    }
    static async tokenSave(reserToken, id){
        const [result] = await pool.execute('UPDATE users SET resetToken=? WHERE id=?',[reserToken, id]);
        return result.affectedRows;
    }
    static async verifyToken(email, resetToken){
        const [result] = await pool.execute('SELECT id FROM users WHERE email=? and resetToken',[email, resetToken]);
        return result[0];
    }
    static async resetPassword(email, idResetPassword, newPassword){
        const [result] = await pool.execute('UPDATE users SET password = ? WHERE email = ? and id = ?', [newPassword, email, idResetPassword]);
        return result.affectedRows;
    }
    static async equalPassword(email){
        const [result] =await pool.execute('SELECT * FROM users WHERE email = ? ',[email]);
        return result[0];
    }
    static async getAllClients(){
        const [result] = await pool.execute('SELECT id, first_name, last_name, email, number, service, created_at FROM users WHERE role = "client"');
        return result;
    }
    static async deleteClient(id){
        const [result] = await pool.execute('DELETE from users WHERE id = ? and role = "client"',[id]);
        return result;
    }
    static async findOne(id){
        const [result] = await pool.execute('SELECT first_name, last_name, email FROM users WHERE id = ? and role = "client"',[id]);
        return result[0]; 
    }
    static async getTotalClients() {
    try {
        const [rows] = await pool.execute('SELECT COUNT(*) as total FROM users WHERE role = "client"');
        return rows[0].total;
    } catch (error) {
        console.error('Error getting total clients:', error);
        throw error;
    }
}

static async getNewClientsCount(startDate, endDate) {
    try {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM users WHERE role = "client" AND created_at BETWEEN ? AND ?',
            [startDate, endDate]
        );
        return rows[0].count;
    } catch (error) {
        console.error('Error getting new clients count:', error);
        throw error;
    }
}

static async getClientsGrowth(days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const query = `
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as new_clients
            FROM users 
            WHERE role = "client" AND created_at >= ?
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        
        const [growth] = await pool.execute(query, [startDate]);
        return growth;
    } catch (error) {
        console.error('Error getting clients growth:', error);
        throw error;
    }
}
}

module.exports = User;

