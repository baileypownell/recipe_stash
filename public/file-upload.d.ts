declare const router: import("express-serve-static-core").Router;
export interface TileImageSetResponse {
    success: boolean;
    message?: string;
}
export default router;
