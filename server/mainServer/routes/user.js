const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const authenticateOwnResource = require('../middleware/authOwnResource');

router.get('/:id', authenticateOwnResource, async (req, res) => {
    
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
        return res.status(400).json({ error: 'Некорректный ID' });
    }

    try {

        const query = `
      SELECT 
        u.username,
        c.comment,
        c.grade,
        c.datetime,
        c.pointId,
        c.id,
        p.title AS pointTitle
      FROM users u
      LEFT JOIN comments c ON u.id = c.userId
      LEFT JOIN \`point-info\` p ON c.pointId = p.id
      WHERE u.id = ?
      ORDER BY c.id DESC;
    `;

        const [rows] = await pool.execute(query, [userId]);

        if (rows.length === 0) {
            return res.json({ user: null, comments: [] });
        }

        const user = {
            username: rows[0].username,
        };

        const comments = rows
            .filter(row => row.comment !== null)
            .map(row => ({
                comment: row.comment,
                grade: row.grade,
                datetime: row.datetime,
                pointId: row.pointId,
                commentId: row.id,
                pointTitle: row.pointTitle || 'Основной сайт',
            }));

        const totalComments = comments.length;
        const totalGrades = comments.filter(c => c.grade != null && c.grade > 0).length;

        res.json({
            user,
            comments,
            stats: {
                totalComments,
                totalGrades,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ошибка сервера при получении данных профиля' });
    }
});

router.delete('/:id', authenticateOwnResource, async (req, res) => {

    const id  = parseInt(req.params.id, 10);

    try {

        const query = `
        DELETE from users
        WHERE id = ?
    `

        const [rows] = await pool.execute(query, [id])

        res.status(200).json({ message: 'Пользователь успешно удалён' });

    }

    catch (error) {
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
})

router.patch('/update-name/:id', authenticateOwnResource, async (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const { newName } = req.body;

    if (!newName || newName.trim().length === 0) {
        return res.status(400).json({ message: 'Имя не может быть пустым' });
    }

    try {
        const [result] = await pool.execute(
            'UPDATE users SET username = ? WHERE id = ?',
            [newName.trim(), userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        res.json({ success: true, message: 'Имя успешно обновлено' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

router.post('/update-password/:id', authenticateOwnResource, async (req, res) => {
    
    const userId = parseInt(req.params.id, 10)
    const { lastPassword, newPassword } = req.body;

    if (!lastPassword || !newPassword) {
        return res.status(400).json({ message: 'Заполните все поля' });
    }

    try {

        const [user] = await pool.execute(
            'SELECT id, password FROM users WHERE id = ? LIMIT 1',
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }

        const storedHash = user[0].password;

        const isPasswordValid = await bcrypt.compare(lastPassword, storedHash);
        if (!isPasswordValid) {
            return res.status(403).json({ message: 'Неверный  пароль' });
        }

        const saltRounds = 10;
        const newHash = await bcrypt.hash(newPassword, saltRounds);

        const [result] = await pool.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [newHash, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(500).json({ message: 'Не удалось обновить пароль' });
        }

        res.json({ success: true, message: 'Пароль успешно изменён' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка сервера', error: err.message });
    }
});

module.exports = router;