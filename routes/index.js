const router = require('express').Router();


router.use('/', require('./home'));
router.use('/login', require('./login'));
router.use('/register', require('./register'));
router.use('/map', require('./map'));
router.use('/connect', require('./connect'));
router.use('/spotify', require('./spotify'));

module.exports = router;