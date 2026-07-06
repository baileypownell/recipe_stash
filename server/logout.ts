import { Router, Request, Response } from 'express';
const router = Router();

router.get('/', (request: Request, response: Response) => {
  request.session.destroy((err) => {
    if (err) console.error(err);
  });
  return response.status(200).json({ success: true });
});

export default router;
