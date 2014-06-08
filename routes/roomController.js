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
    var roomCollection = db.get("rooms");

    roomCollection.find({_id : req.params.id},{},function(e, docs){
        var room = docs[0];

        var videoCollection = db.get("videos");

        videoCollection.find({roomid : String(room._id), isplaying : 1, hidden : 0},{},function(e, docs){
            console.log(room._id);
            res.render('room-view', { title: 'Room', room : room, video : docs[0]});
        });
    })
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