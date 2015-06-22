
module.exports = function(server) {
    var io = require('socket.io')(server);

    io.on('connection', function(socket) {
        io.emit('news', 'dasda');
    });

    var todos = require('./todos.ws.js')(io);
    return io;
}