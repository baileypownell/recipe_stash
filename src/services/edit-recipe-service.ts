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

export interface ExistingFile {

}

export const EditRecipeService = {

    updateRecipe: (
        recipeInput: UpdateRecipeInput, 
        files: NewFileInterface[], 
        defaultTile: DefaultTile | DefaultTileExisting | null,
        filesToDeleteKeys: string[],
        recipeId: number,
        recipe: RecipeInterface
        ) => {
        return new Promise(async(resolve, reject) => {
            let recipeUpdated = await axios.put(`/recipe`, recipeInput)
            let uploads = files
            let uploading = !!uploads.length 
            let deleting = !!filesToDeleteKeys?.length
            let uploadedImageKeys
            if (uploading && deleting) {
                uploadedImageKeys = await EditRecipeService.uploadFiles(uploads, recipeId)
                await EditRecipeService.handleDefaultTileImage(recipeUpdated.data.recipeId, uploadedImageKeys, defaultTile, recipe.defaultTileImageKey)
                await EditRecipeService.deleteFiles(filesToDeleteKeys)
                resolve({ recipeUpdate: true })
            } else if (uploading) { 
                uploadedImageKeys = await EditRecipeService.uploadFiles(uploads, recipeId)
                await EditRecipeService.handleDefaultTileImage(recipeUpdated.data.recipeId, uploadedImageKeys, defaultTile, recipe.defaultTileImageKey)
                resolve({ recipeUpdate: true })
            } else if (deleting) {
                await EditRecipeService.deleteFiles(filesToDeleteKeys)
                await EditRecipeService.handleDefaultTileImageExisting(recipeUpdated.data.recipeId, defaultTile, recipe.defaultTileImageKey)
                resolve({ recipeUpdate: true })
            } else {        
                await EditRecipeService.handleDefaultTileImageExisting(recipeUpdated.data.recipeId, defaultTile, recipe.defaultTileImageKey)
                resolve({ recipeUpdate: true })
            }
        })        
    },

    uploadFiles: async(newFiles: NewFileInterface[], recipeId: number) => {
        let uploads = newFiles
        return await Promise.all(uploads.map( async file => {
            let formData = new FormData() 
            formData.append('image', file.file as any)

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
        defaultTileImage: DefaultTileExisting | null | DefaultTile,
        defaultTileImageKey: string | null 
    ) => {
        return new Promise(async(resolve, reject) => {
          if (defaultTileImageKey) {
            let isNewDefaultTile = (typeof defaultTileImage === 'string' && defaultTileImage !== defaultTileImageKey) || typeof defaultTileImage !== 'string'
            if (isNewDefaultTile) {
                let uploadThatIsDefault: { awsKey: string, fileName: string } | undefined = uploadedImageKeys.find(obj => obj.fileName === (defaultTileImage as DefaultTile).fileName)
                if (uploadThatIsDefault) {
                  try {
                    let defaultTile = await EditRecipeService.setTileImage(recipeId, uploadThatIsDefault.awsKey)
                    resolve(defaultTile)
                  } catch(err) {
                    reject(err)
                  }
                }
            } else {
              resolve()
            }
          } else {
            // remove if recipe previously had a default image 
            if (!defaultTileImageKey && defaultTileImageKey) {
              await EditRecipeService.removeTileImage(recipeId)
              resolve()
            } else {
              resolve()
            }
          }
        })
      },



    deleteFiles: async(filesToDeleteKeys: string[]) => {
        return await Promise.all(filesToDeleteKeys.map( async url => {
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

      handleDefaultTileImageExisting: (recipeId: number, defaultTileImageKey: any, recipeDefaultTileImageKey: string) => {
        return new Promise(async(resolve, reject) => {
          if (defaultTileImageKey) {
            try {
              let defaultTile = await EditRecipeService.setTileImage(recipeId, defaultTileImageKey)
              resolve(defaultTile)
            } catch(err) {
              reject(err)
            }
          } else {
            if (!defaultTileImageKey && recipeDefaultTileImageKey) {
              await EditRecipeService.removeTileImage(recipeId)
              resolve()
            } else {
              resolve()
            }
          }
        })
      },



    
}