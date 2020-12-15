const client = require('../db');

module.exports = function(req, res, next) {
    if (req.sessionID) {
        // get user_id from req.sessionID 
        client.query('SELECT user_id FROM session WHERE sid=$1', 
        [req.sessionID], 
        (err, res) => {
            if (err) return next(err)
            if (res.rows) {
                req.userID = res.rows[0].user_id
                next()
            }
        })
    } else {
        return res.status(401).json({success: false, message: 'Access denied: No session for the user.'})
    }

   
}
