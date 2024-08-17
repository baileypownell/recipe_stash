import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LoadingButton } from '@mui/lab';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import DOMPurify from 'dompurify';
import { htmlToText } from 'html-to-text';
import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router';
import { FullRecipe, RawRecipe } from '../../../../server/recipe';
import options from '../../../models/options';
import { recipeTagChips } from '../../../models/tags';
import {
  RecipeInput,
  RecipeService,
  RecipeTags,
  SortedRecipeInterface,
  UpdateRecipeInput,
} from '../../../services/recipe-services';
import { queryClient } from '../../App';
import FileUpload from './FileUpload';
import { ExistingFileUpload, NewFileUpload } from '../../../models/images';

type EditProps = {
  recipe: any;
  cloning: boolean;
  defaultTileImageKey: string | null;
  openSnackBar: Function;
  presignedUrls: string[];
  fetchData: Function;
  addRecipeMutation: Function;
  triggerDialog: Function;
};

type AddProps = {
  category: string;
  addRecipe: Function;
};

export enum Mode {
  Add = 'Add',
  Edit = 'Edit',
}

interface Props {
  recipeDialogInfo: AddProps | EditProps;
  mode: Mode;
  open: boolean;
  toggleModal: () => void;
}

const determineCategory = (recipeDialogInfo, mode): string => {
  if (mode === Mode.Add) {
    return options.find(
      (option) => option.label === (recipeDialogInfo as AddProps).category,
    )!.value;
  } else if (mode === Mode.Edit) {
    return (recipeDialogInfo as EditProps).recipe.category;
  } else {
    return '';
  }
};

