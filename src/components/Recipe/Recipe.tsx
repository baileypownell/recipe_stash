import React, { ChangeEvent } from 'react'
import { withRouter } from "react-router-dom"
import './Recipe.scss'
import M, { Modal } from 'materialize-css'
import BounceLoader from "react-spinners/BounceLoader"
import DOMPurify from 'dompurify'
const { htmlToText } = require('html-to-text')
import ReactQuill from 'react-quill'
import FileUpload from '../File-Upload/FileUpload'
import Preloader from '../Preloader/Preloader'
import { BehaviorSubject } from 'rxjs'
import { tags } from '../../models/tags'
import options from '../../models/options'
import DeleteModal from '../DeleteModal/DeleteModal'
import { RecipeService, RecipeInterface, UpdateRecipeInput, NewFileInterface, DefaultTile, ExistingFile, RecipeInput, SortedRecipeInterface } from '../../services/recipe-services'
import Tag from '../../models/tags'
import { appear } from '../../models/functions'
import ImageSkeletonLoader from './ImageSkeletonLoader/ImageSkeletonLoader'
import Fade from 'react-reveal/Fade'
import { useMutation } from 'react-query'
import { queryClient } from '../..'
import { AddRecipeMutationParam } from '../RecipeCache/RecipeCache'
import { FormControl, InputLabel, Select, MenuItem } from '@material-ui/core'
let presignedUrlsSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])
let presignedUrls$ = presignedUrlsSubject.asObservable()

let modalInstance: Modal

type State = {
  loading: boolean 
  recipe_title: string 
  ingredients: string
  directions: string 
  recipe_title_edit: string 
  recipe_title_raw: string 
  recipe_title_raw_edit: string
  ingredients_edit: string 
  directions_edit: string
  recipeId: string
  showConfirmation: boolean
  category: string
  category_edit: string 
  recipe: RecipeInterface | null
  newFiles: any[]
  filesToDelete: any[]
  tags: Tag[]
  defaultTileImageKey: string | null | DefaultTile
  recipeValid: boolean | null
  cloning: boolean
  width: number 
}

class Recipe extends React.Component<any, State> {

  state = {
    loading: true,
    recipe_title: '',
    ingredients: '',
    directions: '',
    recipe_title_edit: '', 
    recipe_title_raw: '',
    recipe_title_raw_edit: '',
    ingredients_edit: '', 
    directions_edit: '',
    recipeId: this.props.match.params.id,
    showConfirmation: false,
    category: '',
    category_edit: '', 
    recipe: null,
    newFiles: [],
    filesToDelete: [],
    tags: tags,
    defaultTileImageKey: null,
    recipeValid: null,
    cloning: false,
    width: window.innerWidth
  }

  goBack = () => {
    this.props.history.push('/recipes')
  }

  fetchData = async() => {
    try {
      let recipe: RecipeInterface = await RecipeService.getRecipe(this.props.match.params.id)
      this.setState({
        recipe: recipe,
        recipe_title: recipe.title,
        recipe_title_raw: recipe.rawTitle,
        recipe_title_edit: recipe.title,
        ingredients: recipe.ingredients,
        ingredients_edit: recipe.ingredients,
        directions: recipe.directions,
        directions_edit: recipe.directions,
        category: recipe.category,
        category_edit: recipe.category,
        loading: false,
        defaultTileImageKey: recipe.defaultTileImageKey
      }, () => {
          if (recipe.preSignedUrls) {
            presignedUrlsSubject.next(recipe.preSignedUrls)
          } else {
            presignedUrlsSubject.next([])
          }
          const images = document.querySelectorAll('.materialboxed')
          M.Materialbox.init(images, {})
          const modal = document.querySelectorAll('.modal')
          M.Modal.init(modal, {
            opacity: 0.5
          })
          const singleModalElem = document.getElementById(`modal_${this.state.recipeId}`)
          modalInstance = M.Modal.getInstance(singleModalElem as HTMLElement)
          const select = document.querySelectorAll('select')
          M.FormSelect.init(select, {})
          const elems = document.querySelectorAll('.fixed-action-btn')
          M.FloatingActionButton.init(elems, {})
      })
      this.state.tags.forEach((tag: Tag, index: number) => {
        if (recipe.tags.includes(tag.recipeTagPropertyName as any)) {
            let tags = [...this.state.tags]
            let item = {...tags[index]}
            item.selected = true
            tags[index] = item
            this.setState({tags})
        }
      })
    } catch(err) {
      console.log(err)
      if (err.response.status === 401) {
        // unathenticated; redirect to log in 
        this.props.history.push('/login')
      }
    }
  }

