module.exports = function(err, req, res, next) {
    if (typeof err == 'number') {
        res.send(err);
        return;
    }

    console.error(err.stack);

    if (err.status) res.statusCode = err.status;
    if (res.statusCode < 400) res.statusCode = 500;
    res.json({ message: err.message });
};