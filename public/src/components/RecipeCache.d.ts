import { RecipeInput } from '../services/recipe-services';
import { NewFileUpload } from '../models/images';
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
    files: NewFileUpload[];
}
declare const RecipeCache: () => import("react/jsx-runtime").JSX.Element;
export default RecipeCache;
