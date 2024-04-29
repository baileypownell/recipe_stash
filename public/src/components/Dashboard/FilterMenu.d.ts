/// <reference types="react" />
export default function FilterMenu(props: {
    numberOfSelectedFilters: number;
    filters: any[];
    categories: any[];
    appliedFilt: any;
    appliedCat: any;
    filter: Function;
    filterByCategory: Function;
}): JSX.Element;
