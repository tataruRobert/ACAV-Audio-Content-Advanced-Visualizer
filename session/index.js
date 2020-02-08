const LocalStorage = require('node-localstorage').LocalStorage;
const storage = new LocalStorage('./storage');

const isAuthorized = (req, res, next) => {
    //req.session.wa && req.session.user
    if (req.session.wa && req.session.user) {
        console.log("1")
        next();
    } else if (req.body && req.body.wa) {
        console.log("2")
        console.log(req.body)
        const key = req.body.wa.token;
        const data = JSON.parse(storage.getItem(key));
        if (data) {
            console.log(data)
            req.session.wa = data.wa;
            req.session.user = data.user;
            console.log(req.session)
            storage.removeItem(key);
        }
        next();
    } else if (req.query.wa) {
        const key = req.query.wa;
        const data = JSON.parse(storage.getItem(key));
        if (data) {
            req.session.wa = data.wa;
            req.session.user = data.user;
            storage.removeItem(key);
        }
        next();
    } else {
        res.redirect('/login');
    }
};

module.exports = { isAuthorized, storage };