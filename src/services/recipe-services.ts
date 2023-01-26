import axios from 'axios';
import { NewFile, UploadedFileResult } from '../models/images';
import tag from '../models/tags';
import { RawRecipe, FullRecipe } from '../../server/recipe';
import { TileImageSetResponse } from '../../server/file-upload';

export interface BaseStringAccessibleObjectBoolean {
  [key: string]: boolean;
}

export interface BaseStringAccessibleObjectString {
  [key: string]: string;
}

export interface BaseStringAccessibleObjectRecipeInterface {
  [key: string]: FullRecipe[];
}

export interface SortedRecipeInterface
  extends BaseStringAccessibleObjectRecipeInterface {
  breakfast: FullRecipe[];
  dessert: FullRecipe[];
  dinner: FullRecipe[];
  drinks: FullRecipe[];
  lunch: FullRecipe[];
  other: FullRecipe[];
  side_dish: FullRecipe[];
}

export interface IRecipeTags {
  isNoBake: boolean;
  isEasy: boolean;
  isHealthy: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isSugarFree: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isKeto: boolean;
}

export interface RecipeInput extends RecipeTags {
  title: string;
  rawTitle: string;
  category: string;
  ingredients: string;
  directions: string;
}

export interface RecipeInterface {
  id: string;
  title: string;
  rawTitle: string;
  category: string;
  user_id: number;
  ingredients: string;
  directions: string;
  tags: tag[];
  defaultTileImageKey: string;
  preSignedUrls: string[];
}

export interface UpdateRecipeInput {
  title: string;
  rawTitle: string;
  ingredients: string;
  directions: string;
  recipeId: string;
  category: string;
  isNoBake: boolean;
  isEasy: boolean;
  isHealthy: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isSugarFree: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isKeto: boolean;
}

export interface DefaultTileExisting {
  key: string;
}

// TO-DO: give this meaning
export interface ExistingFile {}

