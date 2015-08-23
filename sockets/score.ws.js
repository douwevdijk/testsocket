

var db = require('./todos.db.js');

module.exports = function(io) {

        var q = io.of('/score');

        q.on('connection', function(socket) {

            console.log('connected--score');

            socket.on('disconnect', function () {
                console.log('disconnected:' + socket.id);
            });

            socket.on('loggedin', function (obj) {
                socket.type = obj.type;
                socket.sqiffer_id = obj.id;
            })


            return q;

        });

}