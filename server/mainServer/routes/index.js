const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const pointsRouter = require('./points');
const commentsRouter = require('./comments');
const galleryRouter = require('./gallery');
const eventsRouter = require('./events');

router.use('/auth', authRouter);
router.use('/points', pointsRouter);
router.use('/comments', commentsRouter);
router.use('/gallery', galleryRouter);
router.use('/events', eventsRouter);

module.exports = router;