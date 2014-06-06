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
        rooms.forEach(function (room) {

            if (String(room._id) == values.roomid) {
                console.log("Room Found!");
                socket.room = room;
                socket.join(room._id);
            }
            else
                console.log("cant find the room");
        });

        //Finding the video to the room
        videos.forEach(function (video) {

            if (video.roomid == String(socket.room._id)) {

                if (video.isplaying == 1) {

                    socket.video = video;
                    console.log("Found the video");
                }
            }
        });

        //Adding the user to the socket session and broadcasting to users in the room
        socket.username = values.username;
        socket.broadcast.to(socket.room._id).emit("servermessage", socket.username + " has joined");
        socket.emit("servermessage", "Welcome to " + socket.room.title)
    });

    socket.on('getVideoTime' ,function(data){
        //Sending the video time to the connected user
        var videotimearray = { "currenttime" : Math.round((new Date()).getTime() / 1000) , "videostarttime" : socket.video.starttime }
        socket.emit("videotime", JSON.stringify(videotimearray));
    });

    setInterval(function() {
        videos.forEach(function(video){
            if(video.endtime < Math.round((new Date()).getTime() / 1000)){
                if(video.isplaying != 0){
                    console.log("change video");
                    ChangeVideo(video);
                }
            }
        });
    }, 5000);

    function ChangeVideo(video) {
        //Ending the current playing video
        video.isplaying = 0;
        video.hidden = 1;

        video.save();

        Video.findOne({ roomid : video.roomid, hidden : 0, isplaying : 0}, function(err, data){
            //if data is not null then videos are found and sets the video up to played if not continues with the current video
            if(data != null) {
                videos.forEach(function(video) {
                    if (video.id == data.id) {
                        console.log("Found video");

                        video.isplaying = 1;
                        video.hidden = 0;
                        video.starttime = Math.round((new Date()).getTime() / 1000);
                        video.endtime = Math.round((new Date()).getTime() / 1000) + video.length;

                        video.save();

                        socket.video = video;

                        socket.emit("resetvideo", "");
                    }
                });
            }
            else {
                console.log("No videos");
                video.isplaying = 1;
                video.hidden = 0;
                video.starttime = Math.round((new Date()).getTime() / 1000);
                video.endtime = Math.round((new Date()).getTime() / 1000) + video.length;

                video.save();

                socket.video = video;

                socket.emit("resetvideo", "");
            }
        });

        console.log("video changed");
    }
});

