import { Router } from 'express';
const router = Router();

router.get('/', (request: any, response, _) => {
  request.session.destroy();
  return response.status(200).json({ success: true });
});

export default router;
