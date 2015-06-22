
var mongojs = require('mongojs');
var db = mongojs('douwevdijk:willem901@ds039271.mongolab.com:39271/filter', ['user']);

var todos = {

    getAllUsers: function(callback) {
        db.user.find(callback);
    },
    addUser: function(todo, callback) {
        db.user.insert(todo, callback);
    },
    updateTodo: function(todo, callback) {
        db.todos.update({
            id: todo.id
        }, todo, {}, callback);
    },
    deleteTodo: function(id, callback) {
        db.todos.remove({
            id: id
        }, '', callback);

    }
}

module.exports = todos;