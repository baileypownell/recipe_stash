import { Box, Chip, Stack } from '@mui/material';
import { recipeTagChips } from '../../../models/tags';

interface ChipsProps {
  tags: string[];
}

const MAX_VISIBLE_CHIPS = 3;

const Chips = ({ tags }: ChipsProps) => {
  const visibleTags = tags.slice(0, MAX_VISIBLE_CHIPS);
  const hiddenChipCount = tags.length - visibleTags.length;

  return (
    <Box
      sx={{
        width: '100%',
      }}
    >
      <Stack
        spacing={0.5}
        direction="row"
        sx={{
          marginTop: 0,
          flexWrap: 'wrap',
          maxHeight: '58px',
          overflow: 'hidden',
          width: '100%',
          alignContent: 'flex-end',
          justifyContent: 'flex-start',
        }}
      >
        {visibleTags.map((recipeTag: string) => (
          <Chip
            key={recipeTag}
            variant="outlined"
            size="small"
            sx={{
              margin: '2px!important',
              height: 25,
              fontWeight: 700,
            }}
            label={
              recipeTagChips.find(
                (tag) => tag.recipeTagPropertyName === recipeTag,
              )!.label
            }
            data-tag={recipeTag}
          ></Chip>
        ))}
        {hiddenChipCount > 0 ? (
          <Chip
            variant="outlined"
            size="small"
            sx={{
              margin: '2px!important',
              height: 25,
              fontWeight: 800,
            }}
            label={`+${hiddenChipCount}`}
          />
        ) : null}
      </Stack>
    </Box>
  );
};

export default Chips;
