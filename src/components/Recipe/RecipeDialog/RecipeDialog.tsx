import React, { ChangeEvent } from 'react'
import {
  Dialog,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  DialogContent,
  DialogTitle,
  DialogActions,
  CircularProgress
} from '@material-ui/core'
import Slide from '@material-ui/core/Slide'
import ReactQuill from 'react-quill'
import FileUpload from '../../File-Upload/FileUpload'
import options from '../../../models/options'
import {
  RecipeService,
  SortedRecipeInterface,
  UpdateRecipeInput,
  DefaultTile,
  RecipeInterface,
  ExistingFile,
  NewFileInterface,
  RecipeInput
} from '../../../services/recipe-services'
import { queryClient } from '../../..'
import DOMPurify from 'dompurify'
import { tags } from '../../../models/tags'
import { AddRecipeMutationParam, DashboardReadyRecipe } from '../../RecipeCache/RecipeCache'
import './RecipeDialog.scss'
import { withRouter } from 'react-router-dom'
import M from 'materialize-css'
const { htmlToText } = require('html-to-text')

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

class RecipeDialog extends React.Component<any, any> {
    state = {
      loading: false,
      recipe_title: this.props.recipe.title,
      ingredients: this.props.recipe.ingredients,
      directions: this.props.recipe.directions,
      recipe_title_edit: this.props.recipe.title,
      recipe_title_raw: this.props.recipe.rawTitle,
      recipe_title_raw_edit: this.props.recipe.rawTitle,
      ingredients_edit: this.props.recipe.ingredients,
      directions_edit: this.props.recipe.directions,
      category: this.props.recipe.category,
      category_edit: this.props.recipe.category,
      newFiles: [],
      filesToDelete: [],
      tags: tags,
      defaultTileImageKey: this.props.recipe.defaultTileImageKey,
      recipeValid: null,
      cloning: this.props.cloning
    }

    componentDidMount () {
      this.state.tags.map(tag => {
        if (this.props.recipe.tags.includes(tag.recipeTagPropertyName)) {
          tag.selected = true
        }
        return tag
      })
    }

    handleModelChange = (content: string, delta, source, editor) => {
      this.setState({
        recipe_title_edit: content,
        recipe_title_raw_edit: editor.getText()
      }, () => this.checkValidity())
    }

    handleModelChangeIngredients = (html: string) => {
      this.setState({
        ingredients_edit: html
      }, () => this.checkValidity())
    }

    handleModelChangeDirections = (html: string) => {
      this.setState({
        directions_edit: html
      }, () => this.checkValidity())
    }

    updateCategory = (e) => {
      this.setState({
        category: e.target.value
      }, () => this.checkValidity())
    }

    setFiles = (newFiles: NewFileInterface[]) => {
      // new files
      this.setState({
        newFiles
      }, () => this.checkValidity())
    }

    setFilesToDelete = (files: ExistingFile[]) => {
      this.setState({
        filesToDelete: files
      }, () => this.checkValidity())
    }

    updateInput = (e: ChangeEvent<HTMLSelectElement> | any) => {
      this.setState({
        [e.target.id]: e.target.value
      } as any, () => this.checkValidity())
    }

    toggleTagSelectionStatus = (e: React.MouseEvent<HTMLDivElement>) => {
      const index: number = (e.target as Element).id as unknown as number
      const tags = [...this.state.tags]
      const item = { ...tags[index] }
      const priorSelectedValue = item.selected
      item.selected = !priorSelectedValue
      tags[index] = item
      this.setState({ tags }, () => this.checkValidity())
    }

    deleteRecipe = async () => {
      try {
        await RecipeService.deleteRecipe(this.props.recipe.id)
        const current: SortedRecipeInterface = queryClient.getQueryData('recipes')
        queryClient.setQueryData('recipes', () => {
          const updatedArray = current[this.state.category].filter(el => el.id !== this.props.recipe.id)
          const updatedCategory = updatedArray
          const updatedQueryState = {
            ...current,
            [this.state.category]: updatedCategory
          }
          return updatedQueryState
        })
        M.toast({ html: 'Recipe deleted.' })
        this.props.history.push('/recipes')
      } catch (err) {
        console.log(err)
        M.toast({ html: 'There was an error.' })
      }
    }

