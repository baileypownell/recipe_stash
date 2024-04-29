/// <reference types="react" />
import { FullRecipe } from '../../../../server/recipe';
import { AddRecipeMutationParam } from '../../RecipeCache';
import { GridView } from '../Dashboard';
type Props = {
    title: string;
    id: string;
    recipes: FullRecipe[];
    gridView: GridView;
    addRecipe: (recipeInput: AddRecipeMutationParam) => void;
};
declare const Category: ({ title, id, recipes, gridView, addRecipe }: Props) => JSX.Element;
export default Category;
