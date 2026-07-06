const express = require('express');
const cors = require('cors');
const routes = require('./routes/index');
require('dotenv').config();

const app = express();

app.use(cors({
    origin: [
        'http://adm.lemongirl.fun',
        'https://adm.lemongirl.fun',],
    methods: ['GET', 'POST', 'OPTIONS', "DELETE", "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

app.use((req, res) => {
    res.status(404).json({ error: 'Страница не найдена' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера', 
        message: err.message 
    });
});

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});