import {
  Box,
  Chip,
  ListItemButton,
  ListItem as MuiListItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { useNavigate } from 'react-router';
import { recipeTagChips } from '../../../models/tags';
import type { FullRecipe } from '../../../../shared/types';

interface ListItemProps {
  recipe: FullRecipe;
}

const MAX_VISIBLE_TAGS = 4;

const ListItem = ({ recipe }: ListItemProps) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const viewRecipe = () => navigate(`/recipes/${recipe.id}`);
  const visibleTags = recipe.tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenTags = recipe.tags.length - visibleTags.length;

  return (
    <MuiListItem
      disablePadding
      sx={{
        width: '100%',
      }}
    >
      <ListItemButton
        onClick={viewRecipe}
        sx={{
          alignItems: 'center',
          gap: 1,
          minHeight: 52,
          py: 0.75,
          px: 1,
          border: theme.surfaces.quiet.border,
          backgroundColor: '#fff',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.34),
            backgroundColor: alpha(theme.palette.primary.main, 0.025),
          },
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            flex: '0 0 auto',
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            color: theme.palette.primary.dark,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            fontWeight: 900,
            fontSize: '0.86rem',
          }}
        >
          <Typography
            component="span"
            sx={{
              fontWeight: 900,
              fontSize: '0.86rem',
              lineHeight: 1,
            }}
          >
            {recipe.rawTitle.charAt(0).toUpperCase()}
          </Typography>
        </Box>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            minWidth: 0,
            flex: 1,
            gap: 1,
          }}
        >
          <Typography
            sx={{
              color: theme.palette.gray.main,
              fontWeight: 800,
              fontSize: '0.95rem',
              lineHeight: 1.2,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: '0 1 auto',
            }}
          >
            {recipe.rawTitle}
          </Typography>
          {recipe.tags.length ? (
            <Stack
              direction="row"
              sx={{
                minWidth: 0,
                flexWrap: 'wrap',
                gap: 0.5,
                maxHeight: 22,
                overflow: 'hidden',
              }}
            >
              {visibleTags.map((recipeTag) => (
                <Chip
                  key={recipeTag}
                  size="small"
                  variant="outlined"
                  label={
                    recipeTagChips.find(
                      (tag) => tag.recipeTagPropertyName === recipeTag,
                    )!.label
                  }
                  sx={{
                    fontWeight: 700,
                    backgroundColor: '#fff',
                  }}
                />
              ))}
              {hiddenTags > 0 ? (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`+${hiddenTags}`}
                  sx={{
                    fontWeight: 800,
                    backgroundColor: alpha(theme.palette.gray.main, 0.04),
                  }}
                />
              ) : null}
            </Stack>
          ) : null}
        </Stack>
        <ChevronRightRoundedIcon
          sx={{
            color: alpha(theme.palette.gray.main, 0.42),
            flex: '0 0 auto',
          }}
        />
      </ListItemButton>
    </MuiListItem>
  );
};

export default ListItem;
