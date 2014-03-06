var http = require('http');
var fs = require('fs');
var libpath = require('path');
var liburl = require('url');
var express = require('express');

var global = require('./global.js');
var register = require('./register.js');
var login = require('./login.js');
var user = require('./user.js');
var character = require('./character.js');


// create the express application
var app = express();
app.use(express.bodyParser({
	keepExtensions: true,
	uploadDir: libpath.resolve(__dirname,'uploads')
}));


app.use(express.cookieParser());
app.use(express.session({secret: global.config.cookie_secret}));
app.set('views', 'templates');
app.set('view engine', 'jade');

// the global logger middleware
app.use(express.logger());

// route the registration pages
app.get('/register', global.renderPage('register'));
app.get('/post-register', global.renderPage('register'));
app.post('/register', register.register);
app.get('/register/verify', register.checkUsername);

// route the login pages
app.post('/login', login.processLogin);
app.post('/logout', login.processLogout);

// route the user pages
app.get('/:user([A-Za-z0-9_-]+)', user.userPage);

// route the character management pages
app.get('/newtoon', character.newCharacterPage);
app.post('/newtoon', character.newCharacterRequest);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/', character.servePage);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/json', character.serveJson);
app.post('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/json', character.pushJson);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/avatar', character.serveAvatar);
app.post('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)/avatar', character.saveAvatar);
app.get('/:user([A-Za-z0-9_-]+)/:char([A-Za-z0-9_-]+)', function(req,res,next){
	res.redirect(req.url + '/');
});


app.post('/killtoon', character.deleteCharacterRequest);
app.get('/killtoon', character.deleteCharacterPage);

// route the extra pages
app.get('/site/about', global.renderPage('about'));
app.get('/site/contact', global.renderPage('contact'));
app.get('/site/terms', global.renderPage('terms'));
app.get('/site/privacy', global.renderPage('privacy'));
app.get('/', global.renderPage('index'));

app.use('/static', express.static( libpath.resolve(__dirname,'static'), {maxAge: 24*60*60}));

// catch-all: serve static file or 404
app.use(function(req,res)
{
	global.error('File not found:', req.url, global.logLevels.warning);
	global.renderPage('404', {code: 404})(req,res);
	//res.send(404);
});

// start the server
http.createServer(app).listen(global.config.port);
global.log('Server running at http://localhost:'+global.config.port+'/');

