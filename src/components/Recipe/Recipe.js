import React from 'react'
import { withRouter } from "react-router-dom"
const axios = require('axios')
import './Recipe.scss'
import M from 'materialize-css'
import BounceLoader from "react-spinners/BounceLoader"
import Nav from '../Nav/Nav'
import DOMPurify from 'dompurify'
const { htmlToText } = require('html-to-text')
import ReactQuill from 'react-quill'
import FileUpload from '../File-Upload/FileUpload'
import Preloader from '../Preloader/Preloader'
import { BehaviorSubject } from 'rxjs'
import { rejects } from 'assert'
const tags = require('../../models/tags')
const options = require('../../models/options')
const appear = require('../../models/functions')
let presignedUrlsSubject = new BehaviorSubject([])
let presignedUrls$ = presignedUrlsSubject.asObservable()

let modalInstance

class Recipe extends React.Component {

  state = {
    loading: true,
    recipe_title: null,
    ingredients: null,
    directions: null,
    recipe_title_edit: null, 
    recipe_title_raw: null,
    recipe_title_raw_edit: null,
    ingredients_edit: null, 
    directions_edit: null,
    recipeId: parseInt(this.props.location.pathname.split('/')[2]),
    showConfirmation: false,
    category: '',
    category_edit: '', 
    recipe: null,
    newFiles: [],
    filesToDelete: [],
    tags: tags,
    defaultTileImageKey: null
  }

  goBack = () => {
    this.props.history.push('/dashboard')
  }

