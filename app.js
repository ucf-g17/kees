var express = require('express');
//var routes = require('./routes');
var http = require('http');
var path = require('path');

//var mongo = require('mongodb');
//var monk = require('monk');
//var db = monk('localhost:27017/kees');

var app = express();

var sys = require('sys');
var exec = require('child_process').exec, child;

app.locals.appname = 'KEES';

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.json());
app.use(express.urlencoded());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9'}));

//app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(app.router);

// development only
//if ('development' == app.get('env')) {
//  app.use(express.errorHandler());
//}



app.get('/', function(req, res) {
        console.log('GET / | '+req.connection.remoteAddress); 
        req.session.user ? res.redirect('/home') : res.redirect('/login');
});
app.get('/login', function(req, res){
        console.log('GET /login | '+req.connection.remoteAddress);
        res.render('login', { title:'KEES Login'} );
});
app.post('/login', function(req, res){
        //console.log('POST /login | '+req.conecction.remoteAddress);
        var username = req.body.user;
        var password = req.body.pass;

        if (username=="admin" && password=="g17kees") {
            req.session.user = username;
            req.session.cookie.maxAge = 1800000; //30m
            res.redirect('/home');
            console.log('redirect /home | '+req.session.user+' | '+req.connection.remoteAddress);
            console.log('valid login');
        } else {
            console.log('redirect /login | '+req.connection.remoteAddress);
            console.log('invalid login');
            res.redirect('/login');
        }
});
app.get('/home', function(req, res){
        console.log('GET /home | '+req.connection.remoteAddress);
	    res.render('home', { title:'KEES Home'} );
});
app.get('/admin', function(req, res){
        console.log('GET /admin | '+req.connection.remoteAddress);
        res.render('admin', { title:'KEES Admin'} ); 
});
app.get('/logout', function(req, res){
	    console.log('GET /logout | '+req.session.user+' '+req.connection.remoteAddress);
	    req.session.user = null;
        res.redirect('/');
});
app.get('/unlock', function(req, res){
        console.log('GET /unlock | '+req.connection.remoteAddress);
        child = exec('python /home/pi/command.py 0');
});
app.get('/master', function(req, res){
        console.log('GET /master | '+req.connection.remoteAddress);
        var mode = req.param('mode');
        child = exec('python /home/pi/command.py 1');
});
app.get('/addguest', function(req, res){
        console.log('GET /addguest | '+req.connection.remoteAddress);
        var name = req.param('name');
        child = exec('/home/pi/addguest '+name);
});
app.all('*', function(req, res){
  res.send(404);
})

http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
});