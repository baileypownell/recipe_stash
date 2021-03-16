import tag from "../models/tags";
import { NewFileInterface, DefaultTile } from "./add-recipe-service";
import axios from 'axios'

export interface RecipeInterface {
    id: number
    title: string
    rawTitle: string
    category: string
    user_id: number
    ingredients: string
    directions: string
    tags: tag[]
    defaultTileImageKey: string
    preSignedUrls?: string[]
}

export interface UpdateRecipeInput {
    title: string
    rawTitle: string
    ingredients: string
    directions: string
    recipeId: number
    category: string
    isNoBake: boolean
    isEasy: boolean
    isHealthy: boolean
    isGlutenFree: boolean 
    isDairyFree: boolean
    isSugarFree: boolean
    isVegetarian: boolean 
    isVegan: boolean
    isKeto: boolean
}

export interface DefaultTileExisting {
    key: string
}

export const EditRecipeService = {


    updateRecipe: (
        recipeInput: UpdateRecipeInput, 
        files: NewFileInterface[], 
        defaultTile: DefaultTile | DefaultTileExisting,
        filesToDelete: ExistingFile[],
        recipeId: number
        ) => {
        return new Promise(async(resolve, reject) => {
            let recipeUpdated = await axios.put(`/recipe`, recipeInput)
            let uploads = files
            //let filesToDelete = filesToDelete
            let uploading = !!uploads.length 
            let deleting = !!filesToDelete?.length
            let uploadedImageKeys
            if (uploading && deleting) {
                uploadedImageKeys = await EditRecipeService.uploadFiles(uploads, recipeId)
                await EditRecipeService.handleDefaultTileImage(recipeUpdated.data.recipeId, uploadedImageKeys, defaultTile)
                await EditRecipeService.deleteFiles(filesToDelete)
                resolve({ recipeUpdate: true })
            } else if (uploading) { 
                uploadedImageKeys = await EditRecipeService.uploadFiles(uploads, recipeId)
                await EditRecipeService.handleDefaultTileImage(recipeUpdated.data.recipeId, uploadedImageKeys)
                resolve({ recipeUpdate: true })
            } else if (deleting) {
                await EditRecipeService.deleteFiles(filesToDelete)
                await EditRecipeService.handleDefaultTileImageExisting(recipeUpdated.data.recipeId)
                resolve({ recipeUpdate: true })
            } else {        
                await EditRecipeService.handleDefaultTileImageExisting(recipeUpdated.data.recipeId)
                resolve({ recipeUpdate: true })
            }
        })        
    },

    uploadFiles: async(newFiles: NewFileInterface[], recipeId: number) => {
        let uploads = newFiles
        return await Promise.all(uploads.map( async file => {
            let formData = new FormData() 
            formData.append('image', file.file)

            let upload = await axios.post(
                `/file-upload/${recipeId}`, 
                formData,
                {
                headers: {
                    'content-type': 'multipart/form-data'
                }
                }
            )
            return {
                awsKey: upload.data.key, 
                fileName: file.file.name
            }
        }))
    },

    handleDefaultTileImage: (
        recipeId: number, 
        uploadedImageKeys: {awsKey: string, fileName: string}[],
        defaultTileImage,
        defaultTileImageKey
    ) => {
        return new Promise(async(resolve, reject) => {
          if (defaultTileImageKey) {
            let isNewDefaultTile = defaultTileImageKey !== recipe.defaultTileImageKey 
            if (isNewDefaultTile) {
                let defaultTileImage = uploadedImageKeys.find(obj => obj.fileName === defaultTileImageKey.fileName)
                let defaultTile = await EditRecipeService.setTileImage(recipeId, defaultTileImage.awsKey)
                resolve(defaultTile)
            } else {
              resolve()
            }
          } else {
            // remove if recipe previously had a default image 
            if (!tdefaultTileImageKey && recipe.defaultTileImageKey) {
              await EditRecipeService.removeTileImage(recipeId)
              resolve()
            } else {
              resolve()
            }
          }
        })
      },



    deleteFiles: async(filesToDelete: ExitingFile[]) => {
        return await Promise.all(filesToDelete.map( async url => {
            let key = url.split('amazonaws.com/')[1].split('?')[0]
            return await axios.delete(`/file-upload/${key}`)
        })
        )
    },

    removeTileImage: async(recipeId: number) => {
        try {
          return await axios.delete(`file-upload/tile-image/${recipeId}`)
        } catch(err) {
          console.log(err)
          return err
        }
      },

      setTileImage: async(recipeId: number, awsKey: string) => {
        try {
          return await axios.post(`/file-upload/tile-image/${awsKey}/${recipeId}`)
        } catch(err) {
          console.log(err)
          return err
        }
      },

      handleDefaultTileImageExisting: (recipeId: number) => {
        return new Promise(async(resolve, reject) => {
          if (defaultTileImageKey) {
            let defaultTile = await EditRecipeService.setTileImage(recipeId, defaultTileImageKey)
            resolve(defaultTile)
          } else {
            // remove if recipe previously had a default image 
            if (!defaultTileImageKey && recipe.defaultTileImageKey) {
              await EditRecipeService.removeTileImage(recipeId)
              resolve()
            } else {
              resolve()
            }
          }
        })
      },



    
}