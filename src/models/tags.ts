export default interface RecipeTagChip {
  selected: boolean;
  recipeTagPropertyName: string;
  label: string;
}

export const recipeTagChips: RecipeTagChip[] = [
  {
    selected: false,
    recipeTagPropertyName: 'no_bake',
    label: 'No Bake',
  },
  {
    selected: false,
    recipeTagPropertyName: 'easy',
    label: 'Easy',
  },
  {
    selected: false,
    recipeTagPropertyName: 'healthy',
    label: 'Healthy',
  },
  {
    selected: false,
    recipeTagPropertyName: 'gluten_free',
    label: 'Gluten-Free',
  },
  {
    selected: false,
    recipeTagPropertyName: 'dairy_free',
    label: 'Dairy-Free',
  },
  {
    selected: false,
    recipeTagPropertyName: 'sugar_free',
    label: 'Sugar-Free',
  },
  {
    selected: false,
    recipeTagPropertyName: 'vegetarian',
    label: 'Vegetarian',
  },
  {
    selected: false,
    recipeTagPropertyName: 'vegan',
    label: 'Vegan',
  },
  {
    selected: false,
    recipeTagPropertyName: 'keto',
    label: 'Keto',
  },
];
