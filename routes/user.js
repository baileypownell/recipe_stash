const { Router } = require('express');
const client = require('../db');
const router = Router();

router.get('/', (request, response, next) => {
  let userId = request.session.userId;
  client.query('SELECT * FROM users WHERE id=$1',
  [userId],
   (err, res) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (res.rows.length === 0) {
      response.status(403).send('No session found.')
    } else if (res.rows.length === 1) {
      response.status(200).json(res)
    }
  });
});

router.delete('/', (request, response, next) => {
  let id = request.session.userId;
  if (id) {
    client.query('DELETE FROM users WHERE id=$1',
    [id],
     (err, res) => {
      if (err) {
        console.log(err)
        return next(err);
      }
      if (res) {
        client.query('DELETE FROM recipes WHERE user_id=$1',
        [id],
        (err, res) => {
          if (err) {
            return next(err);
          }
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
    });
  } else {
    return response.status(403).json({success: false, message: 'No session for the user.'})
  }  
});

module.exports = router;