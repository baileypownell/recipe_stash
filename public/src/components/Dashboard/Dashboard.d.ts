import { SortedRecipeInterface } from '../../services/recipe-services';
export declare enum GridView {
    Grid = 0,
    List = 1
}
export type MealCategoriesType = {
    breakfast: 'Breakfast';
    lunch: 'Lunch';
    dinner: 'Dinner';
    side_dish: 'Side Dish';
    dessert: 'Dessert';
    drinks: 'Drinks';
    other: 'Other';
};
interface Props {
    addRecipeMutation: any;
    fetchRecipes: Function;
    recipes: SortedRecipeInterface;
}
declare const Dashboard: (props: Props) => import("react/jsx-runtime").JSX.Element;
export default Dashboard;
