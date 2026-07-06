const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.post('/', express.json(), async (req, res) => {
    try {
        const { username, comment, datetime, grade, userid } = req.body;

        if (!username || !comment || !datetime) {
            return res.status(400).json({
                error: 'Обязательные поля: Имя, комментарий, дата'
            });
        }

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
                'INSERT INTO `comments` (username, comment, datetime, grade, userid) VALUES (?, ?, ?, ?, ?)',
                [username, comment, mysqlDateTime, grade, userid]
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


router.get('/', async (req, res) => {

    try {
        const query = `
        SELECT
            *
        FROM comments
        ORDER BY id DESC 
        `

        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка запроса к БД:', error);
        res.status(500).json({ error: 'Ошибка сервера 1', data: error.message });
    }
});

router.delete('/:id', async (req, res) => {
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

router.patch('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { adminComment } = req.body;

    if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: 'Некорректный ID комментария' });
    }
    if (!adminComment || typeof adminComment !== 'string' || !adminComment.trim()) {
        return res.status(400).json({ error: 'Текст комментария обязателен' });
    }

    const trimmedComment = adminComment.trim();

    try {
        const query = `
            UPDATE comments
            SET comment = ?, grade = 0, isDeleted = 1
            WHERE id = ?
        `;

        const [result] = await pool.execute(query, [trimmedComment, id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Комментарий не найден' });
        }

        res.json({
            message: 'Комментарий успешно обновлён и помечен как удалённый',
            commentId: id,
            updatedComment: trimmedComment
        });
    } catch (error) {
        console.error('Ошибка при обновлении комментария:', error);
        res.status(500).json({
            error: 'Ошибка сервера при обновлении комментария',
            data: error.message
        });
    }
});


module.exports = router;
