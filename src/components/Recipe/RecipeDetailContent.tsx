import {
  Badge,
  Box,
  Divider,
  Stack,
  Text,
  Title,
  Group,
  useMantineTheme,
} from '@mantine/core';
import DOMPurify from 'dompurify';
import { useEffect, useState } from 'react';
import type { FullRecipe } from '../../../shared/types';
import LightboxComponent from './LightboxComponent/LightboxComponent';

type SelectedTag = {
  label: string;
};

type RecipeDetailContentProps = {
  recipe: FullRecipe;
  selectedTags: SelectedTag[];
};

const SectionHeader = ({
  title,
  count,
}: {
  title: string;
  count?: number;
}) => {
  const theme = useMantineTheme();

  return (
    <Group
      justify="space-between"
      align="center"
      style={{
        padding: '16px 18px 12px',
        borderBottom: `1px solid ${theme.other.app.borders.faint}`,
      }}
    >
      <Title
        order={6}
        style={{
          color: theme.other.app.palette.gray.main,
          fontSize: '0.92rem',
          fontWeight: 900,
          lineHeight: 1,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Title>
      {count ? (
        <Text
          component="span"
          style={{
            minWidth: 24,
            height: 24,
            padding: '0 8px',
            borderRadius: 999,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor:
              theme.other.app.surfaces.primaryTint.backgroundColor,
            color: theme.other.app.palette.primary.dark,
            fontSize: '0.78rem',
            fontWeight: 900,
          }}
        >
          {count}
        </Text>
      ) : null}
    </Group>
  );
};

const RecipeHero = ({ recipe, selectedTags }: RecipeDetailContentProps) => {
  const heroImageUrl = recipe.preSignedDefaultTileImageUrl;
  const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 767.95);
  const mantineTheme = useMantineTheme();
  const theme = useMantineTheme();

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 767.95);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Box
      style={{
        minHeight: isNarrow ? 220 : 260,
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        border: `1px solid ${theme.other.app.borders.subtle}`,
        borderRadius: 8,
        background: heroImageUrl
          ? `${theme.other.app.gradients.heroImageOverlay}, url(${heroImageUrl})`
          : `${theme.other.app.gradients.heroFallback}, ${theme.other.app.palette.gray.main}`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundBlendMode: heroImageUrl ? 'multiply' : undefined,
        boxShadow: theme.other.app.shadows.raised,
      }}
    >
      <Stack
        style={{
          width: '100%',
          gap: mantineTheme.spacing.sm,
          padding: isNarrow ? 22 : 'clamp(24px, 4vw, 44px)',
          color: mantineTheme.white,
          background: theme.other.app.gradients.heroContentScrim,
        }}
      >
        <Text
          component="span"
          style={{
            width: 'fit-content',
            borderRadius: 999,
            padding: '5px 10px',
            background: 'rgba(255, 255, 255, 0.16)',
            color: 'rgba(255, 255, 255, 0.92)',
            fontSize: '0.78rem',
            fontWeight: 900,
            lineHeight: 1,
            textTransform: 'uppercase',
          }}
        >
          {recipe.category.replace('_', ' ')}
        </Text>
        <Title
          order={3}
          style={{
            maxWidth: 780,
            color: mantineTheme.white,
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1,
          }}
        >
          {recipe.rawTitle}
        </Title>
        {selectedTags.length ? (
          <Group
            gap="xs"
            style={{ maxWidth: 780 }}
          >
            {selectedTags.map((tag) => (
              <Badge
                key={tag.label}
                size="sm"
                style={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: mantineTheme.white,
                  fontWeight: 800,
                  letterSpacing: 0,
                }}
              >
                {tag.label}
              </Badge>
            ))}
          </Group>
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
  const mantineTheme = useMantineTheme();
  const theme = useMantineTheme();

  return (
    <Box
      style={{
        minWidth: 0,
        border: `1px solid ${theme.other.app.borders.subtle}`,
        borderRadius: 8,
        background: mantineTheme.white,
        boxShadow: theme.other.app.shadows.panel,
        overflow: 'hidden',
      }}
    >
      <SectionHeader title={title} />
      <Box
        data-recipe-html={variant}
        style={{
          padding: 18,
          color: theme.other.app.palette.gray.main,
          fontSize: '1rem',
          lineHeight: 1.65,
        }}
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(html),
        }}
      />
      <style>{`
        [data-recipe-html="${variant}"] p:first-child {
          margin-top: 0;
        }
        [data-recipe-html="${variant}"] p:last-child {
          margin-bottom: 0;
        }
        [data-recipe-html="${variant}"] ul,
        [data-recipe-html="${variant}"] ol {
          margin-top: 0;
          margin-bottom: 0;
          padding-left: 1.25rem;
        }
        [data-recipe-html="${variant}"] li + li {
          margin-top: 6px;
        }
      `}</style>
    </Box>
  );
};

const RecipePhotos = ({ urls }: { urls: string[] | null }) => {
  const [isWide, setIsWide] = useState(window.innerWidth >= 992);
  const mantineTheme = useMantineTheme();
  const theme = useMantineTheme();

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 992);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!urls?.length) return null;

  return (
    <Box
      style={{
        marginTop: mantineTheme.spacing.md,
        minWidth: 0,
        border: `1px solid ${theme.other.app.borders.subtle}`,
        borderRadius: 8,
        background: mantineTheme.white,
        boxShadow: theme.other.app.shadows.panel,
        overflow: 'hidden',
      }}
    >
      <SectionHeader title="Photos" count={urls.length} />
      <Divider />
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns:
            isWide && urls.length >= 2 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
          gap: mantineTheme.spacing.md,
          padding: mantineTheme.spacing.md,
          maxWidth: urls.length < 2 ? 520 : undefined,
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
}: RecipeDetailContentProps) => {
  const [isWide, setIsWide] = useState(window.innerWidth >= 992);
  const theme = useMantineTheme();

  useEffect(() => {
    const handleResize = () => setIsWide(window.innerWidth >= 992);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <RecipeHero recipe={recipe} selectedTags={selectedTags} />
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: isWide
            ? 'minmax(0, 0.82fr) minmax(0, 1.18fr)'
            : '1fr',
          gap: theme.spacing.md,
          marginTop: theme.spacing.md,
        }}
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
};

export default RecipeDetailContent;
