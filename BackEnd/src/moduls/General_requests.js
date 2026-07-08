const pool = require('../database/dbConnect');


class General_requests{

    static async createRequest(idUser, type, subject, message, priority){
        try{
            const [response] = await pool.execute('INSERT INTO general_requests(tipo ,user_id ,priority ,issue ,request) VALUES(?,?,?,?,?)', [type, idUser, priority, subject, message]);
            return response.affectedRows;
        }
        catch(err){console.log(err)}
    }
    static async getMyRequests(idUser){
        try{
            const [response] = await pool.execute(
                'SELECT id, tipo as type, request as message, issue as subject, created_at, priority, status, admin_response FROM general_requests WHERE user_id = ?',
                [idUser]
            );
            return response;
        }
        catch(err){console.log(err)}
    }

    static async getAllForAdmin(){
        try{
            const [response] = await pool.execute(
                `SELECT gr.id, gr.tipo AS type, gr.issue AS subject, gr.request AS message,
                        gr.priority, gr.status, gr.admin_response, gr.created_at, gr.updated_at,
                        u.first_name, u.last_name, u.email
                 FROM general_requests gr
                 INNER JOIN users u ON gr.user_id = u.id
                 ORDER BY
                   FIELD(gr.status,'pending','in_progress','resolved','cancelled'),
                   FIELD(gr.priority,'urgent','high','medium','low'),
                   gr.created_at DESC`
            );
            return response;
        }
        catch(err){console.log(err)}
    }

    static async getRequestUserId(id){
        try{
            const [rows] = await pool.execute('SELECT user_id FROM general_requests WHERE id = ?', [id]);
            return rows[0]?.user_id || null;
        }
        catch(err){console.log(err); return null;}
    }

    static async updateRequest(id, status, admin_response){
        try{
            const [response] = await pool.execute(
                'UPDATE general_requests SET status = ?, admin_response = ? WHERE id = ?',
                [status, admin_response || null, id]
            );
            return response.affectedRows;
        }
        catch(err){console.log(err)}
    }


}

module.exports = General_requests;