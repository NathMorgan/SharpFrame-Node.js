$(document).ready(function(){

    //Creating an array that will store the breadcrumb of the user
    var pageArray = [];

    //Creating an array that will store the pages html
    var pages = [];

    //Creating an array that will store the projects
    var projects = [];

    //Creating an array to store the rooms
    var rooms = [];

    var startOfArray;

    var supportshtml5 = true;

    var History = window.History;

    var player;

    var socket;

    var totaltime;

    initialize();

    function initialize(){
        //Adding the first value to the page array of where the user landed on the site
        pageArray.push($("head title").text().toLowerCase());
        startOfArray = pageArray.length - 1;

        //Checking to see if the users browser supports html5 history
        if(!History.enabled){
            alert("This site works better on a browser that supports HTML5. Please upgrade to get the best content.");
            supportshtml5 = false;
        }

        //Adding the first landed page to the web browsers history
        History.pushState({}, pageArray[startOfArray], $("#" + pageArray[startOfArray]).find("a").attr('href'));

        $.when($.get('/'), $.get('/search'), $.get('/about'), $.get('/register'))
            .done(function(home, search, about,register){
                //Caching the other html pages for increased speeds
                pages.push({Name: "home", HTML: $(home[0]).find("main").html()});
                pages.push({Name: "search", HTML: $(search[0]).find("main").html()});
                pages.push({Name: "about", HTML: $(about[0]).find("main").html()});
                pages.push({Name: "register", HTML: $(register[0]).find("main").html()});
        });

        $.getJSON('/rooms/getrooms', function(roomsarray){
            rooms = roomsarray;

            if(pageArray[startOfArray] == "room")
                loadVideo();
            else if(pageArray[startOfArray] == "home")
                displayRooms();
        });

        //Rebinding events on some pages
        ReBindEvents(pageArray[startOfArray]);

        $("#" + pageArray[startOfArray]).addClass("active");
    }

    $(".nav-link").click(function(event){
        //Preventing the links from firing making the user leave the page. If the users' browser does not support
        // then it will allow page to leave
        if(supportshtml5)
            event.preventDefault();

        //Checking to see if the clicked link is the currently displayed one preventing from it loading a page
        // that is already loaded
        if($(this).attr('id') == pageArray[startOfArray])
            return false;

        //Changing the CSS of the current navigation text to default
        $("#" + pageArray[startOfArray]).removeClass("active");

        //Adding the new clicked page to the array
        pageArray.push($(this).attr('id'));
        startOfArray = startOfArray + 1;

        //Changing the CSS of the clicked navigation to being clicked
        $("#" + pageArray[startOfArray]).addClass("active");

        //Getting the html of the page that is selected, animating it and then storing the page
        //in the web browsers history

        pages.forEach(function(page){
            if(page.Name == pageArray[startOfArray]){
                $("main").html(page.HTML);

                if(page.Name == "home"){
                    displayRooms();
                }
            }
        });

        //Rebinding events on some pages
        ReBindEvents(pageArray[startOfArray]);

        History.pushState({}, pageArray[startOfArray], $("#" + pageArray[startOfArray]).find("a").attr('href'));

    });

    //This bind gets fired when there is a history change such as going forward or backwards in the history
    History.Adapter.bind(window,'statechange',function() {

        //Getting the history state
        var state = History.getState();

        //Getting the html of the page that is selected, animating it and then storing the page
        //in the web browsers history

        pages.forEach(function(page){
            if(page.Name == state.title){
                $("main").html(page.HTML);

                if(page.Name == "home"){
                    displayRooms();
                }
            }
        });

        //Rebinding events on some pages
        ReBindEvents(state.title);

        //Removing the last page from the array
        pageArray.shift();
        startOfArray = startOfArray - 1;

        //Changing the navigation select classes
        $(".buttonnav li").removeClass("active");
        $("#" + state.title).addClass("active");
    });

    function loadVideo(){
        //Setting the video size before it is loaded
        $("#player").attr("width", $("#playerBox").width());
        $("#player").attr("height", $("#playerBox").height());

        //Connecting to the websocket server
        var socket = io.connect("http://chat.sharpframe.co.uk:8080");

        //Setting up the video object
        $("#player").mediaelementplayer({
            success: function(mediaElement, domObject) {
                if (mediaElement.pluginType == "flash") {
                    mediaElement.addEventListener("canplay", function() {
                        //mediaElement.setCurrentTime("20");
                        // Player is ready
                        mediaElement.play();
                    }, false);
                }
            },
            error: function() {
                alert("Error");
            }
        });

        socket.emit("ping", "");

        socket.on("pong", function(){

        });


    }

    function displayRooms(){
        var roomhtml = "";

        rooms.forEach(function(room){
            roomhtml += '<div class="videoBox" id="' + room._id + '">';
            roomhtml += '<article>';
            roomhtml += '<h4>' + room.title + '</h4>';
            roomhtml += '<img src="/uploads/icons/' + room.icon + '" />';
            roomhtml += '</article>';
            roomhtml += '</div>';
        });

        $(".videoRow").html(roomhtml);
    }

    function ReBindEvents(pagename){
        switch(pagename){
            case 'register' :
                RegisterValidation();
                break;
            case 'home' :
                VideoClick();
                break;
        }
    }

    function RegisterValidation(){
        $('.input-group input[required], .input-group textarea[required], .input-group select[required]').on('keyup, change', function() {
            var $group = $(this).closest('.input-group'),
                $addon = $group.find('.input-group-addon'),
                $icon = $addon.find('span'),
                state = false;

            if (!$group.data('validate')) {
                state = $(this).val() ? true : false;
            }else if ($group.data('validate') == "email") {
                state = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($(this).val())
            }else if($group.data('validate') == 'phone') {
                state = /^[(]{0,1}[0-9]{3}[)]{0,1}[-\s\.]{0,1}[0-9]{3}[-\s\.]{0,1}[0-9]{4}$/.test($(this).val())
            }else if ($group.data('validate') == "length") {
                state = $(this).val().length >= $group.data('length') ? true : false;
            }else if ($group.data('validate') == "number") {
                state = !isNaN(parseFloat($(this).val())) && isFinite($(this).val());
            }else if ($group.data('validate') == "date") {
                state = /^\d{4}-\d{1,2}-\d{1,2}$/.test($(this).val())
            }

            if (state) {
                $addon.removeClass('danger');
                $addon.addClass('success');
            }else{
                $addon.removeClass('success');
                $addon.addClass('danger');
            }
        });
    }

    function VideoClick(){
        $(".videoRow").on("click", ".videoBox", function(){

            //Getting the room HTML
            $.get('/rooms/view/' + $(this).attr("id"), function(room){
                $("main").html($(room).find("main").html());
            });

            //Removing the selected navigation button
            $(".buttonnav li").removeClass("active");

            //Adding the current selected room to the history
            History.pushState({}, "viewRoom", "/rooms/view/" + $(this).attr("id"));

            loadVideo();
        });
    }
});

