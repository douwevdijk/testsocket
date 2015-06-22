var todosDB = require('./todos.db');
module.exports = function(io) {

    var todos = io.of('/todos');

    todos.on('connection', function(socket) {

        socket.on('id', function (data) {
            console.log(data);
        })

        socket.on('disconnect', function () {
            console.log('disconnected:' + socket.id);
        });

        socket.on('getAllUsers', function() {
            dispatchAll(socket);
        });

        socket.on('', function(todo) {
            todosDB.savsaveTodoeTodo(todo, function(err, data) {
                if (err) throw err; // You can emit the error to a socket
                dispatchAll(socket);
            });
        });

        socket.on('updateTodo', function(data) {
            todosDB.updateTodo(data, function(err, data) {
                if (err) throw err; // You can emit the error to a socket
                dispatchAll(socket);
            });
        });

        socket.on('deleteTodo', function(data) {
            todosDB.deleteTodo(data.id, function(err, data) {
                if (err) throw err; // You can emit the error to a socket
                dispatchAll(socket);
            });
        });

        // On connection send all the todos, to save one round trip
        dispatchAll(socket);
    });


    function dispatchAll(socket) {
        todosDB.getAllUsers(function(err, data) {
            if (err) throw err; // You can emit the error to a socket
            io.of('/todos').emit('allTodos', data);
        });
    }

    return todos;
}