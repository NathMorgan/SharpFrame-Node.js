var mongo = require('mongodb');
var monk = require('monk');
var db = monk('localhost:27017/SharpFrame');

/*
 * GET register page.
 */

exports.getRegister = function(req, res){
    res.render('register', { title: 'Register' });
};

/*
 * POST register page.
 * Username
 * Password
 * Email
 * Date Of Birth
 */

exports.postRegister = function(req, res){
    var post = req.body;

    var usercollection = db.get("users");

    usercollection.insert({username : post.username, email : post.email, datetime : new Date().getTime(), password : post.password});

    console.log("User made");
};

/*
 * POST login.
 * Username
 * Password
 */

exports.login = function(req, res){
    var post = req.body;

    // Checking to see if the username and password are valid
    if(!post.username)
        return false;

    if(!post.password)
        return false;

    // Finding the user to the username in the database
    var usercollection = db.get("users");
    usercollection.find({username : post.username},{},function(error, user){
        if(post.username == user.username && post.password == user.password){

            res.json("true");
        }
        else
            res.json("false");
    });
};

/*
 * GET logout page.
 */

exports.logout = function(req, res){
    res.render('logout', { title: 'Logout' });
};