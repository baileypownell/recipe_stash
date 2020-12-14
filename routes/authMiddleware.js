

module.exports = function(req, res, next) {
    if (req.session.userId) {
        return next()
    } 

    return res.status(401).json({success: false, message: 'Access denied: No session for the user.'})
}
