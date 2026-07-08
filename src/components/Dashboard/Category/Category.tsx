import { Box, Stack, Typography } from '@mui/material';
import { GridView } from '../Dashboard';
import ListItem from './ListItem';
import Square from './Square';
import type { FullRecipe } from '../../../../shared/types';

type Props = {
  title: string;
  recipes: FullRecipe[];
  gridView: GridView;
};

const Category = ({ title, recipes, gridView }: Props) => (
  <Box sx={{
    paddingTop: 2
  }}>
    <Typography variant="h6" sx={{
      marginBottom: 1
    }}>
      {title}
    </Typography>
    <Stack
      direction="row"
      sx={{
        flexWrap: "wrap",
        gap: 1.5
      }}>
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
