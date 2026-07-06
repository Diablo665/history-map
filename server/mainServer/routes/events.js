const express = require('express');
const router = express.Router();
const pool = require('../db/pool');

router.get('/', async (req, res) => {

    const requestedLimit = parseInt(req.query.limit, 10);
    const limit = Math.max(1, Math.min(requestedLimit || 15, 50));
    try {
        const query = `
        SELECT
            t1.id,
            t1.text,
            t1.title,
            (
              SELECT photo_path
              FROM \`point-files\`
                WHERE id = t1.id
                AND photo_path IS NOT NULL
                ORDER BY photo_path
                LIMIT 1
            ) as photo_path
        FROM \`point-info\` as t1
        ORDER BY t1.id DESC 
        LIMIT ?
        `

        const [rows] = await pool.execute(query, [limit]);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка запроса к БД:', error);
        res.status(500).json({ error: 'Ошибка сервера 1', data: error.message });
    }
});

module.exports = router;