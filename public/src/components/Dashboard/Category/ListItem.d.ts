/// <reference types="react" />
interface ListItemProps {
    recipeId: string;
    key: string;
    rawTitle: string;
}
declare const ListItem: ({ recipeId, key, rawTitle }: ListItemProps) => JSX.Element;
export default ListItem;
