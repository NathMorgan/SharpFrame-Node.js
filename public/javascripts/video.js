var playerobject;
var videoid;
var videotime;
var videostarttime;
var delay;

var player = {
    playVideo: function() {
        //If the youtube player is new
        if (playerobject == null){
            console.log("new player");
            player.loadPlayer();
        }
        //Else its just a change of video
        else {
            console.log("player already running");
            playerobject.stopVideo();
            playerobject.loadVideoById(videoid, videotime);
            playerobject.playVideo();
        }
    },

    loadPlayer: function() {
        playerobject = new YT.Player("player", {
            width: 640,
            height: 390,
            playerVars: {
                'autoplay' : 1,
                'controls' : 0,
                'disablekb' : 1,
                'rel': 0,
                'showinfo' : 0
            },
            events: {
                'onReady': player.onPlayerReady,
                'onStateChange': player.onStateChange
            }
        });
    },

    onPlayerReady: function() {
        console.log("player ready");
        playerobject.loadVideoById(videoid, videotime);
        playerobject.playVideo();
    },

    onStateChange: function(event) {
        console.log("playerchange");
        if(event.data == YT.PlayerState.ENDED){
            console.log("player finished");
        }
        if(event.data == YT.PlayerState.PLAYING){
            playerobject.seekTo(videotime, true);
        }
    }
};

function calcVideoPosition(data){
    videotime = parseInt(data) - videostarttime;
}

function usermessage(){
    var message = document.getElementById("comment").value;
    if(message != "") {
        socket.emit("usermessage", message);
        document.getElementById("comment").value = "";
    }
}

var socket = io.connect("http://sharpframe.co.uk:8080");

var roomid = "{{room._id}}";

socket.emit("joinroom", JSON.stringify({ Roomid : "{{room._id}}", Username : "{{username}}"}));

socket.on("video", function (data) {
    videoid = data;
});

socket.on("videoTime", function (data) {
    var videotimearray = JSON.parse(data);
    videostarttime = parseInt(videotimearray.Videostarttime);
    delay = videotimearray.Currenttime - Math.round((new Date()).getTime() / 1000);
    calcVideoPosition(Math.round((new Date()).getTime() / 1000));
    player.playVideo();
});

socket.on("heartbeat", function(data) {
    var currenttime = parseInt(data);
    if((Math.round((new Date()).getTime() / 1000) - currenttime) != delay){
        delay = Math.round((new Date()).getTime() / 1000) - currenttime;
        calcVideoPosition(currenttime);
        player.playVideo();
    }
});

socket.on("servermessage", function(data) {
    var chatbox = document.getElementById('comments');
    var time = new Date();
    chatbox.innerHTML = chatbox.innerHTML + '<div>[' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + '] <span class="servermsg">Server:</span> ' + data + '</span></div>';
});

socket.on("usermessage", function(data) {
    var chatbox = document.getElementById('comments');
    var time = new Date();
    chatbox.innerHTML = chatbox.innerHTML + '<div>[' + time.getHours() + ':' + time.getMinutes() + ':' + time.getSeconds() + '] ' + data + '</span></div>';
});

$(document).keypress(function(key) {
    if(key.which == 13)
        usermessage();
});

function submitvideo(){
    $.ajax({
        type: "POST",
        url: "/room/newvideo/",
        data: {roomid : "{{room._id}}", youtubeurl : $('#videoinput').val()},
        success: function() {
            updateVideos();
        }
    });
}

function updateVideos()
{
    //Tried to get this to work no idea on why it doesent forEach should work on an array of objects but gives an error.
    $.get("/room/updatevideos/{{room._id}}", function(videos){
            $("#videolist").empty();

            var json = JSON.stringify(videos);

            JSON.parse(json).forEach(function(video){
                console.log(video);
            });

            /* $("#videolist").append('<div class="video">');
             if(i == 0)
             $("#videolist").append('Playing - ' + videos[i].title);
             else
             $("#videolist").append(i + ' - ' + videos[i].title);

             $("#videolist").append('</div>');*/
        }
    );
}