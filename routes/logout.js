const { Router } = require('express');
const router = Router();

router.get('/', (request, response, next) => {
    request.session.userId = null;
    request.session.regenerate(() => {
        return response.status(200).json({success: true});
      });
});

module.exports = router;