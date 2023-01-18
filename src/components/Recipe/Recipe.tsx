import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { Box, Chip, Divider, Fab, Tooltip } from '@mui/material';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import BounceLoader from 'react-spinners/BounceLoader';
import { BehaviorSubject } from 'rxjs';
import { tags as recipeTags } from '../../models/tags';
import { RecipeService } from '../../services/recipe-services';
import RecipeDialog, {
  Mode,
} from '../Dashboard/Category/RecipeDialog/RecipeDialog';
import InnerNavigationBar from './InnerNavigationBar';
import LightboxComponent from './LightboxComponent/LightboxComponent';
import MobileRecipeToolbar from './MobileRecipeToolbar/MobileRecipeToolbar';
import './Recipe.scss';

const presignedUrlsSubject: BehaviorSubject<string[]> = new BehaviorSubject<
  string[]
>([]);
const presignedUrls$ = presignedUrlsSubject.asObservable();

interface Props {
  openSnackBar: Function;
  addRecipeMutation: Function;
}

const Recipe = (props: Props) => {
  const [loading, setLoading] = useState(true);
  const [recipe, setRecipe] = useState(null);
  const [tags, setTags] = useState(recipeTags);
  const [cloning, setCloning] = useState(false);
  const [width, setWidth] = useState(window.innerWidth);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();
  const triggerDialog = (): void => {
    setDialogOpen(!dialogOpen);
  };
  const params = useParams();

  const fetchData = async () => {
    try {
      const recipe = await RecipeService.getRecipe(params.id);
      setRecipe(recipe);
      setLoading(false);

      if (recipe.preSignedUrls) {
        presignedUrlsSubject.next(recipe.preSignedUrls);
      } else {
        presignedUrlsSubject.next([]);
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
    presignedUrlsSubject.next([]);
    setCloning(true);
    triggerDialog();
  };

  return !loading ? (
    <Box id="recipe-container">
      <InnerNavigationBar title={recipe.rawTitle}></InnerNavigationBar>
      <RecipeDialog
        mode={Mode.Edit}
        recipeDialogInfo={{
          recipe,
          open: dialogOpen,
          cloning,
          defaultTileImageKey: recipe.defaultTileImageKey,
          openSnackBar: props.openSnackBar,
          presignedUrls$: presignedUrls$,
          fetchData: fetchData,
          addRecipeMutation: props.addRecipeMutation,
          triggerDialog: triggerDialog,
        }}
      />
      <div className="view-recipe">
        <MobileRecipeToolbar
          width={width}
          triggerDialog={triggerDialog}
          cloneRecipe={cloneRecipe}
        />
        <div id="width-setter">
          <div className="section">
            <div
              id="recipe-title"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(recipe.title),
              }}
            />
          </div>
          <div className="section">
            <div dangerouslySetInnerHTML={{ __html: recipe.ingredients }} />
          </div>
          <div className="section">
            <div dangerouslySetInnerHTML={{ __html: recipe.directions }} />
          </div>
          <div className="section">
            {tags.map((tag) =>
              tag.selected ? (
                <Chip
                  key={tag.label}
                  className={'chip selectedTag'}
                  label={tag.label}
                />
              ) : null,
            )}
          </div>
          <Divider style={{ margin: '20px 0 10px 0' }} />
          <div id={recipe.preSignedUrls?.length < 2 ? 'noGrid' : 'images'}>
            <LightboxComponent
              preSignedUrls={recipe.preSignedUrls}
            ></LightboxComponent>
          </div>
        </div>
      </div>
      {width > 700 ? (
        <div id="floating-buttons">
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
        </div>
      ) : null}
    </Box>
  ) : (
    <div className="BounceLoader">
      <BounceLoader size={100} color={'#689943'} />
    </div>
  );
};

export default Recipe;
