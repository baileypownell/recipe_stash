import React, { ChangeEvent } from 'react'
import M from 'materialize-css'
import './AddRecipe.scss'
import DOMPurify from 'dompurify'
const { htmlToText } = require('html-to-text')
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import '../../../File-Upload/FileUpload'
import FileUpload from '../../../File-Upload/FileUpload'
import Preloader from '../../../Preloader/Preloader'
import { RecipeService, RecipeInput, NewFileInterface, DefaultTile } from '../../../../services/recipe-service'
import tag, { tags } from '../../../../models/tags'

import options from '../../../../models/options'

type Props = {
  updateDashboard: any 
  id: number 
  category: string
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
  open: boolean
}


class AddRecipe extends React.Component<Props, State> {

  state = {
    loading: false,
    recipe_title: '',
    ingredients: '',
    directions: '',
    category: this.props.category,
    recipeValid: false,
    newFiles: [],
    tags: tags,
    defaultTile: null,
    open: false
  }

  componentDidMount() {
    const modal = document.querySelectorAll('.modal');
    M.Modal.init(modal, {
      opacity: 0.5
    });

    const select = document.querySelectorAll('select');
    M.FormSelect.init(select, {});

    // category selector 
    const categorySelector = document.querySelectorAll('.collapsible');
    M.Collapsible.init(categorySelector, {});

    // recipe category chip tags 
    const chips = document.querySelectorAll('.chips');
    M.Chips.init(chips, {});
  }

  checkValidity = () => {
    const { directions, ingredients, recipe_title } = this.state;
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
    let prevOpenState = this.state.open
    this.setState({
      recipe_title: '',
      ingredients: '',
      directions: '',
      open: !prevOpenState,
      tags: tags
    })
  }

  handleSuccess() {
    M.toast({html: 'Recipe added.'})
    this.clearState()
    this.closeModal()
    this.setState({
      loading: false
    })
    this.props.updateDashboard()
  }

  createRecipe = async(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault()
    let tags = this.state.tags
    let titleHTML = DOMPurify.sanitize(this.state.recipe_title, {})
    const rawTitle = htmlToText(titleHTML, {
      wordwrap: 130
    })
    this.setState({
      loading: true
    })
    // using service 
    let recipeInput: RecipeInput = {
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
      isKeto: tags[8].selected,
    }
    try {
      await RecipeService.createRecipe(recipeInput, this.state.newFiles, this.state.defaultTile)
      this.handleSuccess()
    } catch(err) {
      console.log(err)
      this.setState({
        loading: false
      })
      M.toast({html: 'There was an error.'})
    }
  }  

  closeModal = () => {
    let singleModalElem: Element = document.querySelector(`#${this.props.id}_modal`) as Element
    let instance = M.Modal.getInstance(singleModalElem)
    instance.close()
  } 

  openModal = () => {
    let prevOpenState = this.state.open
    let singleModalElem: Element = document.querySelector(`#${this.props.id}_modal`) as Element 
    let instance = M.Modal.getInstance(singleModalElem); 
    instance.open();
    this.setState({
      open: !prevOpenState
    })
  }

  updateInput = (e: ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      [e.target.id]: e.target.value
    }, () => this.checkValidity());
  }

  toggleTagSelectionStatus = (e) => {
    let index = e.target.id 
    // 1. Make a shallow copy of the items
    let tags = [...this.state.tags];
    // 2. Make a shallow copy of the item you want to mutate
    let item = {...tags[index]};
    // 3. Replace the property you're intested in
    let priorSelectedValue = item.selected
    item.selected = !priorSelectedValue;
    // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
    tags[index] = item;
    // 5. Set the state to our new copy
    this.setState({tags});
  }

  handleModelChange = (html: string) => {
    this.setState({
      recipe_title: html
    }, () => this.checkValidity());
  }

  handleModelChangeIngredients = (html: string) => {
    this.setState({
      ingredients: html
    }, () => this.checkValidity());
  }

  handleModelChangeDirections = (html: string) => {
    this.setState({
      directions: html
    }, () => this.checkValidity());
  }

  setFiles = (newFiles: NewFileInterface[]) => {
    // new files 
    this.setState({
      newFiles: newFiles
    })
  }

  setDefaultTileImage = (defaultTile: DefaultTile) => {
    this.setState({
      defaultTile: defaultTile
    })
  }

  render() {
    const { id, gridView } = this.props as any;
    const { open, category, recipe_title, ingredients, directions } = this.state

    return (
      <>
        { gridView ? 
          <div
            onClick={this.openModal}
            className="addRecipe z-depth-4"
            id={id}
             >
            <i className="fas fa-plus-circle"></i>
        </div> : <a onClick={this.openModal} className="waves-effect waves-light btn add-button">Add Recipe<i className="fas fa-plus-circle"></i></a>
      }

        <div id={`${this.props.id}_modal`} className="modal recipe-modal">
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
                        <h3>Category</h3>
                        <div className="select">
                          <select onChange={this.updateInput} id="category" value={category} >
                            {
                              options.map((val, index: number) => {
                                return <option key={index}>{val.label}</option>
                              })
                            }
                          </select>
                            
                        </div>
                    </div>

                    <ul className="collapsible">
                      <li>
                        <div className="collapsible-header"><p>Recipe Tags</p></div>
                        <div className="collapsible-body">
                            {
                              this.state.tags.map((tag, index) => {
                                return <div 
                                  onClick={this.toggleTagSelectionStatus} 
                                  id={index.toString()} 
                                  className={`chip z-depth-2 ${this.state.tags[index].selected ? "selectedTag" : "null"}`}
                                  key={index}>
                                    {tag.label}
                                  </div>
                              })
                            }
                        </div>
                      </li>
                    </ul>
                    <FileUpload 
                      open={open}
                      passDefaultTileImage={this.setDefaultTileImage} 
                      passFiles={this.setFiles}>
                      </FileUpload>
                  </div>
                </div>
                <div className="modal-close-buttons">
                <button className="modal-close btn waves-effect waves-light grayBtn">Cancel</button>
                <button 
                  className={!this.state.recipeValid ? 'waves-effect waves-light btn disabled' : 'waves-effect waves-light btn enabled'}
                  disabled={!this.state.recipeValid} 
                  onClick={this.createRecipe}>
                    {this.state.loading ? 
                      <Preloader/> : 
                      <>
                        Save
                        <i className="fas fa-check-square"></i>
                      </>
                      }
                 </button>
              </div>
            </div>
          </div> 
      </>
      
    )
  }
}

export default AddRecipe;
