import client = require('./client')

const authMiddleware = (req, response, next) => {
    if (req.sessionID) {
        // get user_id from req.sessionID
        client.query('SELECT user_uuid FROM session WHERE sid=$1',
        [req.sessionID],
        (err, res) => {
            if (err) return next(err)
            if (res.rows.length && res.rows[0].user_uuid) {
                req.userID = res.rows[0].user_uuid
                next()
            } else {
                return response.status(401).json({ success: false, message: 'Access denied: No session for the user.'})
            }
        })
    } else {
        return response.status(401).json({success: false, message: 'Access denied: No session for the user.'})
    }
}

export { authMiddleware }