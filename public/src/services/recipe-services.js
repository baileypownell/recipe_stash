"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecipeService = void 0;
const axios_1 = __importDefault(require("axios"));
exports.RecipeService = {
    sortByTitle(a, b) {
        return a.rawTitle.localeCompare(b.rawTitle);
    },
    getRecipes: async () => {
        try {
            const recipes = await axios_1.default.get('/recipe');
            for (const category in recipes.data) {
                const sortedCategory = recipes.data[category].sort(exports.RecipeService.sortByTitle);
                recipes.data[category] = sortedCategory;
            }
            return recipes.data;
        }
        catch (error) {
            return { error: true, errorMessage: error };
        }
    },
    getRecipe: async (recipeId) => {
        const recipeResponse = await axios_1.default.get(`/recipe/${recipeId}`);
        return recipeResponse.data;
    },
    deleteRecipe: async (recipeId) => {
        return await axios_1.default.delete(`/recipe/${recipeId}`);
    },
    createRecipe: async (recipeInput, files) => {
        try {
            const recipeCreated = await axios_1.default.post('/recipe', recipeInput);
            if (files?.length) {
                try {
                    const uploadedImageKeys = await exports.RecipeService.uploadFiles(recipeCreated.data.recipe_uuid, files);
                    const defaultTileImage = uploadedImageKeys.find((key) => key.file.isDefault);
                    if (defaultTileImage) {
                        try {
                            await exports.RecipeService.handleDefaultTileImage(recipeCreated.data.recipe_uuid, defaultTileImage.awsKey);
                        }
                        catch (error) {
                            console.log(error);
                            throw error;
                        }
                    }
                }
                catch (error) {
                    console.log(error);
                    throw error;
                }
            }
            return recipeCreated.data;
        }
        catch (error) {
            console.log(error);
            throw error;
        }
    },
    handleDefaultTileImage: (recipeId, awsKey) => {
        return exports.RecipeService.setTileImage(recipeId, awsKey);
    },
    uploadFiles: async (recipeId, files) => {
        return await Promise.all(files.map(async (file) => {
            const formData = new FormData();
            formData.append('image', file.file);
            const upload = await axios_1.default.post(`/file-upload/${recipeId}`, formData, {
                headers: {
                    'content-type': 'multipart/form-data',
                },
            });
            return {
                awsKey: upload.data.key,
                file: file,
            };
        }));
    },
    updateRecipe: async (recipeInput, files, recipeId, recipeHasDefaultTileImage, recipeExistingImageUrls) => {
        const res = await axios_1.default.put('/recipe', recipeInput);
        const recipeUpdated = res.data;
        const uploads = files.filter((file) => file.hasOwnProperty('file'));
        const uploading = !!uploads.length;
        const fileUrlsToDelete = recipeExistingImageUrls?.filter((url) => !files
            .filter((file) => file.hasOwnProperty('url'))
            .find((file) => file.url.includes(url)));
        const deleting = !!fileUrlsToDelete?.length;
        const uploadedImageKeys = await exports.RecipeService.uploadFiles(recipeId, uploads);
        const defaultTileImage = uploadedImageKeys.find((key) => key.file.isDefault);
        const existingFileDefaultTile = files.find((file) => file.isDefault && file.hasOwnProperty('url'));
        const existingFileDefaultTileKey = existingFileDefaultTile?.url
            .split('amazonaws.com/')[1]
            .split('?')[0];
        const awsKey = existingFileDefaultTile
            ? existingFileDefaultTileKey
            : defaultTileImage?.awsKey;
        if (uploading && deleting) {
            await exports.RecipeService.deleteFiles(fileUrlsToDelete);
            if (awsKey) {
                await exports.RecipeService.setTileImage(recipeUpdated.recipe_uuid, awsKey);
                return recipeUpdated;
            }
            else if (recipeHasDefaultTileImage) {
                await exports.RecipeService.removeTileImage(recipeId);
                return recipeUpdated;
            }
            else {
                return recipeUpdated;
            }
        }
        else if (uploading) {
            if (awsKey) {
                await exports.RecipeService.setTileImage(recipeUpdated.recipe_uuid, awsKey);
                return recipeUpdated;
            }
            else if (recipeHasDefaultTileImage) {
                await exports.RecipeService.removeTileImage(recipeId);
                return recipeUpdated;
            }
            else {
                return recipeUpdated;
            }
        }
        else if (deleting) {
            await exports.RecipeService.deleteFiles(fileUrlsToDelete);
            if (awsKey) {
                await exports.RecipeService.setTileImage(recipeId, awsKey);
                return recipeUpdated;
            }
            else if (recipeHasDefaultTileImage) {
                await exports.RecipeService.removeTileImage(recipeId);
                return recipeUpdated;
            }
            else {
                return recipeUpdated;
            }
        }
        else {
            if (awsKey) {
                await exports.RecipeService.setTileImage(recipeId, awsKey);
                return recipeUpdated;
            }
            else if (recipeHasDefaultTileImage) {
                await exports.RecipeService.removeTileImage(recipeId);
                return recipeUpdated;
            }
            else {
                return recipeUpdated;
            }
        }
    },
    deleteFiles: async (filesToDeleteKeys) => {
        return await Promise.all(filesToDeleteKeys.map(async (url) => {
            const key = url.split('amazonaws.com/')[1].split('?')[0];
            return await axios_1.default.delete(`/file-upload/${key}`);
        }));
    },
    removeTileImage: async (recipeId) => {
        return axios_1.default.delete(`file-upload/tile-image/${recipeId}`);
    },
    setTileImage: async (recipeId, awsKey) => {
        return axios_1.default.post(`/file-upload/tile-image/${awsKey}/${recipeId}`);
    },
};
//# sourceMappingURL=recipe-services.js.map