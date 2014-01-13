module.exports = function(err, req, res, next) {
    switch (err.name) {
        case 'ValidationError':
            res.statusCode = 400;
            res.json(err);
            return;

        case 'NotFoundError':
            res.statusCode = 404;
            res.json({ message: err.message });
            return;
    }

    next(err);
};