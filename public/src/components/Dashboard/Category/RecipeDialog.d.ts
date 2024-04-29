/// <reference types="react" />
import 'react-quill/dist/quill.snow.css';
type EditProps = {
    recipe: any;
    cloning: boolean;
    defaultTileImageKey: string | null;
    openSnackBar: Function;
    presignedUrls: string[];
    fetchData: Function;
    addRecipeMutation: Function;
    triggerDialog: Function;
};
type AddProps = {
    category: string;
    addRecipe: Function;
};
export declare enum Mode {
    Add = "Add",
    Edit = "Edit"
}
interface Props {
    recipeDialogInfo: AddProps | EditProps;
    mode: Mode;
    open: boolean;
    toggleModal: () => void;
}
declare const RecipeDialog: ({ recipeDialogInfo, mode, toggleModal, open }: Props) => JSX.Element;
export default RecipeDialog;
