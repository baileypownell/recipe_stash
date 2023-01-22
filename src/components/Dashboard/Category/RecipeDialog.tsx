import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
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
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import DOMPurify from 'dompurify';
import { htmlToText } from 'html-to-text';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { forwardRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router';
import { FullRecipe, RawRecipe } from '../../../../server/recipe';
import side_dish from '../../../images/asparagus.jpg';
import other from '../../../images/bread.jpg';
import dessert from '../../../images/dessert.jpg';
import drinks from '../../../images/drinks.jpg';
import breakfast from '../../../images/french_toast.jpg';
import lunch from '../../../images/lunch.jpg';
import dinner from '../../../images/pizza.jpg';
import options from '../../../models/options';
import { tags as RecipeTags } from '../../../models/tags';
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
} from '../../../services/recipe-services';
import { queryClient } from '../../App';
import FileUpload from '../../File-Upload/FileUpload';
import { GridView } from '../Dashboard';
import { AddRecipeMutationParam } from '../../RecipeCache';

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

const determineCategory = (recipeDialogInfo, mode): string => {
  if (mode === Mode.Add) {
    return options.find(
      (option) => option.label === (recipeDialogInfo as AddProps).category,
    ).value;
  } else if (mode === Mode.Edit) {
    return (recipeDialogInfo as EditProps).recipe.category;
  }
};

const RecipeDialog = ({ recipeDialogInfo, mode }: Props) => {
  const [loading, setLoading] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [directions, setDirections] = useState('');
  const [category, setCategory] = useState(
    determineCategory(recipeDialogInfo, mode),
  );
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
  const theme = useTheme();

  useEffect(() => {
    if (mode === Mode.Edit) {
      const recipe = (recipeDialogInfo as EditProps).recipe;
      setRecipeTitle(recipe.title);
      setIngredients(recipe.ingredients);
      setDirections(recipe.directions);

      tags.map((tag) => {
        if (
          (recipeDialogInfo as EditProps).recipe.tags.includes(
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
    if (mode === Mode.Edit) {
      setOpen((recipeDialogInfo as EditProps).open);
    }
  }, [(recipeDialogInfo as EditProps).open]);

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
      recipeTitleRaw || (recipeDialogInfo as EditProps).recipe.rawTitle,
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
        await (recipeDialogInfo as AddProps).addRecipe(param);
        clearState();
        setLoading(false);
      } else if (mode === Mode.Edit) {
        if ((recipeDialogInfo as EditProps).cloning) {
          const param: AddRecipeMutationParam = {
            recipeInput,
            files: newFiles,
            defaultTile,
          };
          const recipe = await (
            recipeDialogInfo as EditProps
          ).addRecipeMutation(param);
          setFilesToDelete([]);
          setNewFiles([]);
          setLoading(false);
          navigate(`/recipes/${recipe.id}`);
          window.location.reload();
          (recipeDialogInfo as EditProps).triggerDialog();
        } else {
          setLoading(true);
          const recipeUpdateInput: UpdateRecipeInput = {
            title: recipeTitle,
            rawTitle,
            ingredients: ingredients,
            directions: directions,
            recipeId: (recipeDialogInfo as EditProps).recipe.id,
            category,
            ...determineTags(),
          };
          try {
            const updatedRecipe: RawRecipe = await RecipeService.updateRecipe(
              recipeUpdateInput,
              newFiles,
              defaultTile,
              filesToDelete,
              (recipeDialogInfo as EditProps).recipe.id,
              (recipeDialogInfo as EditProps)
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
            (recipeDialogInfo as EditProps).openSnackBar(
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
    (recipeDialogInfo as EditProps).triggerDialog();
    (recipeDialogInfo as EditProps).fetchData();
    setFilesToDelete([]);
    setNewFiles([]);
  };

  const toggleModal = (): void => {
    const prevOpenState = open;
    setOpen(!prevOpenState);

    if (mode === Mode.Edit) {
      (recipeDialogInfo as EditProps).triggerDialog();
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

  const { id, gridView } = recipeDialogInfo as AddProps;

  const getTitle = () => {
    if (mode === Mode.Add) {
      return 'Add Recipe';
    } else if (mode === Mode.Edit) {
      return (recipeDialogInfo as EditProps).cloning
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
        (recipeDialogInfo as EditProps).recipe.id,
      );
      const current: SortedRecipeInterface =
        queryClient.getQueryData('recipes');
      queryClient.setQueryData('recipes', () => {
        const updatedArray = current[category].filter(
          (el) => el.id !== (recipeDialogInfo as EditProps).recipe.id,
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
      (recipeDialogInfo as EditProps).openSnackBar('There was an error.');
    }
  };

  const editing =
    !(recipeDialogInfo as EditProps).cloning && mode === Mode.Edit;

  const getBackgroundImage = (categoryId: string): string => {
    switch (categoryId) {
      case 'breakfast':
        return breakfast;
      case 'lunch':
        return lunch;
      case 'dinner':
        return dinner;
      case 'side_dish':
        return side_dish;
      case 'drinks':
        return drinks;
      case 'dessert':
        return dessert;
      case 'other':
        return other;
    }
  };

  const selectedStyles = {
    backgroundColor: theme.palette.orange.main,
    color: 'white',
  };

  return (
    <>
      {mode === Mode.Add ? (
        gridView === GridView.Grid ? (
          <Stack
            justifyContent="center"
            alignItems="center"
            onClick={toggleModal}
            id={id}
            sx={{
              backgroundImage: `url(${getBackgroundImage(id)})`,
              boxShadow: '5px 1px 30px #868686',
              minWidth: '150px',
              backgroundBlendMode: 'overlay',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginRight: '10px',
              marginBottom: '10px',
              color: theme.palette.primary.main,
              borderRadius: '5px',
              border: `2px solid ${theme.palette.primary.main}`,
              cursor: 'pointer',
              transition: 'background-color 0.5s',
              '&:hover': {
                backgroundColor: 'rgba(331, 68, 68, 0.2)',
              },
            }}
          >
            <AddCircleRoundedIcon color="info" sx={{ fontSize: '45px' }} />
          </Stack>
        ) : (
          <Button
            variant="contained"
            color="orange"
            onClick={toggleModal}
            sx={{ marginBottom: 1, color: theme.palette.info.main }}
            startIcon={<AddCircleRoundedIcon />}
          >
            Add Recipe
          </Button>
        )
      ) : null}

      <Dialog
        fullScreen
        open={open}
        onClose={toggleModal}
        TransitionComponent={Transition}
      >
        <DialogTitle>{getTitle()}</DialogTitle>
        <DialogContent>
          <Box paddingBottom={2}>
            <Typography variant="overline">Recipe Name</Typography>
            <ReactQuill
              defaultValue={
                mode === Mode.Edit
                  ? (recipeDialogInfo as EditProps).recipe.title
                  : null
              }
              onChange={handleModelChange}
            />
          </Box>
          <Box paddingBottom={2}>
            <Typography variant="overline">Ingredients</Typography>
            <ReactQuill
              defaultValue={
                mode === Mode.Edit
                  ? (recipeDialogInfo as EditProps).recipe.ingredients
                  : null
              }
              onChange={handleModelChangeIngredients}
            />
          </Box>

          <Box paddingBottom={2}>
            <Typography variant="overline">Directions</Typography>
            <ReactQuill
              defaultValue={
                mode === Mode.Edit
                  ? (recipeDialogInfo as EditProps).recipe.directions
                  : null
              }
              onChange={handleModelChangeDirections}
            />
          </Box>
          <Box>
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
          </Box>
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
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.4s',
                        '&:hover': {
                          backgroundColor: `${theme.palette.orange.main}`,
                          color: 'white',
                        },
                        ...(tags[index].selected && selectedStyles),
                      }}
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
                (recipeDialogInfo as EditProps).defaultTileImageKey
              }
              passDefaultTileImage={setDefaultTileImage}
              preExistingImageUrls={
                (recipeDialogInfo as EditProps).presignedUrls$
              }
              passFilesToDelete={handleFilesToDelete}
              passFiles={setFiles}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Stack
            justifyContent="space-between"
            sx={{
              width: '100%',
              [theme.breakpoints.up('sm')]: {
                flexDirection: 'row-reverse',
              },
              button: {
                margin: '5px',
                [theme.breakpoints.up('sm')]: {
                  margin: 0,
                },
              },
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              disabled={!recipeValid}
              onClick={saveRecipe}
              startIcon={loading ? null : <AddCircleRoundedIcon />}
            >
              {loading ? (
                <CircularProgress
                  style={{ color: 'white', height: '26px', width: '26px' }}
                />
              ) : (
                <>
                  {mode === Mode.Add || (recipeDialogInfo as EditProps).cloning
                    ? 'Add Recipe'
                    : 'Update Recipe'}
                </>
              )}
            </Button>
            <Box
              className={editing ? 'edit' : null}
              sx={{
                display: editing ? 'flex' : 'block',
              }}
            >
              {editing ? (
                <Button
                  color="primary"
                  variant="contained"
                  style={{ marginRight: '5px ' }}
                  onClick={deleteRecipe}
                  startIcon={<DeleteOutlineRoundedIcon />}
                >
                  Delete Recipe
                </Button>
              ) : null}
              <Button
                sx={{
                  flexGrow: editing ? 1 : 0,
                }}
                onClick={toggleModal}
                variant="outlined"
                startIcon={<CancelRoundedIcon />}
              >
                Cancel
              </Button>
            </Box>
          </Stack>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RecipeDialog;
