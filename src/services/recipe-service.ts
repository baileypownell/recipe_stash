import axios from 'axios'
const FormData = require('form-data')

export interface RecipeInput {
    title: string, 
    rawTitle: string, 
    category: string, 
    ingredients: string, 
    directions: string, 
    isNoBake: boolean, 
    isEasy: boolean, 
    isHealthy: boolean, 
    isGlutenFree: boolean, 
    isDairyFree: boolean, 
    isSugarFree: boolean, 
    isVegetarian: boolean, 
    isVegan: boolean, 
    isKeto: boolean
}

export interface NewFileInterface {
    file: {
        lastModified: Date // unix
        lastModifiedDate: Date
        name: string
        size: number
        type: string
        webkitRelativePath: string
    },
    id: string
}

export interface UploadedFileResult {
    awsKey: string, 
    fileName: string
}

export interface DefaultTile {
    newFile: boolean 
    fileName: string
}

export const RecipeService = {
    createRecipe: (recipeInput: RecipeInput, files: NewFileInterface[], defaultTile: DefaultTile | null) => {
        return new Promise(async(resolve, reject) => {
            let recipeCreated = await axios.post('/recipe', recipeInput)
            if (files.length) {
                try {
                    // we must get the AWS KEY from this call
                    let uploadedImageKeys = await RecipeService.uploadFiles(recipeCreated.data.recipeId, files)
                    let defaultTileImage = uploadedImageKeys.find(obj => obj.fileName === defaultTile?.fileName)
                    if (defaultTileImage) {
                        await RecipeService.handleDefaultTileImage(recipeCreated.data.recipeId, defaultTileImage.awsKey)
                    }
                    resolve({recipeAdded: true})
                } catch (error) {
                    console.log(error)
                    reject({err: true, error})
                }
            } else {
                resolve({recipeAdded: true})
            }
        })
    },
    handleDefaultTileImage: (recipeId: number, awsKey: string) => {
        return new Promise(async(resolve, reject) => {
            try {
                let defaultTile = await RecipeService.setTileImage(recipeId, awsKey)
                resolve(defaultTile)
            } catch(e) {
                reject(e)
            }
        })
    }, 

    uploadFiles: async(recipeId: number, files: any): Promise<UploadedFileResult[]> => {
        return await Promise.all(files.map( async (file: NewFileInterface) => {
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

    setTileImage: async(recipeId: number, awsKey: string) => {
        return await axios.post(`/file-upload/tile-image/${awsKey}/${recipeId}`)
    }
}

