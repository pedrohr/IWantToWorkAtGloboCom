
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , database = require('./database')
  , participants_config = require('./participants.js')
  , routes = require('./routes');

var app = express();

app.configure(function(){
  app.set('port', process.env.PORT || 8080);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.post('/vote/:id', routes.vote);
app.get('/statistics', routes.stats);

var numParticipants = participants_config.participants.length;

database.initialize(numParticipants, function() {
    http.createServer(app).listen(app.get('port'), function(){
	console.log("Server listening on port " + app.get('port'));
    });
});