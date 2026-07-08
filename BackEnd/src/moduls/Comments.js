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

static async getMyComments(idUser){
    try{
        const [result] = await pool.execute(
            `SELECT ic.id, ic.image_id, ic.comment, ic.created_at, ic.updated_at,
                    ic.admin_seen, gi.image_url
             FROM image_comments ic
             INNER JOIN gallery_images gi ON ic.image_id = gi.id
             WHERE ic.user_id = ?`,
            [idUser]
        );
        return result;
    }
    catch(err){console.log(err)}
}

static async getAllForAdmin(){
    try{
        const [result] = await pool.execute(
            `SELECT ic.id, ic.comment, ic.created_at, ic.admin_seen,
                    u.first_name, u.last_name, u.email,
                    gi.image_url, gi.original_filename,
                    g.title AS gallery_title
             FROM image_comments ic
             INNER JOIN users u ON ic.user_id = u.id
             INNER JOIN gallery_images gi ON ic.image_id = gi.id
             INNER JOIN galleries g ON ic.gallery_id = g.id
             ORDER BY ic.admin_seen ASC, ic.created_at DESC`
        );
        return result;
    }
    catch(err){console.log(err)}
}

static async getCommentUserId(commentId){
    try{
        const [rows] = await pool.execute('SELECT user_id FROM image_comments WHERE id = ?', [commentId]);
        return rows[0]?.user_id || null;
    }
    catch(err){console.log(err); return null;}
}

static async markAsSeen(commentId){
    try{
        const [result] = await pool.execute(
            'UPDATE image_comments SET admin_seen = 1 WHERE id = ?',
            [commentId]
        );
        return result.affectedRows;
    }
    catch(err){console.log(err)}
}


}



module.exports = Comments;