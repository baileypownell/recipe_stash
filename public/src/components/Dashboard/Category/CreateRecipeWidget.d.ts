import { AddRecipeMutationParam } from '../../RecipeCache';
import { GridView } from '../Dashboard';
type CreateRecipeWidgetProps = {
    id: string;
    gridView: GridView;
    addRecipe: (recipeInput: AddRecipeMutationParam) => void;
    title: string;
};
export declare const CreateRecipeWidget: ({ gridView, id, addRecipe, title, }: CreateRecipeWidgetProps) => import("react/jsx-runtime").JSX.Element;
export {};
