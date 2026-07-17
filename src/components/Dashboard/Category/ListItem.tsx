import {
  Badge,
  Box,
  Text,
  Group,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { ChevronRightRoundedIcon } from '@icons';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { recipeTagChips } from '../../../models/tags';
import type { FullRecipe } from '../../../../shared/types';

interface RecipeListItemProps {
  recipe: FullRecipe;
}

const MAX_VISIBLE_TAGS = 4;

const RecipeListItem = ({ recipe }: RecipeListItemProps) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const mantineTheme = useMantineTheme();
  const theme = useMantineTheme();
  const viewRecipe = () => navigate(`/recipes/${recipe.id}`);
  const visibleTags = recipe.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = recipe.tags.length - visibleTags.length;

  return (
    <Box style={{ width: '100%' }}>
      <UnstyledButton
        onClick={viewRecipe}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          minHeight: 58,
          display: 'grid',
          gridTemplateColumns: '40px minmax(0, 1fr) 24px',
          alignItems: 'center',
          gap: mantineTheme.spacing.sm,
          padding: '9px 10px',
          border: hovered
            ? `1px solid ${theme.other.app.borders.primary}`
            : '1px solid transparent',
          borderRadius: 6,
          backgroundColor: hovered
            ? theme.other.app.surfaces.primaryTint.backgroundColor
            : mantineTheme.white,
          transform: hovered ? 'translateX(2px)' : undefined,
          transition:
            'background-color 140ms ease, border-color 140ms ease, transform 140ms ease',
        }}
      >
        <Box
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            display: 'grid',
            placeItems: 'center',
            backgroundColor:
              theme.other.app.surfaces.primaryTint.backgroundColor,
            color: theme.other.app.palette.primary.dark,
            fontWeight: 900,
          }}
        >
          <Text component="span">
            {recipe.rawTitle.charAt(0).toUpperCase()}
          </Text>
        </Box>
        <Box
          style={{
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: mantineTheme.spacing.sm,
            flexWrap: 'wrap',
          }}
        >
          <Text
            style={{
              color: theme.other.app.palette.gray.main,
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {recipe.rawTitle}
          </Text>
          {recipe.tags.length ? (
            <Group gap={6} style={{ minWidth: 0 }}>
              {visibleTags.map((recipeTag) => (
                <Badge
                  key={recipeTag}
                  size="sm"
                  variant="light"
                  style={{
                    borderColor: theme.other.app.borders.primary,
                    background:
                      theme.other.app.surfaces.primaryTint.backgroundColor,
                    color: theme.other.app.palette.primary.dark,
                    fontWeight: 800,
                    letterSpacing: 0,
                  }}
                >
                  {
                    recipeTagChips.find(
                      (tag) => tag.recipeTagPropertyName === recipeTag,
                    )!.label
                  }
                </Badge>
              ))}
              {hiddenTags > 0 ? (
                <Badge
                  size="sm"
                  variant="light"
                  style={{
                    borderColor: theme.other.app.borders.primary,
                    background:
                      theme.other.app.surfaces.primaryTint.backgroundColor,
                    color: theme.other.app.palette.primary.dark,
                    fontWeight: 800,
                    letterSpacing: 0,
                  }}
                >
                  {`+${hiddenTags}`}
                </Badge>
              ) : null}
            </Group>
          ) : null}
        </Box>
        <ChevronRightRoundedIcon />
      </UnstyledButton>
    </Box>
  );
};

export default RecipeListItem;
