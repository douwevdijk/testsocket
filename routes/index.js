var express = require('express');
var router = express.Router();

var dbase = require('../sockets/todos.db.js');
var db = new dbase();

/* GET home page. */
router.get('/', function(req, res) {
    res.send('OK');
});

router.get('/adduser', function (req, res) {
    db.addUser( function (data) {
        res.json(data);
    })
});

router.get('/addquestion', function (req, res) {
    db.addQuestion( function (data) {
        res.json(data);
    })
});

router.get('/resetQuestions', function (req, res) {
    db.resetQuestions( function (data) {
        res.json(data);
    })
})

router.get('/getlatestresult/:id', function (req, res) {
    var id = req.params.id;

    db.getResultById(id, function (data) {
        res.json(data);
    })

})

router.get('/score', function (req, res) {
    db.getScore( function (data) {
        res.json(data);
    })
})

router.post('/getResult', function (req, res) {

    var body = req.body;

    db.getResult(body, function (data) {
        res.json(data);
    })

});

router.post('/updateActive', function (req, res) {

    var body = req.body;

    db.updateActive(body, function (data) {
        res.json(data);
    })

});

router.post('/deleteQuestion', function (req, res) {

    var body = req.body;

    db.deleteQuestion(body, function (data) {
        res.json(data);
    })

});

router.post('/updateMulti', function (req, res) {

    var body = req.body;

    db.updateMulti(body, function (data) {
        res.json('OK');
    })

});

router.post('/updateOpen', function (req, res) {

    var body = req.body;

    db.updateOpen(body, function (data) {
        res.json('OK');
    })

});

router.post('/updateArr', function (req, res) {

    var body = req.body;

    db.updateArr(body, function (data) {
        res.json(data);
    })

});

router.post('/updateQ', function (req, res) {

    var body = req.body;

    db.updateQ(body, function (data) {
        res.json(data);
    })

});


// if needed, add other REST API end points here
// router = require('./products.api')(router);

module.exports = router;