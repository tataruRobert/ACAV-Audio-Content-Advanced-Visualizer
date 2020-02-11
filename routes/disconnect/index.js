var express = require('express');
const router = require('express').Router();
const { isAuthorized } = require('../../session');

router.get('/', isAuthorized, async (req, res) => {
    delete req.session.wa;
    delete req.session.user;
    res.redirect('/');
});

module.exports = router;