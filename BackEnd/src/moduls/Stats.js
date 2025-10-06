const pool = require('../database/dbConnect');


class Stats  {


    static async addStat(user_id, userTipe, action_descripcion, action_type, status){
        try{
            const [result] = await pool.execute('INSERT INTO stats(user_id,userTipe, action_type, action_descripcion, status) VALUES(?,?,?,?,?)', [user_id, userTipe, action_type, action_descripcion, status]);
            return result.affectedRows;

        }
        catch(err){console.log(err)}
    }
    static async getAllStats(){

        try{
            const [result] = await pool.execute('SELECT stats.*, users.first_name, users.last_name FROM stats INNER JOIN users ON users.id = stats.user_id');
            return result;
        }
        catch(err){console.log(err)}
    }


}

module.exports = Stats;