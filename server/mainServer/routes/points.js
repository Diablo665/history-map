const express = require('express');
const router = express.Router();
const pool = require('../db/pool');
const multer = require('multer')
const upload = multer();
const path = require('path');
const fs = require('fs')

router.get('/', async (req, res) => {

    try {
        const query = `SELECT
        t1.id,
        t1.longitude,
        t1.latitude,
        t1.text,
        t1.title,
        t1.years,
        t2.photo_path,
        t2.audio_path
      FROM \`point-info\` as t1
      LEFT JOIN \`point-files\` t2 ON t1.id = t2.id
    `

        const [rows] = await pool.execute(query);
        res.json(rows);
    } catch (error) {
        console.error('Ошибка запроса к БД:', error);
        res.status(500).json({ error: 'Ошибка сервера 1', data: error.message });
    }
});

router.post('/', upload.any(), async (req, res) => {
    const { longitude, latitude, text, title, years } = req.body;
    const files = req.files;
     const uploadsDir = process.env.UPLOADS_DIR;

    if (!longitude || !latitude || !text) {
        return res.status(400).json({
            error: 'Обязательные поля: долгота, широта, описание'
        });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const [insertResult] = await connection.execute(
                'INSERT INTO `point-info` (longitude, latitude, text, title, years) VALUES (?, ?, ?, ?, ?)',
                [parseFloat(longitude), parseFloat(latitude), text, title, years]
            );

            const newId = insertResult.insertId;

            if (files && files.length > 0) {
                for (const file of files) {
                    let photoPath = null;
                    let audioPath = null;

                    if (file.fieldname.includes('photo')) {
                        const filename = `${newId}_${file.originalname}`;
                        const filePath = path.join(uploadsDir, 'photos', filename);
                        fs.writeFileSync(filePath, file.buffer);
                        photoPath = `/uploads/photos/${filename}`;
                    } else if (file.fieldname.includes('audio')) {
                        const filename = `${newId}_${file.originalname}`;
                        const filePath = path.join(uploadsDir, 'audio', filename);
                        fs.writeFileSync(filePath, file.buffer);
                        audioPath = `/uploads/audio/${filename}`;
                    }

                    await connection.execute(
                        'INSERT INTO `point-files` (id, photo_path, audio_path) VALUES (?, ?, ?)',
                        [newId, photoPath, audioPath]
                    );
                }
            }

            await connection.commit();
            connection.release();

            res.status(201).json({
                id: newId,
                longitude,
                latitude,
                text,
                title,
                years,
                files: files ? files.map(f => f.originalname) : []
            });
        } catch (err) {
            await connection.rollback();
            connection.release();
            throw err;
        }
    } catch (error) {
        console.error('Ошибка вставки в БД:', error);
        res.status(500).json({ error: `Ошибка сервера 3 => ${error.message}` });
    }
});


router.get('/point', async (req, res) => {
    try {
        const query = `
      SELECT
        t1.id,
        t1.longitude,
        t1.latitude,
        (
          SELECT photo_path
          FROM \`point-files\`
          WHERE id = t1.id
            AND photo_path IS NOT NULL
          ORDER BY photo_path
          LIMIT 1
        ) as photo_path
      FROM \`point-info\` as t1
    `;

        const [rows] = await pool.execute(query);

        res.json(rows);
    } catch (error) {
        console.error('Ошибка запроса к БД:', error);
        res.status(500).json({
            error: 'Ошибка сервера при получении точек',
            data: error.message
        });
    }
});

router.get('/:id', async (req, res) => {

    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'ID должен быть числом' });
    }
    try {
        const query = `
      SELECT
        t1.id, t1.longitude, t1.latitude, t1.text, t1.title, t1.years,
        JSON_ARRAYAGG(t2.photo_path) AS photo_paths,
        JSON_ARRAYAGG(t2.audio_path) AS audio_paths
      FROM \`point-info\` AS t1
      LEFT JOIN \`point-files\` t2 ON t1.id = t2.id
      WHERE t1.id = ?
      GROUP BY t1.id
    `;
        const [rows] = await pool.execute(query, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Данные не найдены' });
        }
        const row = rows[0];
        const photoPaths = row.photo_paths
            ? JSON.parse(row.photo_paths).filter(p => p !== null)
            : [];
        const audioPaths = row.audio_paths
            ? JSON.parse(row.audio_paths).filter(a => a !== null)
            : [];

        res.json({
            ...row,
            photo_paths: photoPaths,
            audio_paths: audioPaths,
            photo_path: photoPaths.length > 0 ? photoPaths[0] : null,
            audio_path: audioPaths.length > 0 ? audioPaths[0] : null,
        });
    } catch (error) {
        console.error('Ошибка запроса к БД:', error);
        res.status(500).json({ error: 'Ошибка сервера', data: error.message });
    }
});

module.exports = router;