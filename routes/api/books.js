var BookModel = require('../../lib/notebook').BookModel;
var HttpError = require('../../lib/errors').HttpError;

exports.list = function(req, res, next) {
    BookModel.find({ userId: req.session.userId })
        .sort({created: -1})
        .exec(function (err, books) {
            if (err) return next(err);
            res.send(books);
        });
};

exports.create = function(req, res, next) {
    var book = new BookModel({
        name: req.body.name,
        userId: req.session.userId
    });
    if (req.body.visibility)
        book.visibility = req.body.visibility;

    book.save(function (err) {
        if (err) return next(err);
        res.send(book);
    });
};

exports.read = function(req, res, next) {
    BookModel.findBook(req.params.id, function (err, book) {
        if (err) return next(err);

        if (book.userId != req.session.userId)
            return next(new HttpError(403));

        res.send(book);
    });
};

exports.update = function(req, res, next) {
    BookModel.findBook(req.params.id, function (err, book) {
        if (err) return next(err);

        if (book.userId != req.session.userId)
            return next(new HttpError(403));

        book.name = req.body.name;
        if (req.body.visibility)
            book.visibility = req.body.visibility;

        book.save(function (err) {
            if (err) return next(err);
            res.send(book);
        });
    });
};

exports.delete = function(req, res, next) {
    BookModel.findById(req.params.id, function (err, book) {
        if (err) return next(err);

        if (!book)
            return res.send({ deleted: 0 });

        if (book.userId != req.session.userId)
            return next(new HttpError(403));

        BookModel.findById(req.params.id).remove(function(err, affected) {
            if (err) return next(err);
            res.send({ deleted: affected });
        });
    });
};