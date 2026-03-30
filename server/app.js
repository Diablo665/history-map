const express = require('express');
require('dotenv').config();
const mysql = require('mysql2/promise');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get('/api/data', async (req, res) => {
  try {
    const query =  `SELECT * FROM \`point-info\``;

    const [rows] = await pool.execute(query);
    res.json(rows);
  } catch (error) {
    console.error('Ошибка запроса к БД:', error);
    res.status(500).json({ error: 'Ошибка сервера', data:  error.message });
  }
});

app.get('/api/data/:id', async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'ID должен быть числом' });
  }

  try {
    const query = `
      SELECT
        t1.id,
        t1.photo,
        t1.audio,
        t2.longitude,
        t2.latitude,
        t2.text
      FROM table1 t1
      JOIN table2 t2 ON t1.id = t2.id
      WHERE t1.id = ?
    `;

    const [rows] = await pool.execute(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Данные не найдены' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Ошибка запроса к БД:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/data', async (req, res) => {
  const { photo, audio, longitude, latitude, text } = req.body;

  if (!photo || !audio || longitude == null || latitude == null || !text) {
    return res.status(400).json({
      error: 'Все поля обязательны: photo, audio, longitude, latitude, text'
    });
  }

  try {
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [insertResult] = await connection.execute(
        'INSERT INTO table1 (photo, audio) VALUES (?, ?)',
        [photo, audio]
      );

      const newId = insertResult.insertId;

      await connection.execute(
        'INSERT INTO table2 (id, longitude, latitude, text) VALUES (?, ?, ?, ?)',
        [newId, longitude, latitude, text]
      );

      await connection.commit();
      connection.release();

      res.status(201).json({
        id: newId,
        photo,
        audio,
        longitude,
        latitude,
        text
      });
    } catch (err) {
      await connection.rollback();
      connection.release();
      throw err;
    }
  } catch (error) {
    console.error('Ошибка вставки в БД:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

const PORT = 3000
app.listen(PORT, () => {
  console.log(`Сервер запущен`);
});