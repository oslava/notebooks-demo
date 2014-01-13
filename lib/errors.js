var util = require('util');
var http = require('http');

function HttpError(status, message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.status = status;
    this.message = message || http.STATUS_CODES[status] || "Unexpected Error";
}
util.inherits(HttpError, Error);
HttpError.prototype.name = 'HttpError';

function NotFoundError(id, message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, NotFoundError);

    this.id = id;
    this.message = message;
}
util.inherits(NotFoundError, Error);
NotFoundError.prototype.name = 'NotFoundError';

function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, AuthError);

    this.message = message;
}
util.inherits(AuthError, Error);
AuthError.prototype.name = 'AuthError';

exports.HttpError = HttpError;
exports.NotFoundError = NotFoundError;
exports.AuthError = AuthError;

exports.captureValidationErrorMessage = function(err) {
    if (err.errors) {
        for (var prop in err.errors) {
            var firstErr = err.errors[prop];
            if (firstErr.name == 'ValidatorError')
                return firstErr.message;
        }
    }

    return null;
};