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
export type AddProps = {
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
declare const RecipeDialog: ({ recipeDialogInfo, mode, toggleModal, open }: Props) => import("react/jsx-runtime").JSX.Element;
export default RecipeDialog;
