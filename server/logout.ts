import { Router } from 'express';
import type { Request, Response } from 'express';
const router = Router();

router.post('/', (request: Request, response: Response) => {
  request.session.destroy((err) => {
    if (err) {
      return response.status(500).json({
        success: false,
        message: 'Could not log out.',
      });
    }

    response.clearCookie('connect.sid');
    return response.status(200).json({ success: true });
  });
});

export default router;
