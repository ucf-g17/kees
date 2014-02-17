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

//app.use(express.favicon());
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
    console.log('GET / request, from: '+req.connection.remoteAddress); 

    if (req.session.user) {
        res.redirect('/home');
    }
    else {
        res.redirect('/login');
    }
});

app.get('/login', function(req, res){
        res.render('login', {title: 'KEES Login'});
        console.log('GET /login request, from: '+req.connection.remoteAddress);
});

app.post('/login', function(req, res){
        var username = req.body.user;
        var password = req.body.pass;

        //authenticate(username, password, function(err, user){
        //        if (user) {
        if (username=="admin" && password=="g17kees") {
            console.log('Login: '+username+', from: '+req.connection.remoteAddress);
            req.session.user = username;
            req.session.cookie.maxAge = 1800000; //30m
            res.redirect('/home');
            console.log('Directing '+req.session.user+' | '+req.connection.remoteAddress+' to /main');
        } else {
            console.log('Invalid Login Attempt: '+username+', from: '+req.connection.remoteAddress);
            res.redirect('/login');
        }
        //})
});

// app.get('/home', restrict, function(req, res){
// 	    res.render('home', {title: 'Home'});
// 	    console.log('GET /home request, from: '+req.connection.remoteAddress);
// });

app.get('/home', function(req, res){
	    res.render('home', {title: 'KEES Home'});
	    console.log('GET /home request, from: '+req.connection.remoteAddress);
});

app.get('/admin', function(req, res){
        res.render('admin', {title: 'KEES Admin'});
        console.log('GET /admin request, from: '+req.connection.remoteAddress);
});

app.get('/logout', function(req, res){
	    console.log('Logout: '+req.session.user+', from: '+req.connection.remoteAddress);
	    req.session.user = null;
	    //req.session.cookie = null;
	    //res.render('login', {title: 'Login'});
        res.redirect('/');
});

app.get('/unlock', function(req, res){
        console.log('GET /unlock request, from: '+req.connection.remoteAddress);

        child = exec('python /home/pi/command.py 0', function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            //if (error !== null) {
            //  console.log('exec error: ' + error);
            //}
        });

        res.redirect('/home');
});

app.get('/master', function(req, res){
        console.log('GET /master request, from: '+req.connection.remoteAddress);

        child = exec('python /home/pi/command.py 1', function (error, stdout, stderr) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            //if (error !== null) {
            //  console.log('exec error: ' + error);
            //}
        });

        res.redirect('/admin');
});

app.all('*', function(req, res){
  res.send(404);
})

http.createServer(app).listen(app.get('port'), function(){
		console.log('Express server listening on port ' + app.get('port'));
});