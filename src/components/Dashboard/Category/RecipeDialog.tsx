import { AddCircleRoundedIcon } from '@icons';
import { CancelRoundedIcon } from '@icons';
import { DeleteOutlineRoundedIcon } from '@icons';

import {
  Box,
  Button,
  Chip,
  Modal,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import DOMPurify from 'dompurify';
import { htmlToText } from 'html-to-text';
import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useNavigate } from 'react-router';
import type { ExistingFileUpload, NewFileUpload } from '../../../models/images';
import options from '../../../models/options';
import { recipeTagChips } from '../../../models/tags';
import { RecipeService } from '../../../services/recipe-services';
import type {
  RecipeInput,
  RecipeTags,
  SortedRecipeInterface,
  UpdateRecipeInput,
} from '../../../services/recipe-services';
import { queryClient } from '../../App';
import FileUpload from './FileUpload';
import type { FullRecipe, RawRecipe } from '../../../../shared/types';

type SelectChangeEvent = { target: { value: string } };

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

export type AddProps = {
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

interface QuillEditorProps {
  value: string;
  onChange: (html: string, text: string) => void;
}

const QuillEditor = ({ value, onChange }: QuillEditorProps) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<Quill | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current || quillRef.current) {
      return;
    }

    const quill = new Quill(editorRef.current, {
      modules: {
        toolbar: [
          ['bold', 'italic', 'underline'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link'],
        ],
      },
      theme: 'snow',
    });

    editorRef.current
      .querySelectorAll<HTMLButtonElement>('button')
      .forEach((button) => {
        button.style.backgroundColor = 'transparent';
      });
    editorRef.current
      .querySelectorAll<HTMLElement>('.select-wrapper')
      .forEach((wrapper) => {
        wrapper.style.display = 'none';
      });

    quill.on('text-change', () => {
      const root = quill.root;
      onChangeRef.current(root.innerHTML, quill.getText());
    });

    quillRef.current = quill;
  }, []);

  useEffect(() => {
    const quill = quillRef.current;

    if (!quill || quill.root.innerHTML === value) {
      return;
    }

    const selection = quill.getSelection();
    quill.clipboard.dangerouslyPasteHTML(value || '');

    if (selection) {
      quill.setSelection(selection.index, selection.length);
    }
  }, [value]);

  return <div ref={editorRef} />;
};

const determineCategory = (
  recipeDialogInfo: AddProps | EditProps,
  mode: Mode,
): string => {
  return mode === Mode.Edit
    ? (recipeDialogInfo as EditProps).recipe.category
    : '';
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
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === Mode.Edit) {
      const recipe = (recipeDialogInfo as EditProps).recipe;
      setRecipeTitle(recipe.rawTitle || htmlToText(recipe.title));
      setIngredients(recipe.ingredients);
      setDirections(recipe.directions);

      tags.forEach((tag) => {
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
    const rawTitle = recipeTitle.trim();
    setLoading(true);
    const recipeInput: RecipeInput = {
      title: DOMPurify.sanitize(rawTitle, {}),
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

  const updateCategory = (e: SelectChangeEvent) => setCategory(e.target.value);

  const toggleTagSelectionStatus = (index: number) => {
    const copyTags = [...tags];
    const item = { ...copyTags[index] };
    const priorSelectedValue = item.selected;
    item.selected = !priorSelectedValue;
    copyTags[index] = item;
    setTags(copyTags);
  };

  const handleModelChangeIngredients = (html: string) => setIngredients(html);

  const handleModelChangeDirections = (html: string) => setDirections(html);

  useEffect(() => {
    const rawDirections = htmlToText(directions);
    const rawIngredients = htmlToText(ingredients);
    const rawTitle = htmlToText(recipeTitle);
    const recipeValid: boolean =
      !!rawDirections.trim() &&
      !!rawIngredients.trim() &&
      !!rawTitle.trim() &&
      !!category;
    setRecipeValid(recipeValid);
  }, [recipeTitle, ingredients, directions, category]);

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
    !(recipeDialogInfo as EditProps)?.cloning && mode === Mode.Edit;

  return (
    <Modal opened={open} onClose={toggleModal} title={getTitle()} size="1100px">
      <Stack gap="xl">
        <Stack gap="md">
          <TextInput
            label="Recipe name"
            value={recipeTitle}
            required
            onChange={(event) => setRecipeTitle(event.currentTarget.value)}
          />
          <Select
            label="Category"
            value={category}
            required
            onChange={(value) =>
              updateCategory({ target: { value: value ?? '' } })
            }
            data={options.map((val) => ({
              value: val.value,
              label: val.label,
            }))}
          />
          <Box>
            <Text size="sm" fw={500} mb="xs">Tags</Text>
            <Group gap="xs">
              {tags.map((tag, index) => {
                return (
                  <Chip
                    checked={tag.selected}
                    id={index.toString()}
                    key={tag.label}
                    onChange={() => toggleTagSelectionStatus(index)}
                  >
                    {tag.label}
                  </Chip>
                );
              })}
            </Group>
          </Box>
        </Stack>

        <Box>
          <Text size="sm" fw={500} mb="xs">Ingredients</Text>
          <QuillEditor
            value={ingredients}
            onChange={handleModelChangeIngredients}
          />
        </Box>

        <Box>
          <Text size="sm" fw={500} mb="xs">Directions</Text>
          <QuillEditor
            value={directions}
            onChange={handleModelChangeDirections}
          />
        </Box>

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
      </Stack>
      <Group justify="space-between" mt="xl">
        <Box>
          {editing ? (
            <Button
              color="red"
              variant="filled"
              onClick={deleteRecipe}
              leftSection={<DeleteOutlineRoundedIcon />}
            >
              Delete Recipe
            </Button>
          ) : null}
        </Box>
        <Group>
          <Button
            onClick={toggleModal}
            variant="outline"
            leftSection={<CancelRoundedIcon />}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="dark"
            disabled={!recipeValid}
            loading={loading}
            onClick={saveRecipe}
            leftSection={loading ? null : <AddCircleRoundedIcon />}
          >
            {mode === Mode.Add || (recipeDialogInfo as EditProps).cloning
              ? 'Add Recipe'
              : 'Update Recipe'}
          </Button>
        </Group>
      </Group>
    </Modal>
  );
};

export default RecipeDialog;
