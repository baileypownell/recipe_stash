import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { FullRecipe } from '../../../../server/recipe';
import Chips from './Chips';
import { Link } from 'react-router-dom';

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
  const imageTileStyles = {
    backgroundBlendMode: 'overlay',
    backgroundColor: theme.palette.gray.main,
    color: theme.palette.info.main,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    transition: 'background-color 0.3s',
    width: '250px',
    height: '150px',
  };

  const tileStyles = {
    width: '250px',
    height: '150px',
    marginRight: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
    minHeight: '120px',
    transition: 'box-shadow 300ms',
    transitionTimingFunction: 'ease-in-out',
  };

  return (
    <Box
      sx={{
        '&&': {
          '> a': {
            textDecoration: 'none',
            '&:hover': {
              '> div': {
                boxShadow: `0px 3px 10px ${theme.palette.primary.dark}`,
              },
            },
            '&:focus': {
              outlineColor: 'blue',
              outline: 'none',
              '> div': {
                boxShadow: `0px 3px 10px ${theme.palette.primary.main}`,
              },
            },
          },
        },
      }}
    >
      <Link to={`/recipes/${recipe.id}`} target="_blank">
        <Card
          elevation={5}
          sx={{ ...tileStyles, ...(defaultTileImageUrl && imageTileStyles) }}
          style={{
            textDecoration: 'none!important',
            backgroundImage: defaultTileImageUrl
              ? `url(${defaultTileImageUrl})`
              : 'none',
          }}
        >
          <CardContent
            sx={{
              width: '100%',
              height: '100%',
              padding: '8px',
            }}
          >
            <Typography
              variant="h6"
              marginBottom={1}
              textAlign="center"
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textTransform: 'none',
              }}
            >
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
  const [skeletonWidth, setSkeletonWidth] = useState(150);
  const [skeletonHeight, setSkeletonHeight] = useState(150);

  const handleWindowSizeChange = () => {
    let skeletonHeight, skeletonWidth;
    if (window.innerWidth >= 600) {
      skeletonHeight = 100;
      skeletonWidth = 175;
    } else {
      skeletonHeight = 120;
      skeletonWidth = 120;
    }
    setSkeletonWidth(skeletonWidth);
    setSkeletonHeight(skeletonHeight);
  };

  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    handleWindowSizeChange();

    return window.removeEventListener('resize', handleWindowSizeChange);
  }, []);

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
        <Skeleton width={skeletonWidth} height={skeletonHeight} />
      ) : (
        <RecipeCard recipe={recipe} rawTitle={rawTitle} />
      )}
    </>
  );
};

export default Square;
