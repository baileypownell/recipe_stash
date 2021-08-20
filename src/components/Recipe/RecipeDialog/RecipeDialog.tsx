import React, { ChangeEvent } from 'react'
import { Dialog, List, ListItem, ListItemText, Divider, FormControl, InputLabel, Select, MenuItem, Button } from '@material-ui/core';
import Slide from '@material-ui/core/Slide'
import ReactQuill from 'react-quill';
import FileUpload from '../../File-Upload/FileUpload';
import DeleteModal from '../../DeleteModal/DeleteModal';
import Preloader from '../../Preloader/Preloader';
import options from '../../../models/options';
import { RecipeService, SortedRecipeInterface, UpdateRecipeInput, DefaultTile, RecipeInterface, ExistingFile, NewFileInterface, RecipeInput } from '../../../services/recipe-services';
import { queryClient } from '../../..'
import DOMPurify from 'dompurify'
import { tags } from '../../../models/tags'
import { AddRecipeMutationParam } from '../../RecipeCache/RecipeCache';
const { htmlToText } = require('html-to-text')

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
  });

class RecipeDialog extends React.Component<any, any> {

    state = {
        loading: false,
        recipe_title: '',
        ingredients: '',
        directions: '',
        recipe_title_edit: '',
        recipe_title_raw: '',
        recipe_title_raw_edit: '',
        ingredients_edit: '',
        directions_edit: '',
        category: '',
        category_edit: '',
        newFiles: [],
        filesToDelete: [],
        tags,
        defaultTileImageKey: null,
        recipeValid: null,
        cloning: this.props.cloning,
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
        const item = {...tags[index]}
        const priorSelectedValue = item.selected
        item.selected = !priorSelectedValue
        tags[index] = item;
        this.setState({tags}, () => this.checkValidity())
      }

    deleteRecipe = async() => {
        try {
        await RecipeService.deleteRecipe(this.props.recipeId)
        const current: SortedRecipeInterface = queryClient.getQueryData('recipes')
        queryClient.setQueryData('recipes', () => {
            const updatedArray = current[this.state.category].filter(el => el.id !== this.props.recipeId)
            const updatedCategory = updatedArray
            const updatedQueryState = {
            ...current,
            [this.state.category]: updatedCategory
            }
            return updatedQueryState
        })
        M.toast({html: 'Recipe deleted.'})
        this.props.history.push('/recipes')
        } catch(err) {
        console.log(err)
        M.toast({html: 'There was an error.'})
        }
    }

  checkValidity = () => {
    const { directions_edit, ingredients_edit, recipe_title_edit, category_edit } = this.state;
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
    addRecipe = async() => {
        const tags = this.state.tags
        const titleHTML = DOMPurify.sanitize(this.state.recipe_title_raw_edit || this.state.recipe_title_raw)
        const rawTitle = htmlToText(titleHTML, {
          wordwrap: 130
        })
        this.setState({
          loading: true
        })
        // this.closeModal()
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
          isKeto: tags[8].selected,
        }
        try {
          const param: AddRecipeMutationParam = {
            recipeInput,
            files: this.state.newFiles,
            defaultTile: this.state.defaultTileImageKey
          }
          const recipe = await this.props.addRecipeMutation(param)
          M.toast({html: 'Recipe added.'})
          this.setState({
            filesToDelete: [],
            newFiles: [],
            loading: false
          }, () => {
            this.props.history.push(`/recipes/${recipe.id}`)
            window.location.reload(false)
          })
        } catch(err) {
          console.log(err)
          this.setState({
            loading: false
          })
          M.toast({html: 'There was an error.'})
        }
      }

