import { FullRecipe } from '../../../../server/recipe';
import { GridView } from '../Dashboard';
type Props = {
    title: string;
    recipes: FullRecipe[];
    gridView: GridView;
};
declare const Category: ({ title, recipes, gridView }: Props) => import("react/jsx-runtime").JSX.Element;
export default Category;
