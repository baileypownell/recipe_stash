import { Box, Stack, Typography } from '@mui/material';
import { FullRecipe } from '../../../../server/recipe';
import { GridView } from '../Dashboard';
import ListItem from './ListItem';
import RecipeDialog, { Mode } from './RecipeDialog';
import Square from './Square';

type Props = {
  title: string;
  id: string;
  recipes: FullRecipe[];
  gridView: GridView;
  addRecipe: Function;
  children: any;
};

const Category = ({ title, id, recipes, gridView, addRecipe }: Props) => (
  <Box>
    <Typography variant="h6" sx={{ marginBottom: 1 }}>
      {title}
    </Typography>
    <Stack direction="row" flexWrap="wrap">
      <RecipeDialog
        mode={Mode.Add}
        recipeDialogInfo={{
          id,
          gridView,
          category: title,
          addRecipe: addRecipe,
        }}
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
