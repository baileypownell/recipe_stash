import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Box,
  Chip,
  Divider,
  Fab,
  Stack,
  Tooltip,
  useTheme,
} from '@mui/material';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { recipeTagChips } from '../../models/tags';
import { RecipeService } from '../../services/recipe-services';
import RecipeDialog, { Mode } from '../Dashboard/Category/RecipeDialog';
import { Spinner } from '../Spinner';
import InnerNavigationBar from './InnerNavigationBar';
import LightboxComponent from './LightboxComponent/LightboxComponent';
import MobileRecipeToolbar from './MobileRecipeToolbar';

interface Props {
  openSnackBar: Function;
  addRecipeMutation: Function;
}

const Recipe = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [tags, setTags] = useState(recipeTagChips);
  const [cloning, setCloning] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [preSignedUrls, setPresignedUrls] = useState(null);
  const navigate = useNavigate();
  const triggerDialog = (): void => {
    setDialogOpen(!dialogOpen);
  };
  const params = useParams();
  const theme = useTheme();

  const fetchData = async () => {
    try {
      const recipe = await RecipeService.getRecipe(params.id);
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
    } catch (err) {
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

  const noGridStyles = {
    display: 'flex',
    padding: '30px 0',
    justifyContent: 'center',
    span: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    },
    img: {
      width: '100%',
      maxWidth: '400px',
      borderRadius: '5px',
      boxShadow: `5px 1px 30px ${theme.palette.boxShadow.main}`,
    },
  };

  const imagesStyles = {
    padding: '20px 0',
    display: 'grid',
    gridTemplateColumns: '1fr',
    [theme.breakpoints.up('md')]: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto',
      gap: '0 15px',
    },
    img: {
      width: '100%',
      margin: '0 0 15px 0',
      borderRadius: '5px',
      boxShadow: `5px 1px 30px ${theme.palette.boxShadow.main}`,
    },
  };

  const getImageStyles = (lessThanTwoImages: boolean) => {
    return lessThanTwoImages ? noGridStyles : imagesStyles;
  };

  const toggleModal = (): void => {
    setDialogOpen(!dialogOpen);
  };

  return !loading ? (
    <Stack
      sx={{
        height: `calc(100% - 50px)`,
        overflow: 'auto',
        [theme.breakpoints.up('md')]: {
          height: 'auto',
        },
      }}
    >
      <InnerNavigationBar title={recipe.rawTitle}></InnerNavigationBar>
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
      <Stack margin="0 auto" padding="20px" width="100%" flexGrow="1">
        <MobileRecipeToolbar
          width={width}
          triggerDialog={triggerDialog}
          cloneRecipe={cloneRecipe}
        />
        <Box
          sx={{
            width: '100%',
            [theme.breakpoints.up('md')]: {
              width: '75%',
              margin: '20px auto',
            },
            [theme.breakpoints.up('lg')]: {
              width: '60%',
            },
            p: {
              fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
            },
          }}
        >
          <Box
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(recipe.title),
            }}
          />

          <Box dangerouslySetInnerHTML={{ __html: recipe.ingredients }} />
          <Box dangerouslySetInnerHTML={{ __html: recipe.directions }} />
          <Box>
            {tags.map((tag) =>
              tag.selected ? (
                <Chip
                  key={tag.label}
                  className={'chip selectedTag'}
                  label={tag.label}
                />
              ) : null,
            )}
          </Box>
          <Divider style={{ margin: '20px 0 10px 0' }} />
          <Box sx={getImageStyles(recipe.preSignedUrls?.length < 2)}>
            <LightboxComponent
              preSignedUrls={recipe.preSignedUrls}
            ></LightboxComponent>
          </Box>
        </Box>
      </Stack>
      {width > 700 ? (
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
  ) : (
    <Spinner />
  );
};

export default Recipe;
