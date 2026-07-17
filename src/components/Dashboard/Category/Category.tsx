import { Box, Title, Text, Group, useMantineTheme } from '@mantine/core';
import { useState, useEffect } from 'react';
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
  const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 767.95);
  const mantineTheme = useMantineTheme();
  const theme = useMantineTheme();

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 767.95);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box
      style={{
        border: `1px solid ${theme.other.app.borders.subtle}`,
        borderRadius: 8,
        background: mantineTheme.white,
        boxShadow: theme.other.app.shadows.panel,
        overflow: 'hidden',
      }}
    >
      <Group
        justify="space-between"
        style={{
          padding: '18px 20px 14px',
          borderBottom: `1px solid ${theme.other.app.borders.faint}`,
        }}
      >
        <Group gap="sm">
          <Box
            style={{
              width: 4,
              height: 24,
              borderRadius: 999,
              background: theme.other.app.palette.primary.main,
            }}
          />
          <Title
            order={4}
            style={{
              color: theme.other.app.palette.gray.main,
              fontSize: '1.05rem',
              fontWeight: 900,
              lineHeight: 1,
            }}
          >
            {title}
          </Title>
        </Group>
        {recipes?.length ? (
          <Text
            component="span"
            style={{
              minWidth: 28,
              height: 24,
              padding: '0 9px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor:
                theme.other.app.surfaces.primaryTint.backgroundColor,
              color: theme.other.app.palette.primary.dark,
              fontWeight: 800,
            }}
          >
            {recipes.length}
          </Text>
        ) : null}
      </Group>
      <Box
        style={
          gridView === GridView.Grid
            ? {
                display: 'grid',
                gridTemplateColumns: isNarrow
                  ? '1fr'
                  : 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: mantineTheme.spacing.md,
                padding: mantineTheme.spacing.md,
              }
            : {
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: mantineTheme.spacing.sm,
              }
        }
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
      </Box>
    </Box>
  );
};

export default Category;
