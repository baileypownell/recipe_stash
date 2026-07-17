import {
  ContentCopyRoundedIcon } from '@icons';
import { EditRoundedIcon } from '@icons';
import {
  Box,
  ActionIcon,
  Stack,
  Tooltip,
  Title,
  Group,
  Skeleton,
  useMantineTheme,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { recipeTagChips } from '../../models/tags';
import { RecipeService } from '../../services/recipe-services';
import RecipeDialog, { Mode } from '../Dashboard/Category/RecipeDialog';
import RecipeDetailContent from './RecipeDetailContent';
import type { FullRecipe } from '../../../shared/types';

interface Props {
  openSnackBar: Function;
  addRecipeMutation: Function;
}

const RecipeContentShell = ({ children }: { children: React.ReactNode }) => {
  const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 767.95);
  const theme = useMantineTheme();

  useEffect(() => {
    const handleResize = () => setIsNarrow(window.innerWidth <= 767.95);

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Stack
      style={{
        minHeight: 'calc(100vh - 56px)',
        ...theme.other.app.surfaces.page,
        padding: isNarrow ? '16px 12px 88px' : '32px 16px 96px',
      }}
    >
      <Box
        style={{
          width: '100%',
          maxWidth: 1080,
          margin: '0 auto',
        }}
      >
        {children}
      </Box>
    </Stack>
  );
};

const SkeletonPanel = ({
  title,
  lines,
  variant,
}: {
  title: string;
  lines: number;
  variant?: 'ingredients' | 'directions';
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
      </Group>
      <Stack gap={8} style={{ padding: 18 }}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            height={16}
            width={
              index === lines - 1
                ? variant === 'ingredients'
                  ? '48%'
                  : '62%'
                : index % 4 === 2
                  ? '88%'
                  : '100%'
            }
          />
        ))}
      </Stack>
    </Box>
  );
};

const RecipePageSkeleton = () => {
  const [isNarrow, setIsNarrow] = useState(window.innerWidth <= 767.95);
  const [isWide, setIsWide] = useState(window.innerWidth >= 992);
  const mantineTheme = useMantineTheme();
  const theme = useMantineTheme();

  useEffect(() => {
    const handleResize = () => {
      setIsNarrow(window.innerWidth <= 767.95);
      setIsWide(window.innerWidth >= 992);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <RecipeContentShell>
      <Box
        style={{
          minHeight: isNarrow ? 220 : 260,
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          border: `1px solid ${theme.other.app.borders.subtle}`,
          borderRadius: 8,
          background:
            `${theme.other.app.gradients.heroFallback}, ${theme.other.app.palette.gray.main}`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          boxShadow: theme.other.app.shadows.raised,
        }}
      >
        <Stack
          style={{
            width: '100%',
            gap: mantineTheme.spacing.sm,
            padding: isNarrow ? 22 : 'clamp(24px, 4vw, 44px)',
            background: theme.other.app.gradients.heroContentScrim,
          }}
        >
          <Skeleton
            height={24}
            width={120}
            radius={999}
          />
          <Skeleton
            height={isNarrow ? 42 : 58}
            width={isNarrow ? '92%' : '72%'}
          />
          <Group gap="xs">
            <Skeleton
              height={24}
              width={92}
              radius={999}
            />
            <Skeleton
              height={24}
              width={76}
              radius={999}
            />
            <Skeleton
              height={24}
              width={110}
              radius={999}
            />
          </Group>
        </Stack>
      </Box>
      <Box
        style={{
          display: 'grid',
          gridTemplateColumns: isWide
            ? 'minmax(0, 0.82fr) minmax(0, 1.18fr)'
            : '1fr',
          gap: mantineTheme.spacing.md,
          marginTop: mantineTheme.spacing.md,
        }}
      >
        <SkeletonPanel title="Ingredients" lines={8} variant="ingredients" />
        <SkeletonPanel title="Directions" lines={10} variant="directions" />
      </Box>
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
            Photos
          </Title>
          <Skeleton height={24} width={28} radius={999} />
        </Group>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: isWide ? 'repeat(2, minmax(0, 1fr))' : '1fr',
            gap: mantineTheme.spacing.md,
            padding: mantineTheme.spacing.md,
          }}
        >
          <Skeleton height={isNarrow ? 190 : 220} radius={6} />
          <Skeleton height={isNarrow ? 190 : 220} radius={6} />
        </Box>
      </Box>
    </RecipeContentShell>
  );
};

const Recipe = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const [tags, setTags] = useState(recipeTagChips);
  const [cloning, setCloning] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preSignedUrls, setPresignedUrls] = useState<string[]>([]);
  const navigate = useNavigate();
  const theme = useMantineTheme();
  const triggerDialog = (): void => {
    setDialogOpen(!dialogOpen);
  };
  const params = useParams();

  const fetchData = async () => {
    try {
      const recipe = await RecipeService.getRecipe(params.id as string);
      setRecipe(recipe);
      setLoading(false);

      if (recipe.preSignedUrls) {
        setPresignedUrls(recipe.preSignedUrls);
      } else {
        setPresignedUrls([]);
      }

      const tagState = tags.map((tag) => {
        tag.selected = !!recipe.tags.includes(tag.recipeTagPropertyName);
        return tag;
      });
      setTags(tagState);
    } catch (err: any) {
      console.log(err);
      if (err.response?.status === 401) {
        // unathenticated; redirect to log in
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('resize', handleWindowSizeChange);

    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  useEffect(() => {
    if (cloning && !dialogOpen) setCloning(false);
  }, [dialogOpen]);

  const handleWindowSizeChange = (): void => {
    setWidth(window.innerWidth);
  };

  const cloneRecipe = (): void => {
    setPresignedUrls([]);
    setCloning(true);
    triggerDialog();
  };

  const toggleModal = (): void => {
    setDialogOpen(!dialogOpen);
  };

  const selectedTags = tags.filter((tag) => tag.selected);

  return (
    <Stack
    >
      {!loading && recipe ? (
        <>
          <RecipeDialog
            mode={Mode.Edit}
            open={dialogOpen}
            toggleModal={toggleModal}
            recipeDialogInfo={{
              recipe,
              cloning,
              defaultTileImageKey: recipe.defaultTileImageKey,
              openSnackBar: props.openSnackBar,
              presignedUrls: preSignedUrls,
              fetchData: fetchData,
              addRecipeMutation: props.addRecipeMutation,
              triggerDialog: triggerDialog,
            }}
          />
          <RecipeContentShell>
            <RecipeDetailContent recipe={recipe} selectedTags={selectedTags} />
          </RecipeContentShell>
        </>
      ) : (
        <RecipePageSkeleton />
      )}
      {!loading && recipe ? (
        <Box
          style={{
            position: 'fixed',
            right: width <= 700 ? 16 : 24,
            bottom: width <= 700 ? 16 : 24,
            zIndex: 30,
            display: 'flex',
            gap: 8,
          }}
        >
          <Tooltip label="Edit recipe" aria-label="edit recipe">
            <ActionIcon
              color="dark"
              onClick={triggerDialog}
              style={{
                width: 44,
                height: 44,
                boxShadow: theme.other.app.shadows.floating,
              }}
            >
              <EditRoundedIcon />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Duplicate recipe" aria-label="duplicate">
            <ActionIcon
              color="red"
              onClick={cloneRecipe}
              style={{
                width: 44,
                height: 44,
                boxShadow: theme.other.app.shadows.floating,
              }}
            >
              <ContentCopyRoundedIcon />
            </ActionIcon>
          </Tooltip>
        </Box>
      ) : null}
    </Stack>
  );
};

export default Recipe;
