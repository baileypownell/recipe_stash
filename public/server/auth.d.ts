declare const router: import("express-serve-static-core").Router;
export interface AuthenticationState {
    authenticated: boolean;
}
export default router;
