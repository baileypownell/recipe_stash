const { Router } = require('express')
const router = Router()

router.get('/', (request, response, _) => {
  request.session.regenerate(() => {
    return response.status(200).json({ success: true })
  })
})

export default router
