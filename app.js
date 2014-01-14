
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var hash = require('./pass').hash;

var app = express();

var users = {
	admin: {name: 'admin'}
};

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
	})
}

function restrict(req, res, next){
	if (req.session.user) {
		next();
	} else {
		req.session.error = "Access denied!";
		res.redirect('/login');
	}
}

// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.json());
//app.use(express.urlencoded());
//app.use(express.methodOverride());

app.use(express.bodyParser());
app.use(express.cookieParser('s3f9jg3lfif9xm3jdASxkFPkrf930c234urKC'));
app.use(express.session());

app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
//if ('development' == app.get('env')) {
//  app.use(express.errorHandler());
//}

app.get('/', function(req, res){
	res.redirect('/login');
});

app.get('/login', function(req, res){
	res.render('login', { title: 'Login'})
});

app.post('/login', function(req, res){
	var username = req.body.user
	var password = req.body.pass

	authenticate(username, password, function(err, user){
		if (user) {
			console.log('Login: '+username+' from: '+req.connection.remoteAddress);
			req.session.user = username;
			req.session.cookie.maxAge = 1800000 //30m
			res.redirect('/home');
		} else {
			console.log('Invalid Login Attempt: '+username);
			res.redirect('/login');
		}
	})
});

app.get('/home', restrict, function(req, res){
	console.log('Directing '+req.session.user+' to /home');
	res.send('Home: <a href="/logout">logout</a>');
});

app.get('/logout', function(req, res){
	console.log('Logout: '+req.session.user);
	req.session.destroy(function(){
		res.redirect('/login');
	});
});


http.createServer(app).listen(app.get('port'), function(){
  console.log('Node.js server listening on port ' + app.get('port'));
});
