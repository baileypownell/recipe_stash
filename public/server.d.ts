declare const app: import("express-serve-static-core").Express;
declare global {
    namespace Express {
        interface Request {
            session: any;
        }
    }
}
export default app;
