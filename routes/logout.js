
exports.post = function(req, res, next) {
    req.session.destroy();
    res.send({ status: "OK" });
};