  saveRecipe = async(e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    if (this.state.cloning) {
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
      recipeId: this.props.recipeId,
      category: this.state.category,
      isNoBake: tags[0].selected,
      isEasy: tags[1].selected,
      isHealthy: tags[2].selected,
      isGlutenFree: tags[3].selected,
      isDairyFree: tags[4].selected,
      isSugarFree: tags[5].selected,
      isVegetarian: tags[6].selected,
      isVegan: tags[7].selected,
      isKeto: tags[8].selected,
    }
    try {
      await RecipeService.updateRecipe(
        recipeUpdateInput,
        this.state.newFiles,
        this.state.defaultTileImageKey,
        this.state.filesToDelete,
        this.props.recipeId,
        this.props.recipe as unknown as RecipeInterface
      )
      queryClient.refetchQueries('recipes')
      this.handleUpdate()
      this.setState({
        loading: false
      })
    } catch(err) {
      console.log(err)
      this.setState({
        loading: false
      })
      M.toast({html: 'There was an error updating the recipe.'})
    }
  }

  handleUpdate() {
    // Update recipe details to reflect the change
    this.props.fetchData()
    M.toast({html: 'Recipe updated.'})
    this.setState({
      filesToDelete: [],
      newFiles: []
    })
 }

  setDefaultTileImage = (key: string | DefaultTile ) => {
    this.setState({
      defaultTileImageKey: key
    }, () => this.checkValidity())
  }

    render() {
        const { loading } = this.state
        return (
            <Dialog 
                fullScreen 
                open={this.props.open} 
                onClose={this.props.triggerDialog} 
                TransitionComponent={Transition}>
                <List>
                <ListItem button>
                    <ListItemText primary="Phone ringtone" secondary="Titania" />
                </ListItem>
                <Divider />
                <ListItem button>
                    <ListItemText primary="Default notification ringtone" secondary="Tethys" />
                </ListItem>
                </List>

                {/* <div>
                    <div className="recipe">
                        <h1 className="title">{this.props.cloning ? 'Add Recipe' : 'Edit Recipe'}</h1>
                            <h3>Title</h3>
                            <ReactQuill value={this.state.recipe_title_edit} onChange={this.handleModelChange}/>
                            <h3>Ingredients</h3>
                            <ReactQuill  value={this.state.ingredients_edit} onChange={this.handleModelChangeIngredients}/>
                            <h3>Directions</h3>
                            <ReactQuill  value={this.state.directions_edit} onChange={this.handleModelChangeDirections}/>
                            <div className="options">
                            <FormControl variant="filled" style={{'width': '100%', 'margin': '10px 0'}}>
                                <InputLabel>Category</InputLabel>
                                <Select
                                id="category"
                                value={this.props.category}
                                onChange={this.updateCategory}
                                >
                                {
                                    options.map((val, index: number) => {
                                    return <MenuItem key={index} value={val.value}>{val.label}</MenuItem>
                                    })
                                }
                                </Select>
                            </FormControl>
                            </div>
                            <div className="options">
                                <h3>Recipe Tags</h3>
                                {
                                tags.map((tag, index) => {
                                    return <div
                                    onClick={this.toggleTagSelectionStatus}
                                    id={index.toString()}
                                    className={`chip z-depth-2 ${recipe && tags[index].selected  ? "selectedTag" : "null"}`}
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
                       
                            <div id="confirmation-modal" className="modal">
                                <DeleteModal deleteFunction={this.deleteRecipe}></DeleteModal>
                            </div>
                        </div>
                    </div>
                    <Button onClick={this.saveRecipe} disabled={!this.state.recipeValid} variant="contained" color="primary">
                        { loading ?
                            <Preloader/> :
                        <>
                            {!this.props.cloning ? 'Update Recipe' : 'Add Recipe' }
                            <i className="fas fa-check-square"></i>
                        </>
                        }
                    </Button>

                    <div>
                        <Button variant="contained" color="secondary">
                            Delete Recipe <i className="fas fa-trash"></i>
                        </Button>
                        <Button onClick={this.props.triggerDialog} variant="contained" color="secondary">
                            Cancel
                        </Button>
                    </div> */}
            </Dialog>
        )
    }
}

export default RecipeDialog