const router = require('express').Router();


router.use('/', require('./home'));
router.use('/login', require('./login'));
router.use('/register', require('./register'));
router.use('/map', require('./map'));
router.use('/connect', require('./connect'));
router.use('/spotify', require('./spotify'));
router.use('/disconnect', require('./disconnect'));
router.use('/song-artist', require('./song-artist'));


module.exports = router;