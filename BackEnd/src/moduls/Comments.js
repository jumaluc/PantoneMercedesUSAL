const pool = require('../database/dbConnect');



class Comments{

    static async addComment(id, gallery_id, comment, image_id){

        try{
            const [result] = await pool.execute('INSERT INTO image_comments(gallery_id, image_id, user_id, comment) VALUES(?,?,?,?)',[gallery_id,image_id,id,comment]);
            return result.insertId;

        }
        catch(err){console.log(err)}

    }

    static async getImageComments(image_id){

        try{

            const [result] = await pool.execute('SELECT comment,created_at,id FROM image_comments WHERE image_id=?',[image_id]);
            return result;
        }
        catch(err){console.log(err)}
    }

        static async deleteImageComment(comment_id) {
        try {
            const [result] = await pool.execute('DELETE FROM image_comments WHERE id = ?', [comment_id]);
            return result.affectedRows;
        } catch (err) {
            console.log(err);
            throw err; // Es importante lanzar el error
        }
        }

static async updateImageComment(comment_id, comment) {
    try {
        const [result] = await pool.execute('UPDATE image_comments SET comment = ? WHERE id = ?', [comment, comment_id]);
        return result.affectedRows;
    }
    catch(err) {
        console.log('Error updating image comment:', err);
        throw err; // Es importante lanzar el error para manejarlo adecuadamente
    }
}
    }



module.exports = Comments;