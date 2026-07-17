const jwt = require('jsonwebtoken');

const authenticateOwnResource = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) return res.status(401).json({ error: 'Нет заголовка Authorization' });

        const [scheme, token] = authHeader.split(' ');
        if (scheme !== 'Bearer' || !token) return res.status(401).json({ error: 'Неверный формат' });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const userIdFromToken = payload.userId;

        if (!userIdFromToken) return res.status(403).json({ error: 'Не передан ID' });

        const requestedId = req.params.id;
        if (!requestedId) return res.status(400).json({ error: 'Требуется ID в URL' });

        if (String(userIdFromToken) !== String(requestedId)) {
            return res.status(403).json({ error: 'Нельзя просматривать чужой профиль' });
        }

        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Токен невалиден' });
    }
};

module.exports = authenticateOwnResource;