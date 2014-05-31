var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/SharpFrame');

/*
 * GET register page.
 */

exports.register = function(req, res){
    res.render('room-register', { title: 'Register' });
};

/*
 * GET view page.
 */

exports.view = function(req, res){
    res.render('room-view', { title: 'Welcome to ' + req.params.id });
};

/*
 * GET rooms.
 */

exports.getrooms = function(req, res){
    var collection = db.get("rooms");
    collection.find({},{},function(e,docs){
        res.json(docs);
    })
};