import { Button, Card, CardContent, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router';
import { FullRecipe } from '../../../../server/recipe';
import Chips from './Chips';

const RecipeCard = ({
  viewRecipe,
  recipe,
  rawTitle,
  defaultTileImageUrl,
}: {
  viewRecipe: () => void;
  recipe: FullRecipe;
  rawTitle: string;
  defaultTileImageUrl?: string;
}) => {
  const theme = useTheme();
  const imageTileStyles = {
    backgroundBlendMode: 'overlay',
    backgroundColor: theme.palette.gray.main,
    boxShadow: `0px 2px 10px ${theme.palette.gray.main}`,
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
  };

  return (
    <Card
      component={Button}
      onClick={viewRecipe}
      sx={{ ...tileStyles, ...(defaultTileImageUrl && imageTileStyles) }}
      style={{
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
          component="div"
          marginBottom={1}
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
  );
};

interface SquareProps {
  recipe: FullRecipe;
}

const Square = ({ recipe }: SquareProps) => {
  const recipeId = recipe.id;
  const defaultTileImageUrl = recipe.preSignedDefaultTileImageUrl;
  const rawTitle = recipe.rawTitle;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageLoadingError, setImageLoadingError] = useState(false);
  const [skeletonWidth, setSkeletonWidth] = useState(150);
  const [skeletonHeight, setSkeletonHeight] = useState(150);
  const navigate = useNavigate();

  const viewRecipe = () => {
    navigate(`/recipes/${recipeId}`);
  };

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
    return (
      <RecipeCard viewRecipe={viewRecipe} recipe={recipe} rawTitle={rawTitle} />
    );

  // a <Square/> should not render until the background image (if there is one) is fully loaded
  // this means we need to technically render an <img/> so that we can react with the onLoad listener & then render the div
  return imageLoaded ? (
    <RecipeCard
      viewRecipe={viewRecipe}
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
        <RecipeCard
          viewRecipe={viewRecipe}
          recipe={recipe}
          rawTitle={rawTitle}
        />
      )}
    </>
  );
};

export default Square;
