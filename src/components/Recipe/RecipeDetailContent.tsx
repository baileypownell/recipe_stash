import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import DOMPurify from 'dompurify';
import type { FullRecipe } from '../../../shared/types';
import LightboxComponent from './LightboxComponent/LightboxComponent';

type SelectedTag = {
  label: string;
};

type RecipeDetailContentProps = {
  recipe: FullRecipe;
  selectedTags: SelectedTag[];
};

const htmlContentSx = {
  'p:first-of-type': {
    marginTop: 0,
  },
  'p:last-child': {
    marginBottom: 0,
  },
  'ul, ol': {
    marginTop: 1,
    marginBottom: 0,
  },
};

const SectionHeader = ({
  title,
  count,
}: {
  title: string;
  count?: number;
}) => {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        marginBottom: 1.5,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 900,
          letterSpacing: 0,
        }}
      >
        {title}
      </Typography>
      {count ? (
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
          {count}
        </Typography>
      ) : null}
    </Stack>
  );
};

const RecipeHero = ({ recipe, selectedTags }: RecipeDetailContentProps) => {
  const theme = useTheme();
  const heroImageUrl = recipe.preSignedDefaultTileImageUrl;

  return (
    <Box
      sx={{
        minHeight: {
          xs: 220,
          md: 300,
        },
        borderRadius: 1,
        overflow: 'hidden',
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        padding: {
          xs: 2,
          md: 4,
        },
        color: theme.palette.info.main,
        background: heroImageUrl
          ? `${theme.palette.gray.main} center / cover no-repeat`
          : theme.palette.gray.main,
        backgroundImage: heroImageUrl ? `url(${heroImageUrl})` : undefined,
        boxShadow: `0 2px 12px ${alpha(theme.palette.gray.main, 0.14)}`,
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: alpha(theme.palette.gray.main, heroImageUrl ? 0.52 : 0),
        },
      }}
    >
      <Stack
        sx={{
          position: 'relative',
          zIndex: 1,
          gap: 1.5,
          maxWidth: 780,
        }}
      >
        <Typography
          component="span"
          sx={{
            alignSelf: 'flex-start',
            px: 1.25,
            py: 0.5,
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.info.main, 0.14),
            color: theme.palette.info.main,
            fontSize: '0.76rem',
            fontWeight: 800,
            letterSpacing: 0,
            textTransform: 'uppercase',
          }}
        >
          {recipe.category.replace('_', ' ')}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            letterSpacing: 0,
            lineHeight: 1.02,
            fontSize: {
              xs: '2rem',
              md: '3.1rem',
            },
            textShadow: heroImageUrl
              ? `0 1px 8px ${alpha(theme.palette.gray.main, 0.55)}`
              : 'none',
          }}
        >
          {recipe.rawTitle}
        </Typography>
        {selectedTags.length ? (
          <Stack
            direction="row"
            sx={{
              flexWrap: 'wrap',
              gap: 0.75,
            }}
          >
            {selectedTags.map((tag) => (
              <Chip
                key={tag.label}
                label={tag.label}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.info.main, 0.18),
                  color: theme.palette.info.main,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.42)}`,
                  fontWeight: 700,
                }}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Box>
  );
};

const RecipeHtmlPanel = ({
  title,
  html,
  variant,
}: {
  title: string;
  html: string;
  variant: 'ingredients' | 'directions';
}) => {
  const theme = useTheme();
  const isDirections = variant === 'directions';

  return (
    <Box
      sx={{
        ...theme.surfaces.quiet,
        padding: {
          xs: 2,
          md: isDirections ? 3 : 2.5,
        },
        lineHeight: isDirections ? 1.65 : undefined,
        ...htmlContentSx,
        'ul, ol': {
          ...htmlContentSx['ul, ol'],
          paddingLeft: isDirections ? 2.75 : 2.5,
        },
        li: {
          marginBottom: isDirections ? 1 : 0.75,
          lineHeight: isDirections ? undefined : 1.55,
        },
        h1: {
          fontSize: '1.45rem',
        },
        h2: {
          fontSize: '1.25rem',
        },
      }}
    >
      <SectionHeader title={title} />
      <Box
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(html),
        }}
      />
    </Box>
  );
};

const RecipePhotos = ({ urls }: { urls: string[] | null }) => {
  const theme = useTheme();

  if (!urls?.length) return null;

  const imageGridSx =
    urls.length < 2
      ? {
          display: 'flex',
          justifyContent: 'center',
          span: {
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          },
          img: {
            maxWidth: '400px',
          },
        }
      : {
          display: 'grid',
          gridTemplateColumns: '1fr',
          [theme.breakpoints.up('md')]: {
            gridTemplateColumns: '1fr 1fr',
            gridTemplateRows: 'auto',
            gap: '0 15px',
          },
        };

  return (
    <Box
      sx={{
        ...theme.surfaces.quiet,
        marginTop: 3,
        padding: {
          xs: 2,
          md: 2.5,
        },
      }}
    >
      <SectionHeader title="Photos" count={urls.length} />
      <Divider sx={{ marginBottom: 2 }} />
      <Box
        sx={{
          ...imageGridSx,
          img: {
            width: '100%',
            margin: '0 0 15px 0',
            borderRadius: 2,
            boxShadow: `0 1px 6px ${alpha(theme.palette.gray.main, 0.12)}`,
            ...(urls.length < 2 ? { maxWidth: '400px' } : {}),
          },
        }}
      >
        <LightboxComponent preSignedUrls={urls}></LightboxComponent>
      </Box>
    </Box>
  );
};

const RecipeDetailContent = ({
  recipe,
  selectedTags,
}: RecipeDetailContentProps) => (
  <>
    <RecipeHero recipe={recipe} selectedTags={selectedTags} />
    <Box
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 2,
        marginTop: 3,
        [theme.breakpoints.up('md')]: {
          gridTemplateColumns: 'minmax(280px, 0.85fr) minmax(0, 1.4fr)',
          alignItems: 'start',
        },
      })}
    >
      <RecipeHtmlPanel
        title="Ingredients"
        html={recipe.ingredients}
        variant="ingredients"
      />
      <RecipeHtmlPanel
        title="Directions"
        html={recipe.directions}
        variant="directions"
      />
    </Box>
    <RecipePhotos urls={recipe.preSignedUrls} />
  </>
);

export default RecipeDetailContent;
