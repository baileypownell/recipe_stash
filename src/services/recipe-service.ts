import axios from "axios"
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

export const RecipeService = {
    createRecipe: (recipeInput: RecipeInput, files) => {
        return new Promise(async(resolve, reject) => {
            let recipeCreated = await axios.post('/recipe', recipeInput)
            if (files.length) {
                try {
                    // we must get the AWS KEY from this call
                    let uploadedImageKeys = await RecipeService.uploadFiles(recipeCreated.data.recipeId, files)
                    let defaultTileImage = uploadedImageKeys.find(obj => obj.fileName === this.state.defaultTileImageKey?.fileName)
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
    handleDefaultTileImage: (recipeId, awsKey) => {
        return new Promise(async(resolve, reject) => {
            try {
                let defaultTile = await this.setTileImageNewRecipe(recipeId, awsKey)
                resolve(defaultTile)
            } catch(e) {
                reject(e)
            }
        })
    }, 

    uploadFiles: async(recipeId: number, files: any) => {
        return await Promise.all(files.map( async file => {
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
    }
}

