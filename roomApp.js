//This code is ran on start-up of the node server

console.log("Starting the node.js server. Please wait");

var io = require('socket.io')(7070);
var mongoose = require('mongoose');

var db = mongoose.connect("mongodb://localhost/SharpFrame");

var roomSchema = mongoose.Schema({
    _id : mongoose.Schema.ObjectId,
    title : String,
    discription : String,
    videoid : String,
    videoStartTime : Number,
    videoEndTime : Number,
    ownerUsername : String,
    views : Number,
    connectedUsers : Number,
    icon : String
});

var Room = mongoose.model('Room', roomSchema);

var videoSchema = mongoose.Schema({
    _id : mongoose.Schema.ObjectId,
    roomid : String,
    link : String,
    title : String,
    length : Number,
    isplaying : Number,
    starttime : Number,
    endtime : Number,
    hidden : Number
});

var Video = mongoose.model('Video', videoSchema);

function getRooms(callback){
    Room.find({}, function(error, data){
        rooms = data;
        callback(rooms);
    });
}

function getVideos(callback){
    Video.find({}, function(error, data){
        videos = data;
        callback(videos);
    });
}

var rooms;
var videos;

getRooms(function(data){
    var rooms = data;
});

getVideos(function (data){
    var videos = data;
});

console.log("Finished startup");

//End of start-up code


io.sockets.on('connection', function (socket) {

    //Socket is fired to find out the delay between the client and server
    socket.on('ping', function (data) {
        socket.emit("pong", new Date().getTime());
    });

    //Socket is fired to setup the user when he joins the room
    socket.on('joinroom', function (data) {

        var values = JSON.parse(data);

        //Finding the room
        rooms.forEach(function(room) {

            if(String(room._id) == values.roomid) {
                console.log("Room Found!");
                socket.room = room;
                socket.join(room._id);
            }
            else
                console.log("cant find the room");
        });

        //Finding the video to the room
        videos.forEach(function(video) {

            if(video.roomid == String(socket.room._id)) {

                if(video.isplaying == 1) {

                    socket.video = video;
                    console.log("Found the video");
                }
            }
        });

        //Adding one to the current views on the video and update the database
        socket.room.views = socket.room.views + 1;
        socket.room.connectedUsers = io.sockets.clients(socket.room._id).length;
        socket.room.save();

        //Adding the user to the socket session and broadcasting to users in the room
        socket.username = values.username;
        socket.broadcast.to(socket.room._id).emit("servermessage", socket.username + " has joined");
        socket.emit("servermessage", "Welcome to " + socket.room.title)

        //Sending the video time to the connected user
        var videotimearray = { "currenttime" : Math.round((new Date()).getTime() / 1000) , "videostarttime" : socket.video.starttime }
        socket.emit("videoTime", JSON.stringify(videotimearray));
    });
});