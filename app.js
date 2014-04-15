var exec = require('child_process').exec, child;
var express = require('express');
var fs = require('fs');
var hash = require('./pass').hash;
var http = require('http');
var path = require('path');
var sys = require('sys');
var users = { admin: {name: 'admin'} };

hash('g17kees', function(err, salt, hash){
  if (err) throw err;
  users.admin.salt = salt;
  users.admin.hash = hash;
});

function authenticate(name, pass, fn){
    var user = users[name];

    if (!user) return fn(new Error('user not found'));

    hash(pass, user.salt, function(err, hash){
        if (err) return fn(err);
        if (hash == user.hash) return fn(null, user);
        fn(new Error('invalid password'));
    });
}

function restrict(req, res, next){
    if (req.session.user) {
        next();
    } else {
        req.session.error = "Access denied!";
        res.redirect('/login');
    }
}

// setup
var app = express();
app.locals.appname = 'KEES';

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// dependencies
app.use(express.favicon());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({secret: '59B93087-78BC-4EB9-993A-A61FC844F6C9'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(app.router);


app.get('/', function(req, res) {
        console.log('GET / | '+req.connection.remoteAddress); 
        req.session.user ? res.redirect('/home') : res.redirect('/login');
});

app.get('/login', function(req, res){
        console.log('GET /login | '+req.connection.remoteAddress);
        res.render('login', { title:'KEES Login'} );
});

app.post('/login', function(req, res){
        var username = req.body.user;
        var password = req.body.pass;

        // if (username=="admin" && password=="g17kees") {
        //     req.session.user = username;
        //     req.session.cookie.maxAge = 1800000; //30m
        //     res.redirect('/home');
        //     console.log('redirect /home | '+req.session.user+' | '+req.connection.remoteAddress);
        //     console.log('valid login');
        // } else {
        //     console.log('redirect /login | '+req.connection.remoteAddress);
        //     console.log('invalid login');
        //     res.redirect('/login');
        // }

        authenticate(username, password, function(err, user){
            if (user) {
                req.session.user = username;
                //req.session.cookie.maxAge = 1800000 //30m
                req.session.cookie.maxAge = 7200000 //2h
                res.redirect('/home');
                console.log('redirect /home | '+req.session.user+' | '+req.connection.remoteAddress);
                console.log('valid login');
            } else {
                console.log('redirect /login | '+req.connection.remoteAddress);
                console.log('invalid login: '+username);
                res.redirect('/login');
            }
        });        
});

app.get('/home', restrict, function(req, res){
        console.log('GET /home | '+req.connection.remoteAddress);
	    res.render('home', { title:'KEES Home'} );
});

app.get('/admin', restrict, function(req, res){
        console.log('GET /admin | '+req.connection.remoteAddress);
        res.render('admin', { title:'KEES Admin'} ); 
});

app.get('/logout', restrict, function(req, res){
	    console.log('GET /logout | '+req.session.user+' '+req.connection.remoteAddress);
        req.session.destroy(function(){
            res.redirect('/login');
        });
});

app.get('/unlock', restrict, function(req, res){
        console.log('GET /unlock | '+req.connection.remoteAddress);
        child = exec('python /home/pi/command.py 2');
        res.redirect('/home');
});

app.get('/master', restrict, function(req, res){
        console.log('GET /master | '+req.connection.remoteAddress);
        child = exec('python /home/pi/command.py 4');
        res.redirect('/admin');
});

app.get('/addguest', restrict, function(req, res){
        console.log('GET /addguest | '+req.connection.remoteAddress);
        var name = req.param('name');
        child = exec('/home/pi/RaspicamC++/raspicam-0.0.6/JoshProjects/AddGuest/build/addGuest '+name);
        res.redirect('/home');
});

//remove guest from guests.txt file
app.get('/removeguest', restrict, function(req, res){
        console.log('GET /removeguest | '+req.connection.remoteAddress);

        var name = req.param('name');

        fs.readFile('/home/pi/data/guests.txt', function(err, data){
            if(!err) {
                var ls = data.toString().replace(name, ' ');
                fs.writeFile('/home/pi/data/guests.txt', ls);
            }
        });
});

//send list of history to client
app.get('/history', restrict, function(req, res){
        console.log('GET /history | '+req.connection.remoteAddress);

        fs.readFile('/home/pi/data/hist_master.txt', function(err, data) {
            if(!err) {

                var ls = data.toString().split("\n");
                var cn = [];

                if(ls.length > 25) {
                    for(i=0; i<25; i++) 
                        cn[i] = ls[i];
                }
                else {
                    for(i in ls)
                        cn[i] = ls[i];
                }

                // ** DEBUG
                //
                // for(i in cn) {
                //     console.log(cn[i]);
                // }

                res.write(JSON.stringify(cn));
                res.end();
            }
        });
});

//send list of guests to client
app.get('/guests', restrict, function(req, res){
        console.log('GET /guests | '+req.connection.remoteAddress);

        fs.readFile('/home/pi/data/guests.txt', function(err, data) {
            if(!err) {
                var ls = data.toString().split('\n');
                var cn = [];

                for(i=0; i<ls.length-1; i++)
                    cn[i] = ls[i];

                res.write(JSON.stringify(cn));
                res.end();
            }
        });
});

app.all('*', function(req, res){
        res.send(404);
});

http.createServer(app).listen(app.get('port'), function(){
        console.log('Express server listening on port ' + app.get('port'));
});