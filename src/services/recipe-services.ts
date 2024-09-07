import axios from 'axios';
import { TileImageSetResponse } from '../../server/file-upload';
import { FullRecipe, RawRecipe } from '../../server/recipe';
import {
  ExistingFileUpload,
  NewFileUpload,
  UploadedFileResult,
} from '../models/images';
import tag from '../models/tags';

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

export interface RecipeTags {
  isNoBake: boolean;
  isEasy: boolean;
  isHealthy: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isSugarFree: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isKeto: boolean;
  isHighProtein: boolean;
}

export interface RecipeInput extends RecipeTags {
  title: string;
  rawTitle: string;
  category: string;
  ingredients: string;
  directions: string;
  pairedRecipes: string[];
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

export interface UpdateRecipeInput extends RecipeTags {
  title: string;
  rawTitle: string;
  ingredients: string;
  directions: string;
  recipeId: string;
  category: string;
  pairedRecipes: string[];
}

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
      return { error: true, errorMessage: error as string };
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
    files: NewFileUpload[],
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
            (key) => key.file.isDefault,
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
    files: NewFileUpload[],
  ): Promise<UploadedFileResult[]> => {
    return await Promise.all(
      files.map(
        async (file: {
          file: File;
          isDefault: boolean;
          backgroundImage: string;
        }) => {
          const formData = new FormData();
          formData.append('image', file.file);

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
            file: file,
          };
        },
      ),
    );
  },

  updateRecipe: async (
    recipeInput: UpdateRecipeInput,
    files: (NewFileUpload | ExistingFileUpload)[],
    recipeId: string,
    recipeHasDefaultTileImage: boolean,
    recipeExistingImageUrls?: string[],
  ): Promise<RawRecipe> => {
    const res = await axios.put('/recipe', recipeInput);

    const recipeUpdated: RawRecipe = res.data;
    const uploads: {
      file: File;
      isDefault: boolean;
      backgroundImage: string;
    }[] = files.filter((file) => file.hasOwnProperty('file')) as {
      file: File;
      isDefault: boolean;
      backgroundImage: string;
    }[];
    const uploading = !!uploads.length;

    const fileUrlsToDelete = recipeExistingImageUrls?.filter(
      (url) =>
        !files
          .filter((file) => file.hasOwnProperty('url'))
          .find((file) => (file as ExistingFileUpload).url.includes(url)),
    );
    const deleting = !!fileUrlsToDelete?.length;

    const uploadedImageKeys = await RecipeService.uploadFiles(
      recipeId,
      uploads,
    );

    const defaultTileImage = uploadedImageKeys.find(
      (key) => key.file.isDefault,
    );
    const existingFileDefaultTile = files.find(
      (file) => file.isDefault && file.hasOwnProperty('url'),
    ) as ExistingFileUpload;

    const existingFileDefaultTileKey = existingFileDefaultTile?.url
      .split('amazonaws.com/')[1]
      .split('?')[0];

    const awsKey = existingFileDefaultTile
      ? existingFileDefaultTileKey
      : defaultTileImage?.awsKey;

    if (uploading && deleting) {
      await RecipeService.deleteFiles(fileUrlsToDelete);
      if (awsKey) {
        await RecipeService.setTileImage(recipeUpdated.recipe_uuid, awsKey);
        return recipeUpdated;
      } else if (recipeHasDefaultTileImage) {
        await RecipeService.removeTileImage(recipeId);

        return recipeUpdated;
      } else {
        return recipeUpdated;
      }
    } else if (uploading) {
      if (awsKey) {
        await RecipeService.setTileImage(recipeUpdated.recipe_uuid, awsKey);
        return recipeUpdated;
      } else if (recipeHasDefaultTileImage) {
        await RecipeService.removeTileImage(recipeId);
        return recipeUpdated;
      } else {
        return recipeUpdated;
      }
    } else if (deleting) {
      await RecipeService.deleteFiles(fileUrlsToDelete);
      if (awsKey) {
        await RecipeService.setTileImage(recipeId, awsKey);
        return recipeUpdated;
      } else if (recipeHasDefaultTileImage) {
        await RecipeService.removeTileImage(recipeId);
        return recipeUpdated;
      } else {
        return recipeUpdated;
      }
    } else {
      if (awsKey) {
        await RecipeService.setTileImage(recipeId, awsKey);
        return recipeUpdated;
      } else if (recipeHasDefaultTileImage) {
        await RecipeService.removeTileImage(recipeId);
        return recipeUpdated;
      } else {
        return recipeUpdated;
      }
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
