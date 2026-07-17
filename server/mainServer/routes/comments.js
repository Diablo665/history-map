const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateOwnComment = require('../middleware/authOwnComment')


router.post('/', express.json(), async (req, res) => {
    try {
        const { username, comment, datetime, grade, userid, pointId } = req.body;

        if (!username || !comment || !datetime) {
            return res.status(400).json({
                error: 'Обязательные поля: Имя, комментарий, дата'
            });
        }

        const finalPointId = pointId === undefined ? null : pointId;

        let mysqlDateTime;
        try {
            mysqlDateTime = new Date(datetime).toISOString().slice(0, 19).replace('T', ' ');
        } catch (dateError) {
            console.error('Invalid datetime:', datetime, dateError);
            return res.status(400).json({ error: 'Неверный формат даты' });
        }

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [insertResult] = await connection.execute(
                'INSERT INTO `comments` (username, comment, datetime, grade, userid, pointId) VALUES (?, ?, ?, ?, ?, ?)',
                [username, comment, mysqlDateTime, grade, userid, finalPointId]
            );

            const newId = insertResult.insertId;
            await connection.commit();
            connection.release();

            res.status(201).json({ id: newId, username, comment, datetime: mysqlDateTime, grade, userid });
        } catch (dbErr) {
            await connection.rollback();
            connection.release();
            console.error('DB error:', dbErr);
            res.status(500).json({ error: 'Ошибка базы данных' });
        }
    } catch (error) {
        console.error('Unexpected error in /api/comment:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

router.get('/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const query = `
        SELECT 
            *
        FROM comments
        WHERE pointId = ? 
        `

        const [rows] = await pool.execute(query, [id]);
        res.json(rows);

    } catch (error) {
        console.error('Ошибка при запросе комментариев: ', error)
    }
})

router.get('/', async (req, res) => {

    try {
        const query = `
        SELECT
            *
        FROM comments 
        WHERE pointId IS NULL
        ORDER BY id DESC 
        `

        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка запроса к БД:', error);
        res.status(500).json({ error: 'Ошибка сервера 1', data: error.message });
    }
});


router.delete('/:id', authenticateOwnComment, async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const query = `
        DELETE FROM comments WHERE id = ?
        `

        const [rows] = await pool.execute(query, [id]);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка запроса к БД:', error);
        res.status(500).json({ error: 'Ошибка сервера', data: error.message });
    }
});

router.patch('/:id', authenticateOwnComment, async (req, res) => {

    const id = parseInt(req.params.id, 10);

    const newComment = req.body.newComment;
    const newGrade = req.body.newGrade;

    try{

        const query = `
            UPDATE comments
            SET comment = ?, grade = ?
            WHERE id = ?

        `   
        const [rows] = await pool.execute(query, [newComment, newGrade, id]);

        res.status(200).json(rows)

    }catch(err){
        res.status(500).json({message: 'Ошибка сервера', error: err})
    }
})


module.exports = router;
