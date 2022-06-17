import { Accordion, AccordionDetails, AccordionSummary, Button, Chip, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Snackbar, Typography } from '@material-ui/core'
import Dialog from '@material-ui/core/Dialog'
import Slide from '@material-ui/core/Slide'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import DOMPurify from 'dompurify'
import React, { useEffect, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { RouteComponentProps } from 'react-router-dom'
import options from '../../../../models/options'
import { tags as RecipeTags } from '../../../../models/tags'
import { DefaultTile, NewFileInterface, RecipeInput } from '../../../../services/recipe-services'
import FileUpload from '../../../File-Upload/FileUpload'
import Preloader from '../../../Preloader/Preloader'
import { AddRecipeMutationParam } from '../../../RecipeCache/RecipeCache'
import './AddRecipe.scss'
const { htmlToText } = require('html-to-text')

const Transition = React.forwardRef(function Transition (props, ref) {
  return <Slide direction="up" ref={ref} {...props} />
})

interface Props extends RouteComponentProps {
  id: string
  category: string
  addRecipe: Function
  gridView: boolean
}

const AddRecipe = (props: Props) => {
  const [loading, setLoading] = useState(false)
  const [recipeTitle, setRecipeTitle]= useState('')
  const [ingredients, setIngredients] = useState('')
  const [directions, setDirections] = useState('')
  const [category, setCategory] = useState(options.find(option => option.label === props.category).value)
  const [recipeValid, setRecipeValid] = useState(false)
  const [newFiles, setNewFiles] = useState([])
  const [tags, setTags] = useState(RecipeTags.map(tag => ({ ...tag, selected: false })))
  const [defaultTile, setDefaultTile] = useState(null)
  const [open, setOpen] = useState(false)
  const [snackBarOpen, setSnackBarOpen] = useState(false)
  const [snackBarMessage, setSnackBarMessage] = useState('')

  const clearState = () => {
    const prevOpenState = open
    setRecipeTitle('')
    setIngredients('')
    setDirections('')
    setOpen(!prevOpenState)
    setTags(tags)
  }

  const createRecipe = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    const titleHTML = DOMPurify.sanitize(recipeTitle, {})
    const rawTitle = htmlToText(titleHTML, { wordwrap: 130 })
    setLoading(true)
    const recipeInput: RecipeInput = {
      title: DOMPurify.sanitize(recipeTitle, {}),
      rawTitle,
      category,
      ingredients: DOMPurify.sanitize(ingredients, {}),
      directions: DOMPurify.sanitize(directions, {}),
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
        files: newFiles,
        defaultTile: defaultTile
      }
      await props.addRecipe(param)
      openSnackBar('Recipe added.')
      clearState()
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
      openSnackBar('There was an error.')
    }
  }

  const openSnackBar = (message: string): void => {
    setSnackBarOpen(true)
    setSnackBarMessage(message)
  }

  const closeSnackBar = (): void => {
    setSnackBarOpen(false)
    setSnackBarMessage('')
  }

  const toggleModal = (): void => {
    const prevOpenState = open
    setOpen(!prevOpenState)
  }

  const updateCategory = (e) => {
    setCategory(e.target.value)
  }

  const toggleTagSelectionStatus = (index: number) => {
    const copyTags = [...tags]
    const item = { ...copyTags[index] }
    const priorSelectedValue = item.selected
    item.selected = !priorSelectedValue
    copyTags[index] = item
    setTags(copyTags)
  }

  const setFiles = (newFiles: NewFileInterface[]) => {
    setNewFiles(newFiles)
  }

  const setDefaultTileImage = (defaultTile: DefaultTile) => {
    setDefaultTile(defaultTile)
  }

  const handleModelChange = (html: string) => {
    setRecipeTitle(html)
  }

  const handleModelChangeIngredients = (html: string) => {
    setIngredients(html)
  }

  const handleModelChangeDirections = (html: string) => {
    setDirections(html)
  }

  useEffect(() => {
    const rawDirections = htmlToText(directions)
    const rawIngredients = htmlToText(ingredients)
    const rawTitle = htmlToText(recipeTitle)
    const recipeValid: boolean = !!rawDirections.trim() && !!rawIngredients.trim() && !!rawTitle.trim()
    setRecipeValid(recipeValid)
  }, [recipeTitle, ingredients, directions])

  const { id, gridView } = props

  return (
    <>
      { gridView
        ? <div
            onClick={toggleModal}
            className="addRecipe"
            id={id}>
            <i className="fas fa-plus-circle"></i>
          </div>
        : <Button
            className="add-button"
            variant="contained"
            onClick={toggleModal}>
            Add Recipe
            <i className="fas fa-plus-circle" style={{ marginLeft: '8px' }}></i>
          </Button>
    }

    <Dialog fullScreen open={open} onClose={toggleModal} TransitionComponent={Transition}>
      <DialogTitle className='title'><span>Add Recipe</span></DialogTitle>
      <DialogContent>
        <h3>Title</h3>
        <ReactQuill value={recipeTitle} onChange={handleModelChange}/>
        <h3>Ingredients</h3>
        <ReactQuill theme="snow" value={ingredients} onChange={handleModelChangeIngredients}/>
        <h3>Directions</h3>
        <ReactQuill theme="snow" value={directions} onChange={handleModelChangeDirections}/>
        <div>
          <FormControl variant="filled" style={{ width: '100%', margin: '10px 0' }}>
            <InputLabel>Category</InputLabel>
            <Select
              id="category"
              value={category}
              onChange={updateCategory}
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
                tags.map((tag, index) => {
                  return <Chip
                    className={`chip ${tags[index].selected ? 'selectedTag' : 'null'}`}
                    id={index.toString()}
                    key={index}
                    onClick={() => toggleTagSelectionStatus(index)}
                    label={tag.label} />
                })
              }
            </Typography>
          </AccordionDetails>
        </Accordion>
        <FileUpload
          open={open}
          passDefaultTileImage={setDefaultTileImage}
          passFiles={setFiles}/>
      </DialogContent>
      <DialogActions>
        <div className="modal-close-buttons">
          <Button
            variant="contained"
            color="secondary"
            disabled={!recipeValid}
            onClick={createRecipe}>
              { loading
                ? <Preloader/>
                : <>
                    Add Recipe
                    <i className="fas fa-check-square" style={{ marginLeft: '8px' }}></i>
                  </>
              }
            </Button>
          <Button onClick={toggleModal} variant="outlined">Cancel</Button>
        </div>
      </DialogActions>
    </Dialog>

    <Snackbar
      open={snackBarOpen}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      onClose={closeSnackBar}
      autoHideDuration={4000}
      message={snackBarMessage}
      key={'bottom' + 'center'}
    />
  </>
  )
}

export default AddRecipe
