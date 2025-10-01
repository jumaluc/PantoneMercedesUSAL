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
            const [response] = await pool.execute('SELECT id, tipo as type, request as message, issue as subject, created_at, priority FROM general_requests WHERE user_id = ?',[idUser]);
            return response;
        }
        catch(err){console.log(err)}
    }


}

module.exports = General_requests;