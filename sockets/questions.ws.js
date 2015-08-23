
var dbase = require('../sockets/todos.db.js');
var _und = require('underscore');

var db = new dbase();

module.exports = function(io) {

    var q = io.of('/questions');
    var questions;
    var show = false;

    db.connect().then( function () {
        db.getstreamQuestions( function (row) {
            questions = row;
            io.of('/questions').emit('questions', row);
        })
    })

    q.on('connection', function(socket) {

        var sockets = _und.toArray( io.nsps['/questions'].connected );
        console.log(sockets.length);

        socket.emit('questions', questions);
        socket.emit('show', show);

        socket.on('showscore', function (data) {

            if ( data ) {
                show = true;
            } else {
                show = false;
            }

            socket.broadcast.emit('show', data);

        })

        socket.on('loggedin', function (obj) {
            socket.type = obj.type;
            socket.sqiffer_id = obj.id;

            db.getStreamScore( function (row) {

                if (socket.type === 'user') {
                    try {
                        var score = _und.findWhere(row.new_val.score, {group: socket.sqiffer_id});
                        socket.emit('scores', score);
                    } catch (err) {}
                } else {
                    socket.emit('scores', row);
                }

            });

        })

        socket.on('disconnect', function () {
            var sockets = _und.toArray( io.nsps['/questions'].connected );
            console.log(sockets.length);
        })

        return q;

    });

}