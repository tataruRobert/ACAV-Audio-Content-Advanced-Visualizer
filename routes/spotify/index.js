/* path: /spotify */

var express = require('express');
var router = express.Router();
var request = require("request")

var {GoogleCharts} = require('google-charts');

router.get('/songs', (req, res) => {
    let blogPosts = [
        {
            title: 'Perk is for real!',
            body: '...',
            author: 'Aaron Larner',
            publishedAt: new Date('2016-03-19'),
            createdAt: new Date('2016-03-19')
        },
        {
            title: 'Development continues...',
            body: '...',
            author: 'Aaron Larner',
            publishedAt: new Date('2016-03-18'),
            createdAt: new Date('2016-03-18')
        },
        {
            title: 'Welcome to Perk!',
            body: '...',
            author: 'Aaron Larner',
            publishedAt: new Date('2016-03-17'),
            createdAt: new Date('2016-03-17')
        }
    ];
    let data = {
        blogPosts
    }
    //drawChart()
   res.render('./spotify/songs', data)
});


module.exports = router;