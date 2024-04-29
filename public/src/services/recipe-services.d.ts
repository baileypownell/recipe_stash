import { TileImageSetResponse } from '../../server/file-upload';
import { FullRecipe, RawRecipe } from '../../server/recipe';
import { NewFile, UploadedFileResult } from '../models/images';
import tag from '../models/tags';
export interface BaseStringAccessibleObjectBoolean {
    [key: string]: boolean;
}
export interface BaseStringAccessibleObjectString {
    [key: string]: string;
}
export interface BaseStringAccessibleObjectRecipeInterface {
    [key: string]: FullRecipe[];
}
export interface SortedRecipeInterface extends BaseStringAccessibleObjectRecipeInterface {
    breakfast: FullRecipe[];
    dessert: FullRecipe[];
    dinner: FullRecipe[];
    drinks: FullRecipe[];
    lunch: FullRecipe[];
    other: FullRecipe[];
    side_dish: FullRecipe[];
}
export interface RecipeTags {
    isNoBake: boolean;
    isEasy: boolean;
    isHealthy: boolean;
    isGlutenFree: boolean;
    isDairyFree: boolean;
    isSugarFree: boolean;
    isVegetarian: boolean;
    isVegan: boolean;
    isKeto: boolean;
}
export interface RecipeInput extends RecipeTags {
    title: string;
    rawTitle: string;
    category: string;
    ingredients: string;
    directions: string;
}
export interface RecipeInterface {
    id: string;
    title: string;
    rawTitle: string;
    category: string;
    user_id: number;
    ingredients: string;
    directions: string;
    tags: tag[];
    defaultTileImageKey: string;
    preSignedUrls: string[];
}
export interface UpdateRecipeInput extends RecipeTags {
    title: string;
    rawTitle: string;
    ingredients: string;
    directions: string;
    recipeId: string;
    category: string;
}
export declare const RecipeService: {
    sortByTitle(a: RecipeInput | FullRecipe, b: RecipeInput | FullRecipe): number;
    getRecipes: () => Promise<SortedRecipeInterface | {
        error: boolean;
        errorMessage: string;
    }>;
    getRecipe: (recipeId: string) => Promise<FullRecipe>;
    deleteRecipe: (recipeId: string) => Promise<{
        recipeDeleted: boolean;
    }>;
    createRecipe: (recipeInput: RecipeInput, files: NewFile[], defaultTile: string | null) => Promise<RawRecipe>;
    handleDefaultTileImage: (recipeId: string, awsKey: string) => Promise<TileImageSetResponse>;
    uploadFiles: (recipeId: string, files: NewFile[]) => Promise<UploadedFileResult[]>;
    updateRecipe: (recipeInput: UpdateRecipeInput, files: (File | NewFile)[], defaultTile: string | null, fileUrlsToDelete: string[], recipeId: string, recipe: RecipeInterface) => Promise<RawRecipe>;
    deleteFiles: (filesToDeleteKeys: string[]) => Promise<import("axios").AxiosResponse<any, any>[]>;
    removeTileImage: (recipeId: string) => Promise<TileImageSetResponse>;
    setTileImage: (recipeId: string, awsKey: string) => Promise<TileImageSetResponse>;
};
