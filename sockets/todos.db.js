
var r = require('rethinkdb');
var _und = require('underscore');
var q = require('q');

var connection = null;

var dbConfig = {
    host: 'localhost',
    port: 28015,
    db  : 'voting',
    tables: {
        'questions': 'id',
        'users': 'id',
        'results': 'id'
    }
};

module.exports = function() {

    this.connect = function () {
        var deferred = q.defer();

        r.connect( { host: dbConfig.host, port: dbConfig.port}, function(err, conn) {
            if (err) {
                //
            }
            connection = conn;
            deferred.resolve();
        });

        return deferred.promise;

    };

    this.getstreamQuestions = function (callback) {
        r.table('questions').get('q').changes().run(connection, function(err, cursor) {
            if (err) throw err;
            cursor.each(function(err, row) {
                if (err) { callback(null); } else {
                    callback(row);
                }
            });
        });
    };

    this.getStreamResults = function (callback) {
        r.table('results').filter(function (doc) {
            return doc('active').eq(true)
        }).changes({squash: true}).run(connection, function (err, cursor) {
            if (err) throw err;
            cursor.each(function (err, row) {
                if (err || !row.new_val) {
                    return;
                } else {
                    return callback(row);
                }
            });
        });
    };

    this.getStreamScore = function (callback) {
        r.table('score').get('score').changes().run(connection, function (err, cursor) {
            if (err) throw err;
            cursor.each(function (err, row) {
                if (err) callback(null);
                return callback(row);
            });
        });
    };

    this.getInitialData_results = function (callback) {
        r.table('results').run(connection, function (err, data) {
            if (err) {
                return callback(null);
            } else {
                return callback(data.toArray());
            }
        });
    }

    this.addUser = function (callback) {
        r.uuid().run(connection, function (err, id) {

            r.table('users').get('u').update({
                users: r.row('users').append({id: id})
            }).run(connection, function (err, cursor) {
                if (err) {
                    return callback(null);
                } else {
                    return callback({key: id});
                }
            })

        });
    };

    this.getResultById = function (id, callback) {
        r.table('results').get(id).run(connection, function (err, data) {
            if (err) {
                return callback(null);
            } else {
                return callback(data);
            }
        });
    };

    this.getResult = function (payload, callback) {

        qId = payload.qId;
        pId = payload.pId;

        r.table('results').get(qId)('results')
            .filter(function (item) {
                return item('pId').eq(pId)
            })
            .run(connection, function (err, data) {
                if (err) {
                    return callback(null);
                } else {
                    return callback(data);
                }
            })

    };

    this.addQuestion = function (callback) {
        r.uuid().run(connection, function (err, id) {
            r.table('questions').update({
                'questions': r.row('questions').append({id: id, active: false, questions: [], type: 'multi'})
            }).run(connection, function (err, cursor) {
                if (err) {
                    return callback(null);
                } else {
                    var obj = {};
                    obj.id = id;
                    obj.active = false;
                    obj.results = [];

                    //add to results
                    r.table('results').insert(obj).run(connection, function (err, cb) {
                        return callback({result: 'OK'});
                    })

                }
            })
        });
    };

    this.deleteQuestion = function (payload, callback) {

        var id = payload.id;
        var idx = payload.idx;

        r.table('questions').get('q')
            .update({'questions': r.row('questions').deleteAt(idx)})
            .run(connection, function (err, cb) {
                if (err) {
                    return callback(null);
                } else {
                    r.table('results').get(id).delete().run(connection, function (err, cb) {
                        return callback({result: 'OK'});
                    })
                }
            });

    };

    this.resetQuestions = function (callback) {
        r.table('questions')
            .update({
                'questions': r.row('questions').map(function (doc) {
                    return doc.merge({active: false})
                })
            })
            .run(connection).then(function () {
                r.table('results').update({active: false}).run(connection, function () {
                    callback({results: 'OK'});
                })
            }).error(function (err) {
                callback(null);
            })
    };

    this.updateActive = function (payload, callback) {

        var id = payload.id;
        var b = payload.b;

        r.table('questions').get('q')
            .update({
                'questions': r.row('questions').map(function (doc) {
                    return r.branch(doc('id').eq(id), doc.merge({active: b}), doc.merge({active: false}))
                })
            }).run(connection).then(function () {
            r.table('results').update({active: r.branch(r.row('id').eq(id), b, false)}).run(connection, function (err, cb) {
                return callback({result: 'OK'});
            })
        }).error(function (err) {
                return callback(null);
            })
    };

    this.updateMulti = function (obj, callback) {

        r.table('results').get('r')
            .update({results: arr})
            .run(connection)
            .then(function () {
                return callback({result: 'OK'});
            }).error(function (err) {
                return callback(null);
            })

    };

    this.updateArr = function (arr, callback) {

        r.table('questions').get('q')
            .update({questions: arr})
            .run(connection)
            .then(function () {
                return callback({result: 'OK'});
            }).error(function (err) {
                return callback(null);
            })

    };

    this.updateQ = function (payload, callback) {

        var idx = payload.idx;

        delete payload.idx;

        r.table('questions').get('q')
            .update({
                'questions': r.row('questions').changeAt(idx, r.row('questions').nth(idx).merge(payload))
            }).run(connection).then(function () {
            return callback({result: 'OK'});
        }).error(function (err) {
                return callback(null);
            })
    };

    this.updateMulti = function (payload, callback) {

        //first get index of current user

        var qId = payload.qId;
        var pId = payload.player;
        var pName = payload.playername;

        r.table('results').get(qId).run(connection, function (err, data) {
            var idx = checkPlayerexists(pId, data.results);

            if (idx === -1) {
                r.table('results').get(qId)
                    .update({
                        'results': r.row('results').append({
                            pId: pId,
                            pName: pName,
                            answer: payload.answer,
                            correct: payload.correct,
                            cnt: payload.int
                        })
                    })
                    .run(connection, function (err, cb) {
                        if (err) {
                            callback(null);
                        } else {
                            callback({result: 'OK'})
                        }
                    })
            } else {
                r.table('results').get(qId)
                    .update({
                        'results': r.row('results').changeAt(idx, {
                            pId: pId,
                            answer: payload.answer,
                            correct: payload.correct,
                            cnt: payload.int
                        })
                    })
                    .run(connection, function (err, cb) {
                        if (err) {
                            callback(null);
                        } else {
                            callback({result: 'OK'})
                        }
                    })
            }

        });

    };

    this.updateOpen = function (payload, callback) {

        var qId = payload.qId;
        var pId = payload.player;

        r.table('results').get(qId).run(connection, function (err, data) {

            r.table('results').get(qId)
                .update({'results': r.row('results').append({pId: pId, text: payload.text})})
                .run(connection, function (err, cb) {
                    if (err) {
                        callback(null);
                    } else {
                        callback({result: 'OK'})
                    }
                });
        })

    };

    this.getScore = function (callback) {
        r.table('results')
            .concatMap(function (s) {
                return s('results')
            })
            .hasFields('correct', 'cnt')
            .map(function (m) {
                return r.branch(m('correct'), m.merge({pts: 1}), m.merge({pts: 0}))
            })
            .group('pId', 'pName').map(function (gr) {
                return {pts: gr('pts'), cnt: gr('cnt')}
            })
            .reduce(function (left, right) {
                return {pts: left('pts').add(right('pts')), cnt: left('cnt').add(right('cnt'))}
            })
            .run(connection, function (err, data) {
                if (err) {
                    callback(null);
                } else {

                    var pairs = _und.chain(data).map(function(v,k) { return {id: v.group, total: v.reduction.pts,  duration: v.reduction.cnt} })
                    var s = firstBy('total', -1)
                        .thenBy('duration');
                    pairs.sort(s);

                    r.table('score').update({score: pairs._wrapped}).run(connection, function () {
                        callback(pairs._wrapped);
                    })
                }
            });
    };

}


//general functions

function checkPlayerexists(id, arr) {
    return _und.indexOf(_und.pluck(arr, 'pId'), id);
}

var firstBy = function(){function n(n,t){if("function"!=typeof n){var r=n;n=function(n,t){return n[r]<t[r]?-1:n[r]>t[r]?1:0}}return-1===t?function(t,r){return-n(t,r)}:n}function t(t,u){return t=n(t,u),t.thenBy=r,t}function r(r,u){var f=this;return r=n(r,u),t(function(n,t){return f(n,t)||r(n,t)})}return t}();

