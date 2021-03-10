import React from 'react'
import M from 'materialize-css'
import './AddRecipe.scss'
const axios = require('axios')
import DOMPurify from 'dompurify'
const { htmlToText } = require('html-to-text')
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import '../../../File-Upload/FileUpload'
import FileUpload from '../../../File-Upload/FileUpload'
import Preloader from '../../../Preloader/Preloader'
const FormData = require('form-data')
const tags = require('../../../../models/tags')
const options = require('../../../../models/options')
// import { setRecipeTileImage } from '../../../../../routes/recipe-service'

class AddRecipe extends React.Component {

  state = {
    loading: false,
    recipe_title: null,
    ingredients: null,
    directions: null,
    category: this.props.category,
    recipeValid: false,
    newFiles: [],
    tags: tags,
    defaultTileImageKey: null,
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
      recipe_title: null,
      ingredients: null,
      directions: null,
      open: !prevOpenState
    })
  }


  uploadFiles = async(recipeId) => {
    let uploads = this.state.newFiles
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

      return { awsKey: upload.data.key, fileName: file.file.name }
    }))
  }

  setTileImageNewRecipe = async(recipeId, awsKey) => {
    await axios.post(`/file-upload/tile-image/${awsKey}/${recipeId}`)
  }

  handleSuccess() {
    M.toast({html: 'Recipe added.'})
    this.clearState()
    this.closeModal()
    this.props.updateDashboard()
}

  handleDefaultTileImage = (recipeId, awsKey) => {
    return new Promise(async(resolve, reject) => {
      try {
        let defaultTile = await this.setTileImageNewRecipe(recipeId, awsKey)
        resolve(defaultTile)
      } catch(e) {
        reject(e)
      }
    })
  }

  createRecipe = async(e) => {
    e.preventDefault();
    let tags = this.state.tags;
    let titleHTML = DOMPurify.sanitize(this.state.recipe_title)
    const rawTitle = htmlToText(titleHTML, {
      wordwrap: 130
    })
    this.setState({
      loading: true
    })
    try {
      await axios.get('/')
      let recipeCreated = await axios.post(`/recipe`, {
        title: DOMPurify.sanitize(this.state.recipe_title),
        rawTitle,
        category: this.state.category,
        ingredients: DOMPurify.sanitize(this.state.ingredients),
        directions: DOMPurify.sanitize(this.state.directions),
        isNoBake: tags[0].selected,
        isEasy: tags[1].selected,
        isHealthy: tags[2].selected,
        isGlutenFree: tags[3].selected, 
        isDairyFree: tags[4].selected,
        isSugarFree: tags[5].selected, 
        isVegetarian: tags[6].selected, 
        isVegan: tags[7].selected,
        isKeto: tags[8].selected,
      })
      let uploads = this.state.newFiles
      if (uploads.length) {
        try {
          // we must get the AWS KEY from this call
          let uploadedImageKeys = await this.uploadFiles(recipeCreated.data.recipeId)
          let defaultTileImage = uploadedImageKeys.find(obj => obj.fileName === this.state.defaultTileImageKey?.fileName)
          if (defaultTileImage) {
            await this.handleDefaultTileImage(recipeCreated.data.recipeId, defaultTileImage.awsKey)
          }
          this.handleSuccess()
        } catch (error) {
          console.log(error)
        }
      } else {
        this.handleSuccess()
      }
    } catch (error) {
      console.log(error)
      M.toast({html: 'There was an error.'})
    } finally {
      this.setState({
        loading: false
      })
    } 
  }  

  closeModal = () => {
    let singleModalElem = document.querySelector(`#${this.props.id}_modal`)
    let instance = M.Modal.getInstance(singleModalElem)
    instance.close()
  } 

  openModal = () => {
    let prevOpenState = this.state.open
    let singleModalElem = document.querySelector(`#${this.props.id}_modal`); 
    let instance = M.Modal.getInstance(singleModalElem); 
    instance.open();
    this.setState({
      open: !prevOpenState
    })
  }

  updateInput = (e) => {
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

  handleModelChange = (html) => {
    this.setState({
      recipe_title: html
    }, () => this.checkValidity());
  }

  handleModelChangeIngredients = (html) => {
    this.setState({
      ingredients: html
    }, () => this.checkValidity());
  }

  handleModelChangeDirections = (html) => {
    this.setState({
      directions: html
    }, () => this.checkValidity());
  }

  setFiles = (val) => {
    // new files 
    this.setState({
      newFiles: val
    })
  }

  setDefaultTileImage = (fileName) => {
    this.setState({
      defaultTileImageKey: fileName
    })
  }

  render() {
    const { id, gridView } = this.props;
    const { open } = this.state

    return (
      <>
        { gridView ? <div
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
                    <ReactQuill value={this.state.recipe_title} onChange={this.handleModelChange}/>
                    <h3>Ingredients</h3>
                    <ReactQuill theme="snow" value={this.state.ingredients} onChange={this.handleModelChangeIngredients}/>
                    <h3>Directions</h3>
                    <ReactQuill theme="snow" value={this.state.directions} onChange={this.handleModelChangeDirections}/>
                    <div>
                        <h3>Category</h3>
                        <div className="select">
                          <select onChange={this.updateInput} id="category" value={this.state.category} >
                            {
                              options.map((val, index) => {
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
                                  id={index} 
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
