import { Box, Stack, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { GridView } from '../Dashboard';
import ListItem from './ListItem';
import Square from './Square';
import type { FullRecipe } from '../../../../shared/types';

type Props = {
  title: string;
  recipes: FullRecipe[];
  gridView: GridView;
};

const Category = ({ title, recipes, gridView }: Props) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        paddingTop: 3.5,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: 1.25,
          marginBottom: 1.75,
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 24,
            borderRadius: 1,
            backgroundColor: theme.palette.primary.main,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1,
          }}
        >
          {title}
        </Typography>
        {recipes?.length ? (
          <Typography
            component="span"
            sx={{
              px: 1,
              py: 0.35,
              borderRadius: 1,
              backgroundColor: alpha(theme.palette.gray.main, 0.06),
              color: theme.palette.primary.dark,
              fontSize: '0.78rem',
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {recipes.length}
          </Typography>
        ) : null}
      </Stack>
      <Stack
        direction={gridView === GridView.Grid ? 'row' : 'column'}
        sx={{
          flexWrap: gridView === GridView.Grid ? 'wrap' : 'nowrap',
          gap: gridView === GridView.Grid ? 2 : 0.75,
        }}
      >
        {recipes
          ? recipes.map((recipe) =>
              gridView === GridView.Grid ? (
                <Square key={recipe.id} recipe={recipe} />
              ) : (
                <ListItem key={recipe.id} recipe={recipe} />
              ),
            )
          : null}
      </Stack>
    </Box>
  );
};

export default Category;
