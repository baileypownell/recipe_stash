import { Badge, Chip, Stack } from '@mui/material';
import { recipeTagChips } from '../../../models/tags';
import { useEffect, useRef, useState } from 'react';

const Chips = ({ tags }) => {
  const [hiddenChipCount, setHiddenChipCount] = useState<number>(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!ref.current) return;

    const lowestPointAChipCanEndAt = (
      ref.current as HTMLElement
    ).getBoundingClientRect().bottom;
    const children = Array.from((ref.current as HTMLElement).children);

    if ((ref.current as HTMLElement).getBoundingClientRect().height > 64) {
      children.forEach((child) => {
        if (child.getBoundingClientRect().bottom > lowestPointAChipCanEndAt) {
          (child as HTMLElement).style.display = 'none';
        }
      });

      const hiddenChildren = children.filter(
        (child) => !child.checkVisibility(),
      );
      setHiddenChipCount(hiddenChildren.length);
    }
  }, []);

  return (
    <Badge badgeContent={hiddenChipCount} color="primary">
      <Stack
        ref={ref}
        marginTop={2}
        spacing={0.5}
        direction="row"
        flexWrap="wrap"
        height="72px"
        justifyContent="flex-end"
      >
        {tags.map((recipeTag) => (
          <Chip
            key={recipeTag}
            variant="outlined"
            sx={{
              margin: '2px!important',
            }}
            label={
              recipeTagChips.find(
                (tag) => tag.recipeTagPropertyName === recipeTag,
              )!.label
            }
            data-tag={recipeTag}
          ></Chip>
        ))}
      </Stack>
    </Badge>
  );
};

export default Chips;
