const express = require('express');
const router = express.Router();

const authRouter = require('./auth');
const statisticsRouter = require('./statistics');
const pointsRouter = require("./points")

router.use('/auth', authRouter);
router.use('/statistics', statisticsRouter);
router.use('/points', pointsRouter);

module.exports = router;