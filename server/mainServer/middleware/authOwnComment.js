const pool = require('../db/pool');
const jwt = require('jsonwebtoken');

const authenticateOwnComment = async (req, res, next) => {

    try {

        const authHeader = req.headers['authorization'];

        if (!authHeader) return res.status(401).json({ error: 'Нет заголовка Authorization' });

        const [scheme, token] = authHeader.split(' ');

        if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Неверный формат' });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userIdFromToken = payload.userId;

        if (!userIdFromToken) return res.status(403).json({ error: 'Не передан ID' });

        const commentId = req.params.id;

        if (!commentId) return res.status(400).json({ error: 'Требуется ID комментария в URL' });

        const result = await pool.execute(
            'SELECT userid FROM comments WHERE id = ?',
            [commentId]
        );

        if (result[0].length === 0) {
            return res.status(404).json({ error: 'Комментарий не найден' });
        }

        const ownerId = result[0][0].userid;

        if (String(ownerId) !== String(userIdFromToken)) {
            return res.status(403).json({ error: 'Нельзя редактировать или удалять чужой комментарий' });
        }

        req.user = payload;
        next();

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Ошибка проверки доступа' });
    }
};

module.exports = authenticateOwnComment;