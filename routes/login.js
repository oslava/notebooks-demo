var User = require('../lib/user').User;
var AuthError = require('../lib/errors').AuthError;
var HttpError = require('../lib/errors').HttpError;

exports.post = function(req, res, next) {
    if (!req.body.username)
        return next(new HttpError(400, 'Missing Username.'));
    if (!req.body.password)
        return next(new HttpError(400, 'Missing Password.'));

    if (req.session.userId)
        return next(new HttpError(400, 'You are already logged in.'));

    var username = req.body.username;
    var password = req.body.password;

    User.authenticate(username, password, function(err, user) {
        if (err) {
            if (err instanceof AuthError) {
                return next(new HttpError(403, 'Login failed. Please check username and password.'));
            } else {
                return next(err);
            }
        }

        req.session.userId = user._id;
        req.user = user;
        res.send({ userId: user._id });
    });
};