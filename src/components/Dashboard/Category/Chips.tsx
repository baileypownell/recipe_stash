import { Badge, Box, Group, useMantineTheme } from '@mantine/core';
import { recipeTagChips } from '../../../models/tags';

interface ChipsProps {
  tags: string[];
  inverted?: boolean;
}

const MAX_VISIBLE_CHIPS = 3;

const Chips = ({ tags, inverted = false }: ChipsProps) => {
  const visibleTags = tags.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenChipCount = tags.length - visibleTags.length;
  const mantineTheme = useMantineTheme();
  const theme = useMantineTheme();
  const chipStyle = {
    borderColor: inverted
      ? theme.other.app.borders.inverseSubtle
      : theme.other.app.borders.primary,
    backgroundColor: inverted
      ? theme.other.app.surfaces.inverseTint.backgroundColor
      : theme.other.app.surfaces.primaryTint.backgroundColor,
    color: inverted ? mantineTheme.white : theme.other.app.palette.primary.dark,
    fontWeight: 800,
    letterSpacing: 0,
  };

  return (
    <Box>
      <Group gap={6} style={{ minWidth: 0 }}>
        {visibleTags.map((recipeTag: string) => (
          <Badge
            key={recipeTag}
            variant="light"
            size="sm"
            data-tag={recipeTag}
            style={chipStyle}
          >
            {
              recipeTagChips.find(
                (tag) => tag.recipeTagPropertyName === recipeTag,
              )!.label
            }
          </Badge>
        ))}
        {hiddenChipCount > 0 ? (
          <Badge
            variant="light"
            size="sm"
            style={chipStyle}
          >
            {`+${hiddenChipCount}`}
          </Badge>
        ) : null}
      </Group>
    </Box>
  );
};

export default Chips;
