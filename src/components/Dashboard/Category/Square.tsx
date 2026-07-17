import { Box, Card, Skeleton, Title, useMantineTheme } from '@mantine/core';
import { useState } from 'react';
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
  const hasImage = !!defaultTileImageUrl;
  const [hovered, setHovered] = useState(false);
  const mantineTheme = useMantineTheme();
  const theme = useMantineTheme();

  return (
    <Box>
      <Link
        to={`/recipes/${recipe.id}`}
        style={{
          display: 'block',
          height: '100%',
          color: 'inherit',
          textDecoration: 'none',
        }}
      >
        <Card
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            minHeight: CARD_HEIGHT,
            height: '100%',
            borderRadius: 8,
            border: hovered
              ? `1px solid ${theme.other.app.borders.primary}`
              : `1px solid ${theme.other.app.borders.subtle}`,
            overflow: 'hidden',
            position: 'relative',
            backgroundColor: mantineTheme.white,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundImage: defaultTileImageUrl
              ? `url(${defaultTileImageUrl})`
              : 'none',
            transform: hovered ? 'translateY(-2px)' : undefined,
            boxShadow: hovered
              ? theme.other.app.shadows.raised
              : undefined,
            transition:
              'transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease',
          }}
        >
          {hasImage ? (
            <Box
              style={{
                position: 'absolute',
                inset: 0,
                background: theme.other.app.gradients.tileImageScrim,
              }}
            />
          ) : (
            <Box
              style={{
                position: 'absolute',
                inset: '0 0 auto',
                height: 4,
                background: theme.other.app.palette.primary.main,
              }}
            />
          )}
          <Box
            style={{
              position: 'relative',
              zIndex: 1,
              minHeight: CARD_HEIGHT,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: 10,
              padding: mantineTheme.spacing.md,
            }}
          >
            <Title
              order={5}
              style={{
                color: hasImage
                  ? mantineTheme.white
                  : theme.other.app.palette.gray.main,
                fontSize: '1.05rem',
                fontWeight: 900,
                lineHeight: 1.15,
                textShadow: hasImage
                  ? '0 2px 12px rgba(0, 0, 0, 0.34)'
                  : undefined,
              }}
            >
              {rawTitle}
            </Title>
            <Chips tags={recipe.tags} inverted={hasImage} />
          </Box>
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
