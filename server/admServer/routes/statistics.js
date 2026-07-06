const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {

    try {
        const query = `
        SELECT
            grade
        FROM comments
        `

        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка запроса к БД:', error);
        res.status(500).json({ error: 'Ошибка сервера', data: error.message });
    }
});

module.exports = router;
