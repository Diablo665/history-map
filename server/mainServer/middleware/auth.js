const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ error: 'Заголовок Authorization отсутствует' });
        }

        const tokenParts = authHeader.split(' ');
        if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
            return res.status(401).json({ error: 'Неверный формат заголовка' });
        }

        const token = tokenParts[1];
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Ошибка верификации токена' });
    }
};

module.exports = authenticateJWT;