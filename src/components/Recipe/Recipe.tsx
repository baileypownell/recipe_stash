import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Box,
  Fab,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import Skeleton from 'react-loading-skeleton';
import { useNavigate, useParams } from 'react-router';
import { recipeTagChips } from '../../models/tags';
import { RecipeService } from '../../services/recipe-services';
import RecipeDialog, { Mode } from '../Dashboard/Category/RecipeDialog';
import RecipeDetailContent from './RecipeDetailContent';
import MobileRecipeToolbar from './MobileRecipeToolbar';
import type { FullRecipe } from '../../../shared/types';

interface Props {
  openSnackBar: Function;
  addRecipeMutation: Function;
}

const RecipeContentShell = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();

  return (
    <Stack
      sx={{
        margin: '0 auto',
        padding: {
          xs: '16px',
          md: '28px',
        },
        width: '100%',
        flexGrow: '1',
      }}
    >
      <Box
        sx={{
          width: '100%',
          [theme.breakpoints.up('md')]: {
            width: '86%',
            margin: '20px auto',
          },
          [theme.breakpoints.up('lg')]: {
            width: '72%',
          },
          maxWidth: '1100px',
          p: {
            fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
          },
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
}: {
  title: string;
  lines: number;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...theme.surfaces.quiet,
        padding: {
          xs: 2,
          md: 2.5,
        },
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 900,
          letterSpacing: 0,
          marginBottom: 1.5,
        }}
      >
        {title}
      </Typography>
      <Stack spacing={1}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            height={16}
            width={index === lines - 1 ? '62%' : '100%'}
          />
        ))}
      </Stack>
    </Box>
  );
};

const RecipePageSkeleton = () => {
  const theme = useTheme();

  return (
    <RecipeContentShell>
      <Box
        sx={{
          minHeight: {
            xs: 220,
            md: 300,
          },
          borderRadius: 1,
          overflow: 'hidden',
          padding: {
            xs: 2,
            md: 4,
          },
          display: 'flex',
          alignItems: 'flex-end',
          backgroundColor: theme.palette.gray.main,
          boxShadow: `0 2px 12px ${alpha(theme.palette.gray.main, 0.14)}`,
        }}
      >
        <Stack sx={{ width: 'min(100%, 680px)', gap: 1.5 }}>
          <Skeleton height={24} width={120} />
          <Skeleton height={54} width="82%" />
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            <Skeleton height={24} width={92} />
            <Skeleton height={24} width={76} />
            <Skeleton height={24} width={110} />
          </Stack>
        </Stack>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 2,
          marginTop: 3,
          [theme.breakpoints.up('md')]: {
            gridTemplateColumns: 'minmax(280px, 0.85fr) minmax(0, 1.4fr)',
            alignItems: 'start',
          },
        }}
      >
        <SkeletonPanel title="Ingredients" lines={8} />
        <SkeletonPanel title="Directions" lines={10} />
      </Box>
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
        <Typography
          variant="h6"
          sx={{
            fontWeight: 900,
            letterSpacing: 0,
            marginBottom: 2,
          }}
        >
          Photos
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 2,
            [theme.breakpoints.up('md')]: {
              gridTemplateColumns: '1fr 1fr',
            },
          }}
        >
          <Skeleton height={220} />
          <Skeleton height={220} />
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
  const triggerDialog = (): void => {
    setDialogOpen(!dialogOpen);
  };
  const params = useParams();
  const theme = useTheme();

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
      sx={{
        height: `calc(100% - 50px)`,
        overflow: 'auto',
        background: `linear-gradient(180deg, ${alpha(
          theme.palette.primary.main,
          0.05,
        )}, ${theme.palette.info.main} 260px)`,
        [theme.breakpoints.up('md')]: {
          height: 'auto',
        },
      }}
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
            <MobileRecipeToolbar
              width={width}
              triggerDialog={triggerDialog}
              cloneRecipe={cloneRecipe}
            />
            <RecipeDetailContent recipe={recipe} selectedTags={selectedTags} />
          </RecipeContentShell>
        </>
      ) : (
        <RecipePageSkeleton />
      )}
      {!loading && recipe && width > 700 ? (
        <Box
          sx={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',

            button: {
              marginRight: '10px',
            },
          }}
        >
          <Tooltip title="Edit recipe" aria-label="edit recipe">
            <Fab color="secondary" onClick={triggerDialog}>
              <EditRoundedIcon />
            </Fab>
          </Tooltip>

          <Tooltip title="Duplicate recipe" aria-label="duplicate">
            <Fab color="primary" onClick={cloneRecipe}>
              <ContentCopyRoundedIcon />
            </Fab>
          </Tooltip>
        </Box>
      ) : null}
    </Stack>
  );
};

export default Recipe;
