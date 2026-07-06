const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes/index');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: [
        'http://adm.lemongirl.fun',
        'https://adm.lemongirl.fun',
        'http://thevoiceofthefortress.fun',
        'https://thevoiceofthefortress.fun'
    ],
    methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

const uploadsDir = path.join(__dirname, 'uploads');
const imagesDir = path.join(__dirname, 'images');

app.use('/uploads', express.static(uploadsDir));
app.use('/images', express.static(imagesDir));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

const frontendPath = path.join(__dirname, 'build');


app.use((req, res) => {
    res.status(404).json({ error: 'Маршрут не найден' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера', 
        message: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});