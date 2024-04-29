declare const router: import("express-serve-static-core").Router;
export interface RawRecipe {
    title: string;
    raw_title: string;
    ingredients: string;
    directions: string;
    category: string;
    no_bake: string;
    easy: string;
    healthy: string;
    gluten_free: string;
    dairy_free: string;
    sugar_free: string;
    vegetarian: string;
    vegan: string;
    keto: string;
    recipe_uuid: string;
    user_uuid: string;
}
export interface FullRecipe {
    id: string;
    title: string;
    rawTitle: string;
    category: string;
    user_id: string;
    ingredients: string;
    directions: string;
    tags: string[];
    defaultTileImageKey: string | null;
    preSignedUrls: string[] | null;
    preSignedDefaultTileImageUrl: string | null;
}
export default router;
