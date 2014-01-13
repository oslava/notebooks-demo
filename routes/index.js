var books = require('./api/books');
var notes = require('./api/notes');

module.exports = function(app) {
    app.get('/', function(req, res, next) {
        res.render('index');
    });
    app.get('/your', function(req, res, next) {
        res.render('notebooks');
    });
    app.get('/explore', function(req, res, next) {
        res.render('explore');
    });

    app.post('/login', require('./login').post);
    app.post('/logout', require('./logout').post);
    app.post('/register', require('./register').post);

    app.get('/api/v1/books', books.list);

    // CRUD for books
    app.post('/api/v1/books', books.create);
    app.get('/api/v1/books/:id', books.read);
    app.put('/api/v1/books/:id', books.update);
    app.delete('/api/v1/books/:id', books.delete);

    // CRUD without Read for notes
    app.post('/api/v1/books/:id/notes', notes.create);
    app.put('/api/v1/books/:id/notes/:noteId', notes.update);
    app.delete('/api/v1/books/:id/notes/:noteId', notes.delete);
};