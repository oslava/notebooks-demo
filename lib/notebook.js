var errors = require('./errors');

var mongoose = require('./mongooseConnect'),
    Schema = mongoose.Schema;

// Schemas
var Note = new Schema({
    title: { type: String, required: true },
    text: { type: String, required: false },
    modified: { type: Date, default: Date.now }
});

// Validation
Note.path('title').validate(function (t) {
    return t.length > 0 && t.length < 200;
});

var Book = new Schema({
    name: { type: String, required: true },
    userId: { type: String, required: true },
    visibility: { type: String, enum: ['private', 'hidden', 'public'], default: 'private' },
    notes: [Note],
    created: { type: Date, default: Date.now }
});

Book.statics.findBook = function(id, callback) {
    this.findById(id, function (err, book) {
        if (!err && !book)
            return callback(new errors.NotFoundError(id, 'Book Not Found'));
        callback(err, book);
    });
};

exports.BookModel = mongoose.model('Book', Book);
exports.NoteModel = mongoose.model('Note', Note);