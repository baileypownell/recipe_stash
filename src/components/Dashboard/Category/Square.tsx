import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import Chips from './Chips';
import { Link } from 'react-router-dom';
import type { FullRecipe } from '../../../../shared/types';

const CARD_HEIGHT = 190;
const CARD_WIDTH = 276;

const RecipeCard = ({
  recipe,
  rawTitle,
  defaultTileImageUrl,
}: {
  recipe: FullRecipe;
  rawTitle: string;
  defaultTileImageUrl?: string;
}) => {
  const theme = useTheme();
  const hasImage = !!defaultTileImageUrl;

  const tileStyles = {
    width: `${CARD_WIDTH}px`,
    height: `${CARD_HEIGHT}px`,
    borderRadius: 1,
    cursor: 'pointer',
    color: hasImage ? theme.palette.info.main : theme.palette.gray.main,
    overflow: 'hidden',
    position: 'relative',
    background: hasImage
      ? `${theme.palette.gray.main} center / cover no-repeat`
      : '#fff',
    ...(hasImage
      ? {
          '&:before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: alpha(theme.palette.gray.main, 0.5),
          },
        }
      : {
          '&:after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundColor: theme.palette.primary.main,
          },
        }),
  };

  return (
    <Box
      sx={{
        '&&': {
          '> a': {
            textDecoration: 'none',
            '&:hover': {
              '> div': {
                borderColor: alpha(theme.palette.primary.main, 0.42),
              },
            },
            '&:focus': {
              outline: 'none',
              '> div': {
                boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
              },
            },
          },
        },
      }}
    >
      <Link to={`/recipes/${recipe.id}`} target="_blank">
        <Card
          sx={tileStyles}
          style={{
            textDecoration: 'none!important',
            backgroundImage: defaultTileImageUrl
              ? `url(${defaultTileImageUrl})`
              : 'none',
          }}
        >
          <CardContent
            sx={{
              position: 'relative',
              zIndex: 1,
              width: '100%',
              height: '100%',
              padding: 1.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              '.MuiChip-root': {
                borderColor: hasImage
                  ? alpha(theme.palette.info.main, 0.6)
                  : alpha(theme.palette.primary.main, 0.44),
                backgroundColor: hasImage
                  ? alpha(theme.palette.gray.main, 0.3)
                  : '#fff',
                color: hasImage ? theme.palette.info.main : theme.palette.primary.dark,
              },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                marginTop: 'auto',
                marginBottom: 1,
                maxWidth: '100%',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 2,
                overflow: 'hidden',
                textTransform: 'none',
                lineHeight: 1.08,
                fontSize: '1.25rem',
                fontWeight: 800,
                textShadow: hasImage
                  ? `0 1px 6px ${alpha(theme.palette.gray.main, 0.55)}`
                  : 'none',
              }}>
              {rawTitle}
            </Typography>
            <Chips tags={recipe.tags} />
          </CardContent>
        </Card>
      </Link>
    </Box>
  );
};

interface SquareProps {
  recipe: FullRecipe;
}

const Square = ({ recipe }: SquareProps) => {
  const defaultTileImageUrl = recipe.preSignedDefaultTileImageUrl;
  const rawTitle = recipe.rawTitle;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadingError, setImageLoadingError] = useState(false);

  if (!defaultTileImageUrl)
    return <RecipeCard recipe={recipe} rawTitle={rawTitle} />;

  // a <Square/> should not render until the background image (if there is one) is fully loaded
  // this means we need to technically render an <img/> so that we can react with the onLoad listener & then render the div
  return imageLoaded ? (
    <RecipeCard
      recipe={recipe}
      rawTitle={rawTitle}
      defaultTileImageUrl={defaultTileImageUrl}
    />
  ) : (
    <>
      <img
        src={defaultTileImageUrl}
        style={{ display: 'none' }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoadingError(true)}
        alt={`${rawTitle}`}
      />
      {!imageLoadingError ? (
        <Skeleton width={CARD_WIDTH} height={CARD_HEIGHT} />
      ) : (
        <RecipeCard recipe={recipe} rawTitle={rawTitle} />
      )}
    </>
  );
};

export default Square;