const RecipeDialog = ({ recipeDialogInfo, mode, toggleModal, open }: Props) => {
  const [loading, setLoading] = useState(false);
  const [recipeTitle, setRecipeTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [directions, setDirections] = useState('');
  const [files, setFiles] = useState<(NewFileUpload | ExistingFileUpload)[]>(
    [],
  );
  const [category, setCategory] = useState(
    determineCategory(recipeDialogInfo, mode),
  );
  const [recipeValid, setRecipeValid] = useState(false);
  const [tags, setTags] = useState(
    recipeTagChips.map((tag) => ({ ...tag, selected: false })),
  );
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

  const clearState = () => {
    setRecipeTitle('');
    setIngredients('');
    setDirections('');
    toggleModal();
    setTags(tags);
  };

  const determineTags = (): RecipeTags => {
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
      isHighProtein: tags[9].selected,
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
        await (recipeDialogInfo as AddProps).addRecipe({
          recipeInput,
          files: files,
          defaultTile: files.find((file) => file.isDefault),
        });
        clearState();
        setLoading(false);
      } else if (mode === Mode.Edit) {
        if ((recipeDialogInfo as EditProps).cloning) {
          const recipe = await (
            recipeDialogInfo as EditProps
          ).addRecipeMutation({
            recipeInput,
            files,
          });
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
              files,
              (recipeDialogInfo as EditProps).recipe.id,
              (recipeDialogInfo as EditProps).recipe.defaultTileImageKey,
              (recipeDialogInfo as EditProps).presignedUrls,
            );
            const formattedRecipe: FullRecipe = await RecipeService.getRecipe(
              updatedRecipe.recipe_uuid,
            );
            queryClient.setQueryData('recipes', () => {
              const current = queryClient.getQueryData(
                'recipes',
              ) as SortedRecipeInterface;
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
  };

  const updateCategory = (e) => setCategory(e.target.value);

  const toggleTagSelectionStatus = (index: number) => {
    const copyTags = [...tags];
    const item = { ...copyTags[index] };
    const priorSelectedValue = item.selected;
    item.selected = !priorSelectedValue;
    copyTags[index] = item;
    setTags(copyTags);
  };

  const handleModelChange = (html: string, _, __, editor) => {
    setRecipeTitle(html);
    const recipe_title_raw = editor.getText();
    setRecipeTitleRaw(recipe_title_raw);
  };

  const handleModelChangeIngredients = (html: string) => setIngredients(html);

  const handleModelChangeDirections = (html: string) => setDirections(html);

  useEffect(() => {
    const rawDirections = htmlToText(directions);
    const rawIngredients = htmlToText(ingredients);
    const rawTitle = htmlToText(recipeTitle);
    const recipeValid: boolean =
      !!rawDirections.trim() && !!rawIngredients.trim() && !!rawTitle.trim();
    setRecipeValid(recipeValid);
  }, [recipeTitle, ingredients, directions]);

  const getTitle = () => {
    if (mode === Mode.Add) {
      return 'Add Recipe';
    } else if (mode === Mode.Edit) {
      return (recipeDialogInfo as EditProps).cloning
        ? 'Add Recipe'
        : 'Edit Recipe';
    }
  };

  const deleteRecipe = async () => {
    try {
      await RecipeService.deleteRecipe(
        (recipeDialogInfo as EditProps).recipe.id,
      );
      const current = queryClient.getQueryData(
        'recipes',
      ) as SortedRecipeInterface;
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
      navigate('/recipes');
    } catch (err) {
      console.log(err);
      (recipeDialogInfo as EditProps).openSnackBar('There was an error.');
    }
  };

  const editing =
    !(recipeDialogInfo as EditProps).cloning && mode === Mode.Edit;

  return (
    <Dialog fullScreen open={open}>
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
            <Select value={category} onChange={updateCategory}>
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
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Recipe Tags</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography mb={2}>
              Use tags to characterize your recipe so that you can easily find
              recipes with similar tags through the dashboard filter.
            </Typography>
            <Stack spacing={1} direction="row">
              {tags.map((tag, index) => {
                return (
                  <Chip
                    color={tags[index].selected ? 'primary' : 'default'}
                    id={index.toString()}
                    key={tag.label}
                    onClick={() => toggleTagSelectionStatus(index)}
                    label={tag.label}
                  />
                );
              })}
            </Stack>
          </AccordionDetails>
        </Accordion>
        {mode === Mode.Add ? (
          <FileUpload passFiles={setFiles} />
        ) : (
          <FileUpload
            passFiles={setFiles}
            defaultTileImageUUID={
              (recipeDialogInfo as EditProps).defaultTileImageKey
            }
            preExistingImageUrls={(recipeDialogInfo as EditProps).presignedUrls}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Stack
          justifyContent="space-between"
          spacing={1}
          alignItems="center"
          sx={{
            width: '100%',
            [theme.breakpoints.up('sm')]: {
              flexDirection: 'row-reverse',
            },
            button: {
              [theme.breakpoints.down('sm')]: {
                width: '100%',
              },
              [theme.breakpoints.up('sm')]: {
                margin: 0,
              },
            },
          }}
        >
          <LoadingButton
            variant="contained"
            color="secondary"
            disabled={!recipeValid}
            loading={loading}
            onClick={saveRecipe}
            startIcon={loading ? null : <AddCircleRoundedIcon />}
          >
            {mode === Mode.Add || (recipeDialogInfo as EditProps).cloning
              ? 'Add Recipe'
              : 'Update Recipe'}
          </LoadingButton>
          <Box
            sx={{
              display: editing ? 'flex' : 'block',
              [theme.breakpoints.down('md')]: {
                width: '100%',
                maxWidth: '400px',
              },
              [theme.breakpoints.up('md')]: {
                marginTop: `0!important`,
                width: 'auto',
              },
            }}
          >
            {editing ? (
              <Button
                color="primary"
                variant="contained"
                style={{
                  marginRight: '5px ',
                  width: '100%',
                  whiteSpace: 'nowrap',
                  minWidth: 'auto',
                }}
                onClick={deleteRecipe}
                startIcon={<DeleteOutlineRoundedIcon />}
              >
                Delete Recipe
              </Button>
            ) : null}
            <Button
              sx={{
                flexGrow: editing ? 1 : 0,
                width: '100%',
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
  );
};

export default RecipeDialog;
