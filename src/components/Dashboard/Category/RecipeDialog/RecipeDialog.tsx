import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Typography,
} from '@mui/material';
import DOMPurify from 'dompurify';
import { htmlToText } from 'html-to-text';
import { forwardRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router';
import { FullRecipe, RawRecipe } from '../../../../../server/recipe';
import options from '../../../../models/options';
import { tags as RecipeTags } from '../../../../models/tags';
import {
  DefaultTile,
  ExistingFile,
  IRecipeTags,
  NewFileInterface,
  RecipeInput,
  RecipeInterface,
  RecipeService,
  SortedRecipeInterface,
  UpdateRecipeInput,
} from '../../../../services/recipe-services';
import { queryClient } from '../../../App';
import FileUpload from '../../../File-Upload/FileUpload';
import { AddRecipeMutationParam } from '../../RecipeCache/RecipeCache';
import { GridView } from '../../Dashboard';
import './RecipeDialog.scss';

const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type EditProps = {
  recipe: any;
  open: boolean;
  cloning: boolean;
  defaultTileImageKey: string;
  openSnackBar: Function;
  presignedUrls$: any;
  fetchData: Function;
  addRecipeMutation: Function;
  triggerDialog: Function;
};

type AddProps = {
  id: string;
  category: string;
  addRecipe: Function;
  gridView: GridView;
};

export enum Mode {
  Add = 'Add',
  Edit = 'Edit',
}

interface Props {
  recipeDialogInfo: AddProps | EditProps;
  mode: Mode;
}

const determineCategory = (props: Props): string => {
  if (props.mode === Mode.Add) {
    return options.find(
      (option) =>
        option.label === (props.recipeDialogInfo as AddProps).category,
    ).value;
  } else if (props.mode === Mode.Edit) {
    return (props.recipeDialogInfo as EditProps).recipe.category;
  }
};

const RecipeDialog = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [directions, setDirections] = useState('');
  const [category, setCategory] = useState(determineCategory(props));
  const [recipeValid, setRecipeValid] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [tags, setTags] = useState(
    RecipeTags.map((tag) => ({ ...tag, selected: false })),
  );
  const [defaultTile, setDefaultTile] = useState(null);
  const [open, setOpen] = useState(false);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [recipeTitleRaw, setRecipeTitleRaw] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (props.mode === Mode.Edit) {
      const recipe = (props.recipeDialogInfo as EditProps).recipe;
      setRecipeTitle(recipe.title);
      setIngredients(recipe.ingredients);
      setDirections(recipe.directions);

      tags.map((tag) => {
        if (
          (props.recipeDialogInfo as EditProps).recipe.tags.includes(
            tag.recipeTagPropertyName,
          )
        ) {
          tag.selected = true;
        }
        return tag;
      });
    }
  }, []);

  useEffect(() => {
    if (props.mode === Mode.Edit) {
      setOpen((props.recipeDialogInfo as EditProps).open);
    }
  }, [(props.recipeDialogInfo as EditProps).open]);

  const clearState = () => {
    const prevOpenState = open;
    setRecipeTitle('');
    setIngredients('');
    setDirections('');
    setOpen(!prevOpenState);
    setTags(tags);
  };

  const determineTags = (): IRecipeTags => {
    return {
      isNoBake: tags[0].selected,
      isEasy: tags[1].selected,
      isHealthy: tags[2].selected,
      isGlutenFree: tags[3].selected,
      isDairyFree: tags[4].selected,
      isSugarFree: tags[5].selected,
      isVegetarian: tags[6].selected,
      isVegan: tags[7].selected,
      isKeto: tags[8].selected,
    };
  };

  const saveRecipe = async (e: any) => {
    e.preventDefault();
    const titleHTML = DOMPurify.sanitize(
      recipeTitleRaw || (props.recipeDialogInfo as EditProps).recipe.rawTitle,
    );
    const rawTitle = htmlToText(titleHTML, { wordwrap: 130 });
    setLoading(true);
    const recipeInput: RecipeInput = {
      title: DOMPurify.sanitize(recipeTitle, {}),
      rawTitle,
      category,
      ingredients: DOMPurify.sanitize(ingredients, {}),
      directions: DOMPurify.sanitize(directions, {}),
      ...determineTags(),
    };
    try {
      if (mode === Mode.Add) {
        const param: AddRecipeMutationParam = {
          recipeInput,
          files: newFiles,
          defaultTile,
        };
        await (props.recipeDialogInfo as AddProps).addRecipe(param);
        clearState();
        setLoading(false);
      } else if (mode === Mode.Edit) {
        if ((props.recipeDialogInfo as EditProps).cloning) {
          const param: AddRecipeMutationParam = {
            recipeInput,
            files: newFiles,
            defaultTile,
          };
          const recipe = await (
            props.recipeDialogInfo as EditProps
          ).addRecipeMutation(param);
          setFilesToDelete([]);
          setNewFiles([]);
          setLoading(false);
          navigate(`/recipes/${recipe.id}`);
          window.location.reload();
          (props.recipeDialogInfo as EditProps).triggerDialog();
        } else {
          setLoading(true);
          const recipeUpdateInput: UpdateRecipeInput = {
            title: recipeTitle,
            rawTitle,
            ingredients: ingredients,
            directions: directions,
            recipeId: (props.recipeDialogInfo as EditProps).recipe.id,
            category,
            ...determineTags(),
          };
          try {
            const updatedRecipe: RawRecipe = await RecipeService.updateRecipe(
              recipeUpdateInput,
              newFiles,
              defaultTile,
              filesToDelete,
              (props.recipeDialogInfo as EditProps).recipe.id,
              (props.recipeDialogInfo as EditProps)
                .recipe as unknown as RecipeInterface,
            );
            const formattedRecipe: FullRecipe = await RecipeService.getRecipe(
              updatedRecipe.recipe_uuid,
            );
            queryClient.setQueryData('recipes', () => {
              const current: SortedRecipeInterface =
                queryClient.getQueryData('recipes');
              const updatedArray = current[category].map((recipe) => {
                if (recipe.id === updatedRecipe.recipe_uuid) {
                  return formattedRecipe;
                }
                return recipe;
              });
              const updatedCategory = updatedArray;
              return {
                ...current,
                [category]: updatedCategory,
              };
            });
            refreshRecipeView();
            setLoading(false);
          } catch (err) {
            console.log(err);
            setLoading(false);
            (props.recipeDialogInfo as EditProps).openSnackBar(
              'There was an error updating the recipe.',
            );
          }
        }
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const refreshRecipeView = () => {
    (props.recipeDialogInfo as EditProps).triggerDialog();
    (props.recipeDialogInfo as EditProps).fetchData();
    setFilesToDelete([]);
    setNewFiles([]);
  };

  const toggleModal = (): void => {
    const prevOpenState = open;
    setOpen(!prevOpenState);

    if (props.mode === Mode.Edit) {
      (props.recipeDialogInfo as EditProps).triggerDialog();
    }
  };

  const updateCategory = (e) => {
    setCategory(e.target.value);
  };

  const toggleTagSelectionStatus = (index: number) => {
    const copyTags = [...tags];
    const item = { ...copyTags[index] };
    const priorSelectedValue = item.selected;
    item.selected = !priorSelectedValue;
    copyTags[index] = item;
    setTags(copyTags);
  };

  const setFiles = (newFiles: NewFileInterface[]) => {
    setNewFiles(newFiles);
  };

  const setDefaultTileImage = (defaultTile: DefaultTile) => {
    setDefaultTile(defaultTile);
  };

  const handleModelChange = (html: string, delta, source, editor) => {
    setRecipeTitle(html);
    const recipe_title_raw = editor.getText();
    setRecipeTitleRaw(recipe_title_raw);
  };

  const handleModelChangeIngredients = (html: string) => {
    setIngredients(html);
  };

  const handleModelChangeDirections = (html: string) => {
    setDirections(html);
  };

  useEffect(() => {
    const rawDirections = htmlToText(directions);
    const rawIngredients = htmlToText(ingredients);
    const rawTitle = htmlToText(recipeTitle);
    const recipeValid: boolean =
      !!rawDirections.trim() && !!rawIngredients.trim() && !!rawTitle.trim();
    setRecipeValid(recipeValid);
  }, [recipeTitle, ingredients, directions]);

  const { mode } = props;
  const { id, gridView } = props.recipeDialogInfo as AddProps;

  const getTitle = () => {
    if (props.mode === Mode.Add) {
      return 'Add Recipe';
    } else if (props.mode === Mode.Edit) {
      return (props.recipeDialogInfo as EditProps).cloning
        ? 'Add Recipe'
        : 'Edit Recipe';
    }
  };

  const handleFilesToDelete = (files: ExistingFile[]) => {
    setFilesToDelete(files);
  };

  const deleteRecipe = async () => {
    try {
      await RecipeService.deleteRecipe(
        (props.recipeDialogInfo as EditProps).recipe.id,
      );
      const current: SortedRecipeInterface =
        queryClient.getQueryData('recipes');
      queryClient.setQueryData('recipes', () => {
        const updatedArray = current[category].filter(
          (el) => el.id !== (props.recipeDialogInfo as EditProps).recipe.id,
        );
        const updatedCategory = updatedArray;
        const updatedQueryState = {
          ...current,
          [category]: updatedCategory,
        };
        return updatedQueryState;
      });
      // (props.recipeDialogInfo as EditProps).openSnackBar('Recipe deleted.')
      navigate('/recipes');
    } catch (err) {
      console.log(err);
      (props.recipeDialogInfo as EditProps).openSnackBar('There was an error.');
    }
  };

  const editing =
    !(props.recipeDialogInfo as EditProps).cloning && mode === Mode.Edit;

  return (
    <>
      {mode === Mode.Add ? (
        gridView === GridView.Grid ? (
          <Box onClick={toggleModal} className="addRecipe" id={id}>
            <i className="fas fa-plus-circle"></i>
          </Box>
        ) : (
          <Button
            className="add-button"
            variant="contained"
            onClick={toggleModal}
            sx={{ marginBottom: 1 }}
          >
            Add Recipe
            <i className="fas fa-plus-circle" style={{ marginLeft: '8px' }}></i>
          </Button>
        )
      ) : null}

      <Dialog
        fullScreen
        open={open}
        onClose={toggleModal}
        TransitionComponent={Transition}
      >
        <DialogTitle className="title">
          <span>{getTitle()}</span>
        </DialogTitle>
        <DialogContent>
          <h3>Title</h3>
          <ReactQuill
            defaultValue={
              mode === Mode.Edit
                ? (props.recipeDialogInfo as EditProps).recipe.title
                : null
            }
            onChange={handleModelChange}
          />
          <h3>Ingredients</h3>
          <ReactQuill
            defaultValue={
              mode === Mode.Edit
                ? (props.recipeDialogInfo as EditProps).recipe.ingredients
                : null
            }
            onChange={handleModelChangeIngredients}
          />
          <h3>Directions</h3>
          <ReactQuill
            defaultValue={
              mode === Mode.Edit
                ? (props.recipeDialogInfo as EditProps).recipe.directions
                : null
            }
            onChange={handleModelChangeDirections}
          />
          <div>
            <FormControl
              variant="filled"
              style={{ width: '100%', margin: '10px 0' }}
            >
              <InputLabel>Category</InputLabel>
              <Select id="category" value={category} onChange={updateCategory}>
                {options.map((val, index: number) => {
                  return (
                    <MenuItem key={index} value={val.value}>
                      {val.label}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </div>

          <Accordion style={{ margin: '10px 0' }}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography>Recipe Tags</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                {tags.map((tag, index) => {
                  return (
                    <Chip
                      className={`chip ${
                        tags[index].selected ? 'selectedTag' : 'null'
                      }`}
                      id={index.toString()}
                      key={index}
                      onClick={() => toggleTagSelectionStatus(index)}
                      label={tag.label}
                    />
                  );
                })}
              </Typography>
            </AccordionDetails>
          </Accordion>
          {mode === Mode.Add ? (
            <FileUpload
              open={open}
              passDefaultTileImage={setDefaultTileImage}
              passFiles={setFiles}
            />
          ) : (
            <FileUpload
              defaultTileImageUUID={
                (props.recipeDialogInfo as EditProps).defaultTileImageKey
              }
              passDefaultTileImage={setDefaultTileImage}
              preExistingImageUrls={
                (props.recipeDialogInfo as EditProps).presignedUrls$
              }
              passFilesToDelete={handleFilesToDelete}
              passFiles={setFiles}
            />
          )}
        </DialogContent>
        <DialogActions>
          <div className="modal-close-buttons">
            <Button
              variant="contained"
              color="secondary"
              disabled={!recipeValid}
              onClick={saveRecipe}
            >
              {loading ? (
                <CircularProgress
                  style={{ color: 'white', height: '26px', width: '26px' }}
                />
              ) : (
                <>
                  {mode === Mode.Add ||
                  (props.recipeDialogInfo as EditProps).cloning
                    ? 'Add Recipe'
                    : 'Update Recipe'}
                  <i
                    className="fas fa-check-square"
                    style={{ marginLeft: '8px' }}
                  ></i>
                </>
              )}
            </Button>
            <div className={editing ? 'edit' : null}>
              {editing ? (
                <Button
                  color="primary"
                  variant="contained"
                  style={{ marginRight: '5px ' }}
                  onClick={deleteRecipe}
                >
                  Delete Recipe{' '}
                  <i style={{ marginLeft: '8px' }} className="fas fa-trash"></i>
                </Button>
              ) : null}
              <Button id="cancel" onClick={toggleModal} variant="outlined">
                Cancel
              </Button>
            </div>
          </div>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RecipeDialog;
