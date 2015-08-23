
module.exports = function(server) {
    var io = require('socket.io')(server);

    var questions = require('./questions.ws.js')(io);
    var results = require('./results.ws.js')(io);
    var score = require('./score.ws.js')(io);
    var test = require('./test.ws.js')(io);

    return io;
}