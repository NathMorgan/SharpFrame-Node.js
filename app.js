
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var account = require('./routes/account');
var room = require('./routes/room');
var http = require('http');
var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3002);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('domain', '127.0.0.1');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/search', routes.search);
app.get('/about', routes.about);
app.get('/register', account.getRegister);
app.post('/register', account.postRegister);
app.post('/login', account.login);
app.get('/logout', account.logout);
app.get('/rooms/getrooms', room.getrooms);
app.get('/rooms/view/:id', room.view);

http.createServer(app).listen(app.get('port'), app.get('domain'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});