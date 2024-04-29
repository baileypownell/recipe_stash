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
    createRecipe: async (recipeInput, files, defaultTile) => {
        try {
            const recipeCreated = await axios_1.default.post('/recipe', recipeInput);
            if (files?.length) {
                try {
                    const uploadedImageKeys = await exports.RecipeService.uploadFiles(recipeCreated.data.recipe_uuid, files);
                    const defaultTileImage = uploadedImageKeys.find((key) => key.id === defaultTile);
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
        try {
            return await Promise.all(files.map(async (file) => {
                const formData = new FormData();
                formData.append('image', file.file);
                try {
                    const upload = await axios_1.default.post(`/file-upload/${recipeId}`, formData, {
                        headers: {
                            'content-type': 'multipart/form-data',
                        },
                    });
                    return {
                        awsKey: upload.data.key,
                        id: file.id,
                    };
                }
                catch (error) {
                    console.log('There was an error uploading a file: ', error);
                    throw error;
                }
            }));
        }
        catch (error) {
            throw error;
        }
    },
    updateRecipe: async (recipeInput, files, defaultTile, fileUrlsToDelete, recipeId, recipe) => {
        try {
            const res = await axios_1.default.put('/recipe', recipeInput);
            const recipeUpdated = res.data;
            const uploads = files;
            const uploading = !!uploads.length;
            const deleting = !!fileUrlsToDelete?.length;
            if (uploading && deleting) {
                return exports.RecipeService.uploadFiles(recipeId, uploads).then(() => {
                    return exports.RecipeService.deleteFiles(fileUrlsToDelete)
                        .then(() => {
                        if (defaultTile) {
                            return exports.RecipeService.setTileImage(recipeUpdated.recipe_uuid, defaultTile).then(() => recipeUpdated);
                        }
                        else if (recipe.defaultTileImageKey) {
                            return exports.RecipeService.removeTileImage(recipeId).then(() => recipeUpdated);
                        }
                        else {
                            return recipeUpdated;
                        }
                    })
                        .catch((e) => e);
                });
            }
            else if (uploading) {
                return exports.RecipeService.uploadFiles(recipeId, uploads)
                    .then((uploadedImageKeys) => {
                    if (defaultTile) {
                        let awsKey;
                        if (uploadedImageKeys.find((obj) => obj.id === defaultTile)) {
                            awsKey = uploadedImageKeys.find((obj) => obj.id === defaultTile).awsKey;
                        }
                        else {
                            awsKey = defaultTile;
                        }
                        return exports.RecipeService.setTileImage(recipeUpdated.recipe_uuid, awsKey).then(() => recipeUpdated);
                    }
                    else if (recipe.defaultTileImageKey) {
                        return exports.RecipeService.removeTileImage(recipeId).then(() => recipeUpdated);
                    }
                    else {
                        return recipeUpdated;
                    }
                })
                    .catch((e) => e);
            }
            else if (deleting) {
                try {
                    await exports.RecipeService.deleteFiles(fileUrlsToDelete);
                    if (defaultTile) {
                        try {
                            await exports.RecipeService.setTileImage(recipeId, defaultTile);
                            return recipeUpdated;
                        }
                        catch (e) {
                            throw e;
                        }
                    }
                    else if (recipe.defaultTileImageKey) {
                        try {
                            await exports.RecipeService.removeTileImage(recipeId);
                            return recipeUpdated;
                        }
                        catch (e) {
                            throw e;
                        }
                    }
                    else {
                        return recipeUpdated;
                    }
                }
                catch (error) {
                    throw error;
                }
            }
            else {
                if (defaultTile) {
                    return exports.RecipeService.setTileImage(recipeId, defaultTile)
                        .then(() => recipeUpdated)
                        .catch((e) => e);
                }
                else if (recipe.defaultTileImageKey) {
                    return exports.RecipeService.removeTileImage(recipeId)
                        .then(() => recipeUpdated)
                        .catch((e) => e);
                }
                else {
                    return recipeUpdated;
                }
            }
        }
        catch (e) {
            throw e;
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