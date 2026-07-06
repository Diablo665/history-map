const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/', async (req, res) => {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({ error: 'Логин и пароль обязательны' });
        }

        const [users] = await pool.execute(
            'SELECT * FROM users WHERE login = ? AND role = \'admin\'',
            [login]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Администратор не найден' });
        }

        const user = users[0];

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Неверный пароль' });
        }

        const token = jwt.sign(
            { userId: user.id, login: user.login, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token });
    } catch (error) {
        console.error('Ошибка авторизации:', error);
        res.status(500).json({ error: `Ошибка сервера => ${error}` });
    }

});

module.exports = router;