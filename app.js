var express = require('express');
var path = require('path');
var config = require('./config');
var mongoose = require('./lib/mongooseConnect');

var app = express();

// all environments
app.engine('ejs', require('ejs-locals'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.cookieParser());

var MongoSessionStore = require('connect-mongo')(express);

app.use(express.session({
    secret: config.get('session:secret'),
    cookie: config.get('session:cookie'),
    store: new MongoSessionStore({ mongoose_connection: mongoose.connection })
}));

app.use('/api', require('./middleware/authorization'));
app.use('/your', function(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/');
    }

    next();
});

app.use(require('./middleware/userAuthentication'));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
    next(404);
});

// error handlers
app.use('/api', require('./middleware/apiErrorHandler'));
app.use(require('./middleware/errorHandler'));

require('./routes')(app);

app.listen(config.get('port'), function(){
    console.log('Express server listening on port ' + config.get('port'));
});