    checkValidity = () => {
      const { directions_edit, ingredients_edit, recipe_title_edit, category_edit } = this.state
      if (directions_edit && ingredients_edit && recipe_title_edit && category_edit) {
        this.setState({
          recipeValid: true
        })
      } else {
        this.setState({
          recipeValid: false
        })
      }
    }

    // function for duplicating a recipe
    addRecipe = async () => {
      const tags = this.state.tags
      const titleHTML = DOMPurify.sanitize(this.state.recipe_title_raw_edit || this.state.recipe_title_raw)
      const rawTitle = htmlToText(titleHTML, {
        wordwrap: 130
      })
      this.setState({
        loading: true
      })
      const recipeInput: RecipeInput = {
        title: this.state.recipe_title_edit,
        rawTitle,
        category: this.state.category,
        ingredients: this.state.ingredients_edit,
        directions: this.state.directions_edit,
        isNoBake: tags[0].selected,
        isEasy: tags[1].selected,
        isHealthy: tags[2].selected,
        isGlutenFree: tags[3].selected,
        isDairyFree: tags[4].selected,
        isSugarFree: tags[5].selected,
        isVegetarian: tags[6].selected,
        isVegan: tags[7].selected,
        isKeto: tags[8].selected
      }
      try {
        const param: AddRecipeMutationParam = {
          recipeInput,
          files: this.state.newFiles,
          defaultTile: this.state.defaultTileImageKey
        }
        const recipe = await this.props.addRecipeMutation(param)
        M.toast({ html: 'Recipe added.' })
        this.setState({
          filesToDelete: [],
          newFiles: [],
          loading: false
        }, () => {
          this.props.history.push(`/recipes/${recipe.id}`)
          window.location.reload(false)
          this.props.triggerDialog()
        })
      } catch (err) {
        console.log(err)
        this.setState({
          loading: false
        })
        M.toast({ html: 'There was an error.' })
      }
    }

    saveRecipe = async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (this.props.cloning) {
        this.addRecipe()
        return
      }
      const tags = this.state.tags
      const titleHTML = DOMPurify.sanitize(this.state.recipe_title_raw_edit || this.state.recipe_title_raw)
      const rawTitle = htmlToText(titleHTML, {
        wordwrap: 130
      })
      this.setState({
        loading: true
      })
      const recipeUpdateInput: UpdateRecipeInput = {
        title: this.state.recipe_title_edit,
        rawTitle,
        ingredients: this.state.ingredients_edit,
        directions: this.state.directions_edit,
        recipeId: this.props.recipe.id,
        category: this.state.category,
        isNoBake: tags[0].selected,
        isEasy: tags[1].selected,
        isHealthy: tags[2].selected,
        isGlutenFree: tags[3].selected,
        isDairyFree: tags[4].selected,
        isSugarFree: tags[5].selected,
        isVegetarian: tags[6].selected,
        isVegan: tags[7].selected,
        isKeto: tags[8].selected
      }
      try {
        const updatedRecipe = await RecipeService.updateRecipe(
          recipeUpdateInput,
          this.state.newFiles,
          this.state.defaultTileImageKey,
          this.state.filesToDelete,
          this.props.recipe.id,
          this.props.recipe as unknown as RecipeInterface
        )
        const formattedRecipe: DashboardReadyRecipe = await RecipeService.getRecipe(updatedRecipe.recipe.recipe_uuid)
        queryClient.setQueryData('recipes', () => {
          const current: SortedRecipeInterface = queryClient.getQueryData('recipes')
          const updatedArray = current[this.state.category].map(recipe => {
            if (recipe.id === updatedRecipe.recipe.id) {
              return formattedRecipe
              // return updatedRecipe.recipe
            }
            return recipe
          })
          const updatedCategory = updatedArray
          return {
            ...current,
            [this.state.category]: updatedCategory
          }
        })
        // queryClient.refetchQueries('recipes')
        this.handleUpdate()
        this.setState({
          loading: false
        })
      } catch (err) {
        console.log(err)
        this.setState({
          loading: false
        })
        M.toast({ html: 'There was an error updating the recipe.' })
      }
    }

    handleUpdate () {
      // Update recipe details to reflect the change
      this.props.triggerDialog()
      this.props.fetchData()
      M.toast({ html: 'Recipe updated.' })
      this.setState({
        filesToDelete: [],
        newFiles: []
      })
    }

    setDefaultTileImage = (key: string | DefaultTile) => {
      this.setState({
        defaultTileImageKey: key
      }, () => this.checkValidity())
    }

    render () {
      const { loading, recipeValid, tags, category } = this.state
      const { edit, cloning, recipe, open } = this.props

      return (
            <Dialog
                fullScreen
                scroll="paper"
                open={open}
                onClose={this.props.triggerDialog}
                TransitionComponent={Transition}>
                <DialogTitle className="title">{ edit
                  ? (cloning ? <span>Add Recipe </span> : <span>Edit Recipe</span>)
                  : <span>Add Recipe</span> }
                </DialogTitle>
                <DialogContent >
                    <h3>Title</h3>
                    <ReactQuill value={this.state.recipe_title_edit} onChange={this.handleModelChange}/>
                    <h3>Ingredients</h3>
                    <ReactQuill value={this.state.ingredients_edit} onChange={this.handleModelChangeIngredients}/>
                    <h3>Directions</h3>
                    <ReactQuill value={this.state.directions_edit} onChange={this.handleModelChangeDirections}/>

                    <FormControl variant="filled" style={{ width: '100%', margin: '10px 0 0 0' }}>
                        <InputLabel>Category</InputLabel>
                        <Select
                        id="category"
                        value={category}
                        onChange={this.updateCategory}
                        >
                        {
                            options.map((val, index: number) => {
                              return <MenuItem key={index} value={val.value}>{val.label}</MenuItem>
                            })
                        }
                        </Select>
                    </FormControl>

                    <h3>Recipe Tags</h3>
                    <div>
                        { tags.map((tag, index) => {
                          return <div
                                onClick={this.toggleTagSelectionStatus}
                                id={index.toString()}
                                className={`chip z-depth-2 ${recipe && tags[index].selected ? 'selectedTag' : 'null'}`}
                                key={index}>
                                    {tag.label}
                                </div>
                        })
                        }
                    </div>

                    <FileUpload
                        defaultTileImageUUID={this.props.defaultTileImageKey}
                        passDefaultTileImage={this.setDefaultTileImage}
                        preExistingImageUrls={this.props.presignedUrls$}
                        passFilesToDelete={this.setFilesToDelete}
                        passFiles={this.setFiles}>
                    </FileUpload>
                </DialogContent>
                <DialogActions>
                    <div className="button-alignment">
                        <div>
                            <Button color="primary" variant="contained" onClick={this.deleteRecipe}>
                                Delete Recipe <i className="fas fa-trash"></i>
                            </Button>
                            <Button onClick={() => this.props.triggerDialog()} variant="contained" >
                                Cancel
                            </Button>
                        </div>

                        <Button
                        onClick={this.saveRecipe}
                        disabled={!recipeValid}
                        variant="contained"
                        color="secondary">
                            { loading
                              ? <CircularProgress style={{ color: 'white', height: '26px', width: '26px' }} />
                              : <>
                                {!cloning ? 'Update Recipe' : 'Add Recipe' }
                                <i className="fas fa-check-square"></i>
                            </>
                            }
                        </Button>
                    </div>
                </DialogActions>
            </Dialog>
      )
    }
}

export default withRouter(RecipeDialog)
