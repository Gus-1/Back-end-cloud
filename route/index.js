const router = require('express').Router();

const UserRouter = require('./user');
const MessageRouter = require('./message');
const EventRouter = require('./event');
const GameCategoryRouter = require('./gameCategory');
const InscriptionRouter = require('./inscription');

router.use("/user", UserRouter);
router.use("/message", MessageRouter);
router.use("/event", EventRouter);
router.use("/gameCategory", GameCategoryRouter);
router.use("/inscription", InscriptionRouter);

module.exports = router;