  componentDidMount() {
    this.fetchData()
    let faded = document.querySelectorAll('.fade')
    setTimeout(() => appear(faded, 'fade-in'), 700)

    const modals = document.querySelectorAll('.modal')
    M.Modal.init(modals, {})

    window.addEventListener('resize', this.handleWindowSizeChange)
  }

  componentDidUpdate() {
    const elems = document.querySelectorAll('.dropdown-trigger')
    M.Dropdown.init(elems, {})
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange)
  }

  handleWindowSizeChange = () => {
    this.setState({
      width: window.innerWidth
    })
  }

  openModal = () => {
    modalInstance.open()
    M.updateTextFields()
  }

  closeModal = () => {
    this.setState({
      cloning: false
    }, () => modalInstance.close() )
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

  deleteRecipe = async() => {
    try {
      await RecipeService.deleteRecipe(this.state.recipeId)
      const current: SortedRecipeInterface = queryClient.getQueryData('recipes')
      queryClient.setQueryData('recipes', () => {
        const updatedArray = current[this.state.category].filter(el => el.id !== this.state.recipeId)
        const updatedCategory = updatedArray
        const updatedQueryState = {
          ...current, 
          [this.state.category]: updatedCategory
        }
        return updatedQueryState
      })
      M.toast({html: 'Recipe deleted.'})
      this.closeModal()
      this.props.history.push('/recipes')
    } catch(err) {
      console.log(err)
      M.toast({html: 'There was an error.'})
    }
  }

  updateInput = (e: ChangeEvent<HTMLSelectElement> | any) => {
    this.setState({
      [e.target.id]: e.target.value
    } as any, () => this.checkValidity())
  }

  updateCategory = (e) => {
    this.setState({
      category: e.target.value
    }, () => this.checkValidity())
  }

  toggleTagSelectionStatus = (e: React.MouseEvent<HTMLDivElement>) => {
    let index: number = (e.target as Element).id as unknown as number
    let tags = [...this.state.tags]
    let item = {...tags[index]}
    let priorSelectedValue = item.selected
    item.selected = !priorSelectedValue
    tags[index] = item;
    this.setState({tags}, () => this.checkValidity())
  }

  handleUpdate() {
     // Update recipe details to reflect the change
     this.fetchData()
     M.toast({html: 'Recipe updated.'})
     this.setState({
       filesToDelete: [],
       newFiles: []
     }) 
  }

  // function for duplicating a recipe
  addRecipe = async() => {
    let tags = this.state.tags
    let titleHTML = DOMPurify.sanitize(this.state.recipe_title_raw_edit || this.state.recipe_title_raw)
    const rawTitle = htmlToText(titleHTML, {
      wordwrap: 130
    })
    this.setState({
      loading: true
    })
    this.closeModal()
    let recipeInput: RecipeInput = {
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
    let tags = this.state.tags
    let titleHTML = DOMPurify.sanitize(this.state.recipe_title_raw_edit || this.state.recipe_title_raw)
    const rawTitle = htmlToText(titleHTML, {
      wordwrap: 130
    })
    this.setState({
      loading: true
    })
    this.closeModal()
    let recipeUpdateInput: UpdateRecipeInput = {
      title: this.state.recipe_title_edit,
      rawTitle,
      ingredients: this.state.ingredients_edit,
      directions: this.state.directions_edit,
      recipeId: this.state.recipeId,
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
        this.state.recipeId,
        this.state.recipe as unknown as RecipeInterface
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

  setFiles = (newFiles: NewFileInterface[]) => {
    // new files 
    this.setState({
      newFiles: newFiles
    }, () => this.checkValidity())
  }

  setFilesToDelete = (files: ExistingFile[]) => {
    this.setState({
      filesToDelete: files
    }, () => this.checkValidity())
  }

  setDefaultTileImage = (key: string | DefaultTile ) => {
    this.setState({
      defaultTileImageKey: key
    }, () => this.checkValidity())
  }

  cloneRecipe = (e: Event) => {
    e.stopPropagation()
    presignedUrlsSubject.next([])
    this.setState({
      cloning: true
    }, () => this.openModal())
  }

  render() {
    const { 
      recipeId, 
      category, 
      loading,
      tags, 
      recipe, 
      directions, 
      ingredients, 
      recipe_title_raw, 
      defaultTileImageKey,
      cloning,
      width
    } = this.state;

    return (
          !loading  ? 
          <div id="mobile-recipe-container">
            <h1 className="title">
              <i onClick={this.goBack} className="fas fa-chevron-circle-left"></i>
              <span style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{__html: recipe_title_raw}}/>
            </h1> 
            <Fade>
              <div className="view-recipe" >
                <div id="recipe-mobile-toolbar" className={width > 700 ? "hidden" : ''}>
                    <a className='dropdown-trigger' data-target='dropdown1'><i className="fas fa-ellipsis-v"></i></a>
                    <ul id='dropdown1' className='dropdown-content'>
                      <li onClick={this.openModal}><a>Edit</a></li>
                      <li onClick={this.cloneRecipe}><a>Duplicate</a></li>
                    </ul>
                </div>
                <div id="width-setter">
                  <div className="section">
                    <div id="recipe-title" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(this.state.recipe_title)}}/>
                  </div>
                  <div className="section">
                    <div dangerouslySetInnerHTML={{__html: ingredients}} />
                  </div>
                  <div className="section">
                    <div dangerouslySetInnerHTML={{__html: directions}}/>
                  </div>
                  <div className="section">
                    {tags.map((tag) => ( tag.selected ? 
                        <div 
                          key={tag.label}
                          className="chip z-depth-2 selectedTag">
                          { tag.label }
                        </div> 
                        : null )
                    )}
                  </div>
                  <div id={(recipe as unknown as RecipeInterface).preSignedUrls?.length < 2 ? 'noGrid' : 'images'}>
                    {(recipe as unknown as RecipeInterface).preSignedUrls?.map((url: string, i: number) => ( 
                       <ImageSkeletonLoader url={url} key={i}></ImageSkeletonLoader>
                    ))}
                  </div>
                  { width > 700 ?                 
                    <div onClick={this.openModal} className="fixed-action-btn">
                      <a className="btn-floating btn-large" id="primary-color">
                        <i className="large material-icons">mode_edit</i>
                      </a>

                      <ul>
                          <li 
                            onClick={this.cloneRecipe} 
                            className="tooltipped" 
                            data-position="left" 
                            data-tooltip="Duplicate this recipe">
                              <a className="btn-floating green-icon"><i className="far fa-clone"></i></a>
                          </li>
                        </ul>
                    </div>
                    : null }
                </div>
              </div>
            </Fade>


            <div id={`modal_${recipeId}`} className="modal recipe-modal">
              <div className="recipe">
                <h1 className="title">{cloning ? 'Add Recipe' : 'Edit Recipe'}</h1>
                <div className="modal-scroll">
                  <div className="modal-content">
                      <h3>Title</h3>
                      <ReactQuill  value={this.state.recipe_title_edit} onChange={this.handleModelChange}/>
                      <h3>Ingredients</h3>
                      <ReactQuill  value={this.state.ingredients_edit} onChange={this.handleModelChangeIngredients}/>
                      <h3>Directions</h3>
                      <ReactQuill  value={this.state.directions_edit} onChange={this.handleModelChangeDirections}/>
                      <div className="options">
                      <FormControl variant="filled" style={{'width': '100%', 'margin': '10px 0'}}>
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
                        defaultTileImageUUID={defaultTileImageKey}
                        passDefaultTileImage={this.setDefaultTileImage}
                        preExistingImageUrls={presignedUrls$}
                        passFilesToDelete={this.setFilesToDelete}
                        passFiles={this.setFiles}>
                      </FileUpload>  
                      {/* delete confirmation modal */}
                      <div id="confirmation-modal" className="modal">
                          <DeleteModal deleteFunction={this.deleteRecipe}></DeleteModal>
                      </div>
                  </div>
              </div>
                <div className="modal-close-buttons">
                  <button 
                    className={!this.state.recipeValid ? 'waves-effect waves-light btn disabled' : 'waves-effect waves-light btn enabled'}
                    disabled={!this.state.recipeValid} 
                    onClick={this.saveRecipe}>
                    { loading ? 
                      <Preloader/> : 
                      <>
                        {!cloning ? 'Update Recipe' : 'Add Recipe' }
                        <i className="fas fa-check-square"></i>
                      </>
                    }
                </button>
               
                  <div>
                    <button 
                      id="primary-color" 
                      className="waves-effect waves-light btn modal-trigger" 
                      data-target="confirmation-modal"
                      >
                      Delete Recipe <i className="fas fa-trash"></i>
                    </button> 
                    <button onClick={this.closeModal} className="btn waves-effect waves-light grayBtn">Cancel</button>
                  </div>
                </div>
            </div> 
          </div>
            </div> :  
          <div className="BounceLoader">
            <BounceLoader
                size={100}
                color={"#689943"}
            />
          </div>
    )
  }
}

export default withRouter(Recipe);
