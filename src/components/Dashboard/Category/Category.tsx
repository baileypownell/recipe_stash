import { Box, Stack, Typography } from '@mui/material';
import { FullRecipe } from '../../../../server/recipe';
import { AddRecipeMutationParam } from '../../RecipeCache';
import { GridView } from '../Dashboard';
import { CreateRecipeWidget } from './CreateRecipeWidget';
import ListItem from './ListItem';
import Square from './Square';

type Props = {
  title: string;
  id: string;
  recipes: FullRecipe[];
  gridView: GridView;
  children: any;
  addRecipe: (recipeInput: AddRecipeMutationParam) => void;
};

const Category = ({ title, id, recipes, gridView, addRecipe }: Props) => (
  <Box sx={{ '.MuiPaper-root': { flexGrow: 1 } }}>
    <Typography variant="h6" sx={{ marginBottom: 1 }}>
      {title}
    </Typography>
    <Stack direction="row" flexWrap="wrap">
      <CreateRecipeWidget
        gridView={gridView}
        id={id}
        addRecipe={addRecipe}
        title={title}
      />
      {recipes
        ? recipes.map((recipe) =>
            gridView === GridView.Grid ? (
              <Square recipe={recipe} />
            ) : (
              <ListItem
                key={recipe.id}
                recipeId={recipe.id}
                rawTitle={recipe.rawTitle}
              />
            ),
          )
        : null}
    </Stack>
  </Box>
);

export default Category;
