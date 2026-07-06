const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {

    const requestedLimit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const limit = Math.max(1, Math.min(requestedLimit || 20, 50));

    try {
        const query = `
        SELECT
            t1.id,
            t1.title,
            t2.photo_path
        FROM \`point-info\` as t1
        INNER JOIN \`point-files\` t2 ON t1.id = t2.id
        WHERE t2.photo_path IS NOT NULL
        AND t2.photo_path != ''
        ORDER BY t1.id DESC  -- для предсказуемого порядка
        LIMIT ?
    `;

        const [rows] = await pool.execute(query, [limit]);

        res.json(rows);
    } catch (error) {
        console.error('Ошибка запроса к БД:', error);
        res.status(500).json({
            error: 'Ошибка сервера при получении галереи',
            data: error.message
        });
    }
});

module.exports = router;
