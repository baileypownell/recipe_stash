import { Router } from 'express';
const router = Router();

export interface AuthenticationState {
  authenticated: boolean;
}

router.get('/', (request: any, response) => {
  if (request.session.userID) {
    const authState: AuthenticationState = {
      authenticated: true,
    };
    return response.status(200).json(authState);
  } else {
    const authState: AuthenticationState = {
      authenticated: false,
    };
    return response.status(200).json(authState);
  }
});

export default router;
