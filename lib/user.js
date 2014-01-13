var bcrypt = require('bcrypt-nodejs');
var AuthError = require('../lib/errors').AuthError;

var mongoose = require('./mongooseConnect'),
    Schema = mongoose.Schema;

var userSchema = new Schema({
    username: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: false },
    email: { type: String },
    created: { type: Date, default: Date.now }
});

userSchema.path('email').validate(function (val) {
    if (val) {
        var regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(val);
    } else {
        if (this.email == '')
            this.email = null;
        return true;
    }
});

userSchema.virtual('password')
    .set(function(password) {
        // The salt is generated automatically and stored with hash.
        this.passwordHash = password ? bcrypt.hashSync(password) : null;
    });

userSchema.methods.checkPassword = function(password) {
    return bcrypt.compareSync(password || '', this.passwordHash);
};

userSchema.statics.authenticate = function(username, password, callback) {
    var User = this;

    User.findOne({ username: username }, function(err, user) {
        if (err)
            return callback(err);

        if (!user)
            return callback(new AuthError("User not found."));

        if (!user.checkPassword(password))
            return callback(new AuthError("The password is incorrect."));

        callback(null, user);
    });
};

var User = mongoose.model('User', userSchema)

userSchema.pre('save', function(next) {
    var self = this;

    User.findOne({ username: self.username }, function(err, user) {
        if (err)
            return next(err);

        if (user && (user._id != self._id)) {
            next(new Error('The username is already in use.'));

            /* doesn't really work
            self.invalidate('username', 'The Username is already in use.', self.username);
            self.validate(function(err3) {
                console.log(self.$__.validationError);
                console.log(err3);
            });
            */
        }

        next();
    });
});

exports.User = User;


