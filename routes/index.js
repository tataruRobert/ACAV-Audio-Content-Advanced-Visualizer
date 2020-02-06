const router = require('express').Router();

router.use('/', require('./home'));
router.use('/login', require('./login'));
router.use('/register', require('./register'));
router.use('/map', require('./map'));


module.exports = router;