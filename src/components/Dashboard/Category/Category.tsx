import { Box, Stack, Typography } from '@mui/material';
import { FullRecipe } from '../../../../server/recipe';
import { GridView } from '../Dashboard';
import ListItem from './ListItem';
import Square from './Square';

type Props = {
  title: string;
  recipes: FullRecipe[];
  gridView: GridView;
};

const Category = ({ title, recipes, gridView }: Props) => (
  <Box paddingTop={2}>
    <Typography variant="h6" marginBottom={1}>
      {title}
    </Typography>
    <Stack direction="row" flexWrap="wrap">
      {recipes
        ? recipes.map((recipe) =>
            gridView === GridView.Grid ? (
              <Square key={recipe.id} recipe={recipe} />
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