  fetchData = async() => {
    try {
      let res = await axios.get(`/recipe/${this.props.location.pathname.split('/')[2]}`)
      let recipe = res.data.recipe
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
        loading: false
      }, () => {
          presignedUrlsSubject.next(res.data.recipe.preSignedUrls)
          const images = document.querySelectorAll('.materialboxed')
          M.Materialbox.init(images, {})
          const modal = document.querySelectorAll('.modal')
          M.Modal.init(modal, {
            opacity: 0.5
          })
          const singleModalElem = document.getElementById(`modal_${this.state.recipeId}`)
          modalInstance = M.Modal.getInstance(singleModalElem)
          const select = document.querySelectorAll('select')
          M.FormSelect.init(select, {})
          const elems = document.querySelectorAll('.fixed-action-btn')
          M.FloatingActionButton.init(elems, {})
      })
      this.state.tags.forEach((tag, index) => {
        if (recipe.tags.includes(tag.recipeTagPropertyName)) {
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
    setTimeout(appear(faded, 'fade-in'), 700)
  }

  openModal = () => {
    modalInstance.open()
    M.updateTextFields()
  }

  closeModal = () => modalInstance.close() 

  checkValidity = () => {
    const { directions_edit, ingredients_edit, recipe_title_edit, category_edit } = this.state;
    if (directions_edit && ingredients_edit && recipe_title_edit, category_edit) {
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
      await axios.delete(`/recipe/${this.state.recipeId}`)
      M.toast({html: 'Recipe deleted.'})
      this.closeModal()
      this.props.history.push('/dashboard')
    } catch(err) {
      console.log(err)
      M.toast({html: 'There was an error.'})
    }
  }

  updateInput = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    }, () => this.checkValidity());
  }

  toggleTagSelectionStatus = (e) => {
    let index = e.target.id 
    let tags = [...this.state.tags]
    let item = {...tags[index]}
    let priorSelectedValue = item.selected
    item.selected = !priorSelectedValue
    tags[index] = item;
    this.setState({tags}, () => this.checkValidity())
  }

  handleDefaultTileImage = (recipeId, uploadedImageKeys) => {
    return new Promise(async(resolve, reject) => {
      let isNewDefaultTile = this.state.defaultTileImageKey !== this.state.recipe.defaultTileImageKey
      if (this.state.defaultTileImageKey && isNewDefaultTile) {
          let defaultTileImage = uploadedImageKeys.find(obj => obj.fileName === this.state.defaultTileImageKey.fileName)
          let defaultTile = await this.setTileImage(recipeId, defaultTileImage.awsKey)
          resolve(defaultTile)
      } else {
        resolve()
      }
    })
  }

  handleDefaultTileImageExisting = (recipeId) => {
    return new Promise(async(resolve, reject) => {
      if (this.state.defaultTileImageKey) {
        let defaultTile = await this.setTileImage(recipeId, this.state.defaultTileImageKey)
        resolve(defaultTile)
      } else {
        // remove if recipe previously had a default image 
        if (!this.state.defaultTileImageKey && this.state.recipe.defaultTileImageKey) {
          await this.removeTileImage(this.state.recipe.id)
          resolve()
        } else {
          resolve()
        }
      }
    })
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
      return {
        awsKey: upload.data.key, 
        fileName: file.file.name
      }
    }))
  }

  deleteFiles = async() => {
    return await Promise.all(this.state.filesToDelete.map( async url => {
        let key = url.split('amazonaws.com/')[1].split('?')[0]
        return await axios.delete(`/file-upload/${key}`)
      })
    )
  }

  setTileImage = async(recipeId, awsKey) => {
    return await axios.post(`/file-upload/tile-image/${awsKey}/${recipeId}`)
  }

  removeTileImage = async(recipeId) => {
    return await axios.delete(`file-upload/tile-image/${recipeId}`)
  }

  updateRecipe = async(e) => {
      e.preventDefault();
      let tags = this.state.tags
      let titleHTML = DOMPurify.sanitize(this.state.recipe_title_raw_edit || this.state.recipe_title_raw)
      const rawTitle = htmlToText(titleHTML, {
        wordwrap: 130
      })
      this.setState({
        loading: true
      })
      this.closeModal()
      try {
        let recipeUpdated = await axios.put(`/recipe`, {
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
        })
        // handle image uploads
        let uploads = this.state.newFiles
        let filesToDelete = this.state.filesToDelete
        let uploading = !!uploads.length 
        let deleting = !!filesToDelete.length
        let uploadedImageKeys
        if (uploading && deleting) {
          // this path works for setting default tile image
          uploadedImageKeys = await this.uploadFiles(this.state.recipeId)
          await this.handleDefaultTileImage(recipeUpdated.data.recipeId, uploadedImageKeys)
          await this.deleteFiles()
          this.handleUpdate()
        } else if (uploading) { 
          console.log('here')
          // this path works for setting default tile image
          uploadedImageKeys = await this.uploadFiles(this.state.recipeId)
          console.log('uploadedImageKeys = ', uploadedImageKeys)
          await this.handleDefaultTileImage(recipeUpdated.data.recipeId, uploadedImageKeys)
          console.log('time to handle update')
          this.handleUpdate()
        } else if (deleting) {
          // this works
          await this.deleteFiles()
          await this.handleDefaultTileImageExisting(recipeUpdated.data.recipeId)
          this.handleUpdate()
        } else {        
          // this works
          await this.handleDefaultTileImageExisting(recipeUpdated.data.recipeId)
          this.handleUpdate()
        }
      } catch(err) {
        console.log(err)
        M.toast({html: 'There was an error updating the recipe.'})
      } finally {
        this.setState({
          loading: false
        })
      }
  }

  handleModelChange = (content, delta, source, editor) => {
    this.setState({
      recipe_title_edit: content,
      recipe_title_raw_edit: editor.getText()
    }, () => this.checkValidity())
  }

  handleModelChangeIngredients = (html) => {
    this.setState({
      ingredients_edit: html
    }, () => this.checkValidity())
  }

  handleModelChangeDirections = (html) => {
    this.setState({
      directions_edit: html
    }, () => this.checkValidity())
  }

  setFiles = (val) => {
    // new files 
    this.setState({
      newFiles: val
    }, () => this.checkValidity())
  }

  setFilesToDelete = (files) => {
    this.setState({
      filesToDelete: files
    }, () => this.checkValidity())
  }

  setDefaultTileImage = (key) => {
    this.setState({
      defaultTileImageKey: key
    }, () => this.checkValidity())
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
      recipe_title_raw 
    } = this.state;

    return (
          !loading  ? 
          <div>
            <h1 className="title">
              <i onClick={this.goBack} className="fas fa-chevron-circle-left"></i>
              <span style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{__html: recipe_title_raw}}/>
            </h1>
            <div className="view-recipe" >
              <div>
                <div className="section">
                  <div id="recipe-title" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(this.state.recipe_title)}}/>
                </div>
                <div className="section">
                  <h3 className="default">Ingredients</h3>
                  <div dangerouslySetInnerHTML={{__html: ingredients}} />
                </div>
                <div className="section">
                  <h3 className="default">Directions </h3>
                  <div dangerouslySetInnerHTML={{__html: directions}}/>
                </div>
                <div className="section">
                  <h3 className="default">Category</h3>
                  <h2>{category}</h2>
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
                <div id={recipe.preSignedUrls?.length < 2 ? 'noGrid' : 'images'}>
                  {recipe.preSignedUrls?.map((url, i) => ( 
                    <img 
                      key={i}
                      className="materialboxed z-depth-2 faded"
                      src={url}/>
                  ))}
                </div>
                <div onClick={this.openModal} className="fixed-action-btn">
                  <a className="btn-floating btn-large" id="primary-color">
                    <i className="large material-icons">mode_edit</i>
                  </a>
                </div>
              </div>
          </div>
            <div id={`modal_${recipeId}`} className="modal recipe-modal">
              <div className="recipe">
                <h1 className="title">Edit Recipe</h1>
                <div className="modal-scroll">
                  <div className="modal-content">
                      <h3>Title</h3>
                      <ReactQuill  value={this.state.recipe_title_edit} onChange={this.handleModelChange}/>
                      <h3>Ingredients</h3>
                      <ReactQuill  value={this.state.ingredients_edit} onChange={this.handleModelChangeIngredients}/>
                      <h3>Directions</h3>
                      <ReactQuill  value={this.state.directions_edit} onChange={this.handleModelChangeDirections}/>
                      <div className="options">
                        <h3>Category</h3>
                        <div className="select">
                          <select onChange={this.updateInput} id="category" value={this.state.category} >
                            {
                              options.map((val, index) => {
                                return <option val={val.label} key={index}>{val.label}</option>
                              })
                            }
                          </select>
                        </div>
                      </div>
                      <div className="options">
                        <h3>Recipe Tags</h3>
                        {
                          tags.map((tag, index) => {
                            return <div 
                              onClick={this.toggleTagSelectionStatus} 
                              id={index} 
                              className={`chip z-depth-2 ${recipe && tags[index].selected  ? "selectedTag" : "null"}`}
                              key={index}>
                                {tag.label}
                              </div>
                          })
                        }
                      </div>
                      <FileUpload 
                        defaultTileImageUUID={recipe.defaultTileImageKey}
                        passDefaultTileImage={this.setDefaultTileImage}
                        preExistingImageUrls={presignedUrls$}
                        passFilesToDelete={this.setFilesToDelete}
                        passFiles={this.setFiles}>
                      </FileUpload>  
                  </div>
              </div>
                <div className="modal-close-buttons">
                  <button 
                    id="primary-color" 
                    className="waves-effect waves-light btn" 
                    onClick={this.deleteRecipe}>
                    Delete Recipe <i className="fas fa-trash"></i>
                  </button>
                  <div>
                    <button onClick={this.closeModal} className="btn waves-effect waves-light grayBtn">Cancel</button>
                    <button 
                      className={!this.state.recipeValid ? 'waves-effect waves-light btn disabled' : 'waves-effect waves-light btn enabled'}
                      disabled={!this.state.recipeValid} 
                      onClick={this.updateRecipe}>
                        {loading ? 
                          <Preloader/> : 
                          <>
                            Update Recipe
                            <i className="fas fa-check-square"></i>
                          </>
                          }
                    </button>
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
