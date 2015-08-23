

var db = require('./todos.db.js');
var _und = require('underscore');

module.exports = function(io) {

        var q = io.of('/test');

        var nr = [];

        q.on('connection', function(socket) {

            nr.push(socket.id);
            console.log(nr.length);

            socket.on('disconnect', function () {
                var id = _und.indexOf(nr, socket.id);
                nr.splice(id);
                console.log(nr.length);

            })

            socket.on('message', function (data) {
                socket.broadcast.emit('every', "this is a test");
            })

            return q;

        });

}