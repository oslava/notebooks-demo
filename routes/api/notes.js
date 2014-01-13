var BookModel = require('../../lib/notebook').BookModel;
var NoteModel = require('../../lib/notebook').NoteModel;
var errors = require('../../lib/errors');

exports.create = function(req, res, next) {
    BookModel.findBook(req.params.id, function (err, book) {
        if (err) return next(err);

        var note = new NoteModel({
            title: req.body.title,
            text: req.body.text
        });

        book.notes.push(note);
        book.save(function (err) {
            if (err) return next(err);
            res.send(note);
        });
    });
};

exports.update = function(req, res, next) {
    BookModel.findBook(req.params.id, function (err, book) {
        if (err) return next(err);

        var note = book.notes.id(req.params.noteId);
        if (!note) return next(new errors.NotFoundError(req.params.noteId, 'Note Not Found'));

        note.title = req.body.title;
        note.text = req.body.text;
        note.modified = Date.now();

        book.save(function (err) {
            if (err) return next(err);
            res.send(note);
        });
    });
};

exports.delete = function(req, res, next) {
    BookModel.findBook(req.params.id, function (err, book) {
        if (err) return next(err);

        var note = book.notes.id(req.params.noteId);

        if (note) {
            note.remove();
            book.save(function (err) {
                if (err) return next(err);
                res.send({ deleted: 1 });
            });
        }
        else {
            res.send({ deleted: 0 });
        }
    });
};