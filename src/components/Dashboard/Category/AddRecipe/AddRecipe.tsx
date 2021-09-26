import React, { ChangeEvent } from 'react'
import './AddRecipe.scss'
import DOMPurify from 'dompurify'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import FileUpload from '../../../File-Upload/FileUpload'
import Preloader from '../../../Preloader/Preloader'
import tag, { tags } from '../../../../models/tags'
import Dialog from '@material-ui/core/Dialog'
import Slide from '@material-ui/core/Slide'
import options from '../../../../models/options'
import { RecipeInput, DefaultTile, NewFileInterface } from '../../../../services/recipe-services'
import { FormControl, InputLabel, Select, MenuItem, Accordion, AccordionSummary, Typography, AccordionDetails, Snackbar, Button, Chip } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { AddRecipeMutationParam } from '../../../RecipeCache/RecipeCache'
const { htmlToText } = require('html-to-text')

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

type Props = {
  id: string
  category: string
  addRecipe: Function
  gridView: boolean
}

type State = {
  loading: boolean
  recipe_title: string
  ingredients: string
  directions: string
  category: string
  recipeValid: boolean
  newFiles: any[]
  tags: tag[],
  defaultTile: DefaultTile | null
  open: boolean,
  snackBarOpen: boolean,
  snackBarMessage: string
}

class AddRecipe extends React.Component<Props, State> {
  state = {
    loading: false,
    recipe_title: '',
    ingredients: '',
    directions: '',
    category: options.find(option => option.label === this.props.category).value,
    recipeValid: false,
    newFiles: [],
    tags: tags.map(tag => ({ ...tag, selected: false })),
    defaultTile: null,
    open: false,
    snackBarOpen: false,
    snackBarMessage: ''
  }

  checkValidity = () => {
    const { directions, ingredients, recipe_title } = this.state
    if (directions && ingredients && recipe_title) {
      this.setState({
        recipeValid: true
      })
    } else {
      this.setState({
        recipeValid: false
      })
    }
  }

  clearState = () => {
    const prevOpenState = this.state.open
    this.setState({
      recipe_title: '',
      ingredients: '',
      directions: '',
      open: !prevOpenState,
      tags
    })
  }

  createRecipe = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    const tags = this.state.tags
    const titleHTML = DOMPurify.sanitize(this.state.recipe_title, {})
    const rawTitle = htmlToText(titleHTML, {
      wordwrap: 130
    })
    this.setState({
      loading: true
    })
    const recipeInput: RecipeInput = {
      title: DOMPurify.sanitize(this.state.recipe_title, {}),
      rawTitle,
      category: this.state.category,
      ingredients: DOMPurify.sanitize(this.state.ingredients, {}),
      directions: DOMPurify.sanitize(this.state.directions, {}),
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
        defaultTile: this.state.defaultTile
      }
      await this.props.addRecipe(param)
      this.openSnackBar('Recipe added.')
      this.clearState()
      this.setState({
        loading: false
      })
    } catch (err) {
      console.log(err)
      this.setState({
        loading: false
      })
      this.openSnackBar('There was an error.')
    }
  }

  openSnackBar (message: string) {
    this.setState({
      snackBarOpen: true,
      snackBarMessage: message
    })
  }

  closeSnackBar = () => {
    this.setState({
      snackBarOpen: false,
      snackBarMessage: ''
    })
  }

  toggleModal = () => {
    const prevOpenState = this.state.open
    this.setState({
      open: !prevOpenState
    })
  }

  updateInput = (e: ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      [e.target.id]: e.target.value
    }, () => this.checkValidity())
  }

  updateCategory = (e) => {
    this.setState({
      category: e.target.value
    })
  }

  toggleTagSelectionStatus = (index: number) => {
    // 1. Make a shallow copy of the items
    const tags = [...this.state.tags]
    // 2. Make a shallow copy of the item you want to mutate
    const item = { ...tags[index] }
    // 3. Replace the property you're intested in
    const priorSelectedValue = item.selected
    item.selected = !priorSelectedValue
    // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
    tags[index] = item
    // 5. Set the state to our new copy
    this.setState({ tags })
  }

  handleModelChange = (html: string) => {
    this.setState({
      recipe_title: html
    }, () => this.checkValidity())
  }

  handleModelChangeIngredients = (html: string) => {
    this.setState({
      ingredients: html
    }, () => this.checkValidity())
  }

  handleModelChangeDirections = (html: string) => {
    this.setState({
      directions: html
    }, () => this.checkValidity())
  }

  setFiles = (newFiles: NewFileInterface[]) => {
    // new files
    this.setState({
      newFiles
    })
  }

  setDefaultTileImage = (defaultTile: DefaultTile) => {
    this.setState({
      defaultTile
    })
  }

  render () {
    const { id, gridView } = this.props as any
    const { open, category, recipe_title, ingredients, directions, snackBarOpen, snackBarMessage } = this.state

    return (
      <>
        { gridView
          ? <div
            onClick={this.toggleModal}
            className="addRecipe"
            id={id}
             >
            <i className="fas fa-plus-circle"></i>
        </div>
          : <Button
              className="add-button"
              variant="contained"
              onClick={this.toggleModal}>
              Add Recipe
              <i className="fas fa-plus-circle" style={{ marginLeft: '8px' }}></i>
            </Button>
      }

      <Dialog fullScreen open={open} onClose={this.toggleModal} TransitionComponent={Transition as any}>
        <div className="recipe-modal">
          <div className="recipe">
            <h1 className="title">New Recipe</h1>
            <div className="modal-scroll">
              <div className="modal-content">
              <h3>Title</h3>
              <ReactQuill value={recipe_title} onChange={this.handleModelChange}/>
              <h3>Ingredients</h3>
              <ReactQuill theme="snow" value={ingredients} onChange={this.handleModelChangeIngredients}/>
              <h3>Directions</h3>
              <ReactQuill theme="snow" value={directions} onChange={this.handleModelChangeDirections}/>
              <div>
                <FormControl variant="filled" style={{ width: '100%', margin: '10px 0' }}>
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

              <Accordion style={{ margin: '10px 0' }}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Recipe Tags</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    {
                      this.state.tags.map((tag, index) => {
                        return <Chip
                          className={`chip ${this.state.tags[index].selected ? 'selectedTag' : 'null'}`}
                          id={index.toString()}
                          key={index}
                          onClick={() => this.toggleTagSelectionStatus(index)}
                          label={tag.label} />
                      })
                    }
                  </Typography>
                </AccordionDetails>
              </Accordion>
              <FileUpload
                open={open}
                passDefaultTileImage={this.setDefaultTileImage}
                passFiles={this.setFiles}>
                </FileUpload>
            </div>
          </div>
          <div className="modal-close-buttons">
          <Button
            variant="contained"
            color="secondary"
            disabled={!this.state.recipeValid}
            onClick={this.createRecipe}>
              {this.state.loading
                ? <Preloader/>
                : <>
                  Add Recipe
                  <i className="fas fa-check-square" style={{ marginLeft: '8px' }}></i>
                </>
                }
            </Button>
            <Button onClick={this.toggleModal} variant="outlined">Cancel</Button>
        </div>
        </div>
        </div>
      </Dialog>

      <Snackbar
        open={snackBarOpen}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center'
        }}
        onClose={this.closeSnackBar}
        autoHideDuration={4000}
        message={snackBarMessage}
        key={'bottom' + 'center'}
      />
    </>
    )
  }
}

export default AddRecipe
