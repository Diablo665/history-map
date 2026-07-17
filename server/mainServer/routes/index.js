const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const pointsRouter = require('./points');
const commentsRouter = require('./comments');
const galleryRouter = require('./gallery');
const eventsRouter = require('./events');
const userRouter = require('./user')

router.use('/auth', authRouter);
router.use('/points', pointsRouter);
router.use('/comments', commentsRouter);
router.use('/gallery', galleryRouter);
router.use('/events', eventsRouter);
router.use('/user', userRouter)

module.exports = router;