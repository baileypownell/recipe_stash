import { NewFile } from '../models/images';
import { RecipeInput } from '../services/recipe-services';
export interface MealCategoriesType {
    breakfast: 'Breakfast';
    lunch: 'Lunch';
    dinner: 'Dinner';
    side_dish: 'Side Dish';
    dessert: 'Dessert';
    drinks: 'Drinks';
    other: 'Other';
}
export interface AddRecipeMutationParam {
    recipeInput: RecipeInput;
    files: NewFile[];
    defaultTile: string | null;
}
declare const RecipeCache: () => import("react/jsx-runtime").JSX.Element;
export default RecipeCache;
