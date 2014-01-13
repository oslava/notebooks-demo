var User = require('../lib/user').User;
var errors = require('../lib/errors'),
    HttpError = errors.HttpError;

exports.post = function(req, res, next) {
    if (req.session.userId)
        return next(new HttpError(400, 'You are already logged in.'));

    var user = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    user.save(function(err) {
        if (err) {
         if (err.name == 'ValidationError')
            return next(new HttpError(400, errors.captureValidationErrorMessage(err)));
         else
            return next(err);
        }

        req.session.userId = user._id;
        req.user = user;
        res.send({ userId: user._id });
    });
};