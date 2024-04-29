/// <reference types="react" />
type MobileRecipeToolbarProps = {
    width: number;
    triggerDialog: () => void;
    cloneRecipe: () => void;
};
export default function MobileRecipeToolbar({ width, triggerDialog, cloneRecipe, }: MobileRecipeToolbarProps): JSX.Element | null;
export {};