export const RecipeService = {
  sortByTitle(a: RecipeInput | FullRecipe, b: RecipeInput | FullRecipe) {
    return a.rawTitle.localeCompare(b.rawTitle);
  },

  getRecipes: async (): Promise<
    SortedRecipeInterface | { error: boolean; errorMessage: string }
  > => {
    try {
      const recipes = await axios.get('/recipe');
      for (const category in recipes.data) {
        const sortedCategory = recipes.data[category].sort(
          RecipeService.sortByTitle,
        );
        recipes.data[category] = sortedCategory;
      }
      return recipes.data;
    } catch (error) {
      return { error: true, errorMessage: error };
    }
  },

  getRecipe: async (recipeId: string): Promise<FullRecipe> => {
    const recipeResponse = await axios.get(`/recipe/${recipeId}`);
    return recipeResponse.data;
  },

  deleteRecipe: async (
    recipeId: string,
  ): Promise<{ recipeDeleted: boolean }> => {
    return await axios.delete(`/recipe/${recipeId}`);
  },

  createRecipe: async (
    recipeInput: RecipeInput,
    files: NewFile[],
    defaultTile: string | null,
  ): Promise<RawRecipe> => {
    try {
      const recipeCreated = await axios.post('/recipe', recipeInput);
      if (files?.length) {
        try {
          const uploadedImageKeys = await RecipeService.uploadFiles(
            recipeCreated.data.recipe_uuid,
            files,
          );
          const defaultTileImage = uploadedImageKeys.find(
            (key) => key.id === defaultTile,
          );

          if (defaultTileImage) {
            try {
              await RecipeService.handleDefaultTileImage(
                recipeCreated.data.recipe_uuid,
                defaultTileImage.awsKey,
              );
            } catch (error) {
              console.log(error);
              throw error;
            }
          }
        } catch (error) {
          console.log(error);
          throw error;
        }
      }

      return recipeCreated.data;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  handleDefaultTileImage: (recipeId: string, awsKey: string) => {
    return RecipeService.setTileImage(recipeId, awsKey);
  },

  uploadFiles: async (
    recipeId: string,
    files: NewFile[],
  ): Promise<UploadedFileResult[]> => {
    try {
      return await Promise.all(
        files.map(async (file: NewFile) => {
          const formData = new FormData();
          formData.append('image', file.file as any);

          try {
            const upload = await axios.post(
              `/file-upload/${recipeId}`,
              formData,
              {
                headers: {
                  'content-type': 'multipart/form-data',
                },
              },
            );
            return {
              awsKey: upload.data.key,
              id: file.id,
            };
          } catch (error) {
            console.log('There was an error uploading a file: ', error);
            throw error;
          }
        }),
      );
    } catch (error) {
      throw error;
    }
  },

  updateRecipe: async (
    recipeInput: UpdateRecipeInput,
    files: NewFile[],
    defaultTile: string | null,
    filesToDeleteKeys: string[],
    recipeId: string,
    recipe: RecipeInterface,
  ): Promise<RawRecipe> => {
    try {
      const res = await axios.put('/recipe', recipeInput);

      const recipeUpdated: RawRecipe = res.data;
      const uploads: NewFile[] = files;
      const uploading = !!uploads.length;
      const deleting = !!filesToDeleteKeys?.length;

      if (uploading && deleting) {
        return RecipeService.uploadFiles(recipeId, uploads).then(
          (uploadedImageKeys) => {
            return RecipeService.deleteFiles(filesToDeleteKeys)
              .then(() => {
                if (defaultTile) {
                  return RecipeService.setTileImage(
                    recipeUpdated.recipe_uuid,
                    defaultTile,
                  ).then(() => recipeUpdated);
                } else if (recipe.defaultTileImageKey) {
                  return RecipeService.removeTileImage(recipeId).then(
                    () => recipeUpdated,
                  );
                } else {
                  return recipeUpdated;
                }
              })
              .catch((e) => e);
          },
        );
      } else if (uploading) {
        return RecipeService.uploadFiles(recipeId, uploads)
          .then((uploadedImageKeys) => {
            if (defaultTile) {
              let awsKey: string;
              if (uploadedImageKeys.find((obj) => obj.id === defaultTile)) {
                awsKey = uploadedImageKeys.find(
                  (obj) => obj.id === defaultTile,
                ).awsKey;
              } else {
                awsKey = defaultTile as string;
              }
              return RecipeService.setTileImage(
                recipeUpdated.recipe_uuid,
                awsKey,
              ).then(() => recipeUpdated);
            } else if (recipe.defaultTileImageKey) {
              return RecipeService.removeTileImage(recipeId).then(
                () => recipeUpdated,
              );
            } else {
              return recipeUpdated;
            }
          })
          .catch((e) => e);
      } else if (deleting) {
        try {
          await RecipeService.deleteFiles(filesToDeleteKeys);

          if (defaultTile) {
            try {
              await RecipeService.setTileImage(recipeId, defaultTile);
              return recipeUpdated;
            } catch (e) {
              throw e;
            }
          } else if (recipe.defaultTileImageKey) {
            try {
              await RecipeService.removeTileImage(recipeId);
              return recipeUpdated;
            } catch (e) {
              throw e;
            }
          } else {
            return recipeUpdated;
          }
        } catch (error) {
          throw error;
        }
      } else {
        if (defaultTile) {
          return RecipeService.setTileImage(recipeId, defaultTile)
            .then(() => recipeUpdated)
            .catch((e) => e);
        } else if (recipe.defaultTileImageKey) {
          return RecipeService.removeTileImage(recipeId)
            .then(() => recipeUpdated)
            .catch((e) => e);
        } else {
          return recipeUpdated;
        }
      }
    } catch (e) {
      throw e;
    }
  },

  deleteFiles: async (filesToDeleteKeys: string[]) => {
    return await Promise.all(
      filesToDeleteKeys.map(async (url) => {
        const key = url.split('amazonaws.com/')[1].split('?')[0];
        return await axios.delete(`/file-upload/${key}`);
      }),
    );
  },

  removeTileImage: async (recipeId: string): Promise<TileImageSetResponse> => {
    return axios.delete(`file-upload/tile-image/${recipeId}`);
  },

  setTileImage: async (
    recipeId: string,
    awsKey: string,
  ): Promise<TileImageSetResponse> => {
    return axios.post(`/file-upload/tile-image/${awsKey}/${recipeId}`);
  },
};
