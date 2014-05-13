$(document).ready(function(){

    //Creating an array that will store the breadcrumb of the user
    var pageArray = [];

    //Creating an array that will store the pages html
    var pages = [];

    //Creating an array that will store the projects
    var projects = [];

    var startOfArray;

    var supportshtml5 = true;

    var History = window.History;

    initialize();

    function initialize(){
        //Adding the first value to the page array of where the user landed on the site
        pageArray.push($("#" + $("head title").text().toLowerCase()));
        startOfArray = pageArray.length - 1;

        //Checking to see if the users browser supports html5 history
        if(!History.enabled){
            alert("This site works better on a browser that supports HTML5. Please upgrade to get the best content.");
            supportshtml5 = false;
        }

        //Adding the first landed page to the web browsers history
        History.pushState({}, pageArray[startOfArray].attr('id'), $(pageArray[startOfArray]).find("a").attr('href'));

        $.when($.get('/'), $.get('/search'), $.get('/about'), $.get('/register'), $.get('/login')).done(function(home, search, about,
                                                                                                                 register, login){
            //Caching the other html pages for increased speeds
            pages.push({Name: "home", HTML: $(home[0]).find("main").html()});
            pages.push({Name: "search", HTML: $(search[0]).find("main").html()});
            pages.push({Name: "about", HTML: $(about[0]).find("main").html()});
            pages.push({Name: "register", HTML: $(register[0]).find("main").html()});
            pages.push({Name: "login", HTML: $(login[0]).find("main").html()});

        });
    }

    $(".nav-link").click(function(event){
        //Preventing the links from firing making the user leave the page. If the users' browser does not support
        // then it will allow page to leave
        if(supportshtml5)
            event.preventDefault();

        //Checking to see if the clicked link is the currently displayed one preventing from it loading a page
        // that is already loaded
        if($(this).attr('id') == pageArray[startOfArray].attr('id'))
            return false;

        //Changing the CSS of the current navigation text to default
        //pageArray[startOfArray].css({"color" : "#4d4d4d"});
        //pageArray[startOfArray].css({"cursor" : "pointer"});

        //Adding the new clicked page to the array
        pageArray.push($(this));
        startOfArray = startOfArray + 1;

        //Changing the CSS of the clicked navigation to being clicked
        //pageArray[startOfArray].css({"color" : "darkblue"});
        //pageArray[startOfArray].css({"cursor" : "auto"});

        //Getting the html of the page that is selected, animating it and then storing the page
        //in the web browsers history

        pages.forEach(function(page){
            if(page.Name == pageArray[startOfArray].attr('id')){
                $("main").html(page.HTML);
            }
        });
        history.pushState({}, pageArray[startOfArray].attr('id'), $(pageArray[startOfArray]).find("a").attr('href'));

    });

    //This bind gets fired when there is a history change such as going forward or backwards in the history
    History.Adapter.bind(window,'statechange',function() {
        //Getting the history state
        var state = History.getState();

        //Shortening the link down from http://tuqiri.net/example to /example
        var link = /[^/]*$/.exec(state.url)[0];

        $.get("/" + link, function(data) {
            $("main").html($(data).find("main").html());
        });

        //Removing the last page from the array
        pageArray.shift();
        startOfArray = startOfArray - 1;
    });
});


