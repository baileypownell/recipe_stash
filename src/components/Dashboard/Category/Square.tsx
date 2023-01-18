import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate } from 'react-router';
import { FullRecipe } from '../../../../server/recipe';
import { tags } from '../../../models/tags';

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
    transition: 'all 0.3s',
  };

  const tileStyles = {
    minWidth: '150px',
    marginRight: '10px',
    marginBottom: '10px',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  return (
    <Card
      onClick={viewRecipe}
      sx={{ ...tileStyles, ...(defaultTileImageUrl && imageTileStyles) }}
      style={{
        backgroundImage: defaultTileImageUrl
          ? `url(${defaultTileImageUrl})`
          : 'none',
      }}
    >
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Title
        </Typography>
        <Typography variant="h6" component="div" marginBottom={1}>
          {rawTitle}
        </Typography>
        <Box marginTop={2}>
          {recipe.tags.map((recipeTag) => (
            <Chip
              sx={{
                marginRight: 0.5,
              }}
              label={
                tags.find((tag) => tag.recipeTagPropertyName === recipeTag)
                  .label
              }
              color="secondary"
              variant="outlined"
            ></Chip>
          ))}
        </Box>
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
  const [skeletonWidth, setSkeletonWidth] = useState(150);
  const [skeletonHeight, setSkeletonHeight] = useState(150);
  const navigate = useNavigate();
  const theme = useTheme();

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

  // a <Square/> should not render until the background image (if there is one) is fully loaded
  // this means we need to technically render an <img/> so that we can react with the onLoad listener & then render the div
  return (
    <>
      {defaultTileImageUrl ? (
        <>
          {imageLoaded ? (
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
              />
              <Skeleton width={skeletonWidth} height={skeletonHeight} />
            </>
          )}
        </>
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
