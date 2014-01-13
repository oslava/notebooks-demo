var HttpError = require('../lib/errors').HttpError;

module.exports = function(req, res, next) {
    if (!req.session.userId) {
        return next(new HttpError(401));
    }

    next();
};