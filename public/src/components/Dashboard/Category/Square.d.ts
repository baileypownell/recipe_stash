/// <reference types="react" />
import { FullRecipe } from '../../../../server/recipe';
interface SquareProps {
    recipe: FullRecipe;
}
declare const Square: ({ recipe }: SquareProps) => JSX.Element;
export default Square;
