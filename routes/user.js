const { Router } = require('express');
const client = require('../db');
const router = Router();

router.get('/', (request, response, next) => {
  let userId = request.session.userId;
  client.query('SELECT * FROM users WHERE id=$1',
  [userId],
   (err, res) => {
    if (err) return next(err)
    if (res.rows.length) {
      response.status(200).json(res)
    } else {
      response.status(403).send('No session found.')
    }
  });
});

router.delete('/', (request, response, next) => {
  if (!request.session.userId) {
    return response.status(403).json({success: false, message: 'Access denied: No session for the user.'})
  }
  let id = request.session.userId;
  client.query('DELETE FROM users WHERE id=$1',
  [id],
    (err, res) => {
    if (err) return next(err)
    if (res) {
      client.query('DELETE FROM recipes WHERE user_id=$1',
      [id],
      (err, res) => {
        if (err) return next(err)
        if (res) {
          request.session.regenerate(() => {
            return response.status(200).json({success: true});
          });
        } else {
          return response.status(500).json({success: false, message: 'Could not delete user.'})
        }
      });
    } else {
      return response.status(500).json({success: false, message: 'Could not delete user.'})
    }
  })
})

module.exports = router;