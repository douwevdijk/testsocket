

var dbase = require('./todos.db.js');
var db = new dbase();

module.exports = function(io) {

        var q = io.of('/results');

        q.on('connection', function(socket) {

            db.getStreamResults( function (row) {
                socket.emit('results', row);
            });

            socket.on('disconnect', function () {
                console.log('disconnected:' + socket.id);
            });

            return q;

        });

}