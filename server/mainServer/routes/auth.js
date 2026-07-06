const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const authenticateJWT = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer')
const upload = multer();


router.get('/verify', authenticateJWT, (req, res) => {
    res.json({
        valid: true,
        user: req.user
    });
});

router.post('/registration', upload.any(), async (req, res) => {
    try {
        const { login, password, username } = req.body;
        const connection = await pool.getConnection();

        try {
            const [existingUser] = await connection.execute(
                'SELECT id FROM `users` WHERE login = ? LIMIT 1',
                [login]
            );

            if (existingUser.length > 0) {
                connection.release();
                return res.status(409).json({
                    error: 'Пользователь с таким логином уже существует'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const [insertResult] = await connection.execute(
                'INSERT INTO `users` (login, password, username) VALUES (?, ?, ?)',
                [login, hashedPassword, username]
            );

            connection.release();

            res.status(201).json({
                message: 'Регистрация успешна',
                userId: insertResult.insertId,
                username: username,
            });

        } catch (dbErr) {
            connection.release();

            res.status(500).json({ error: 'Ошибка базы данных' });

        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }

})

router.post('/login', upload.any(), async (req, res) => {
    try {
        const { login, password } = req.body;
        const connection = await pool.getConnection();

        try {
            const [users] = await connection.execute(
                'SELECT * FROM `users` WHERE login = ? LIMIT 1',
                [login]
            );

            connection.release();

            if (users.length === 0) {
                return res.status(401).json({
                    error: 'Пользователь не найден'
                });
            }

            const user = users[0];

            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {

                return res.status(401).json({
                    error: 'Неверный пароль'
                });
            }

            const token = jwt.sign(
                { userId: user.id, username: user.username, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '48h' })
                ;

            res.status(200).json({
                message: 'Вход выполнен успешно',
                token: token,
                user: {
                    id: user.id,
                    username: user.username,
                }
            });

        } catch (dbErr) {
            connection.release();
            res.status(500).json({ error: 'Ошибка базы данных' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});



module.exports = router;