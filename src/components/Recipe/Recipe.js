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

class Recipe extends React.Component {

  state = {
    loading: false,
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
    presignedUrls: [],
    newFiles: [],
    filesToDelete: [],
    tags: [
      {
        selected: false, 
        recipeTagPropertyName: 'no_bake',
        label: 'No Bake',
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'easy',
        label: 'Easy',
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'healthy',
        label: 'Healthy',
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'gluten_free',
        label: 'Gluten-Free',
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'dairy_free',
        label: 'Dairy-Free',
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'sugar_free',
        label: 'Sugar-Free', 
      }, 
      {
        selected: false,
        recipeTagPropertyName: 'vegetarian',
        label: 'Vegetarian', 
      }, 
      {
        selected: false, 
        recipeTagPropertyName: 'vegan',
        label: 'Vegan',
      },
      {
        selected: false,
        recipeTagPropertyName: 'keto',
        label: 'Keto',
      }
    ]
  }

  goBack = () => {
    this.props.history.push('/dashboard')
  }

  fetchData = () => {
    axios.get(`/recipe/${this.props.location.pathname.split('/')[2]}`)
    .then(res => {
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
      })

      if (recipe.image_urls) {
        // get image urls 
        axios.post(`file-upload`, {
          image_urls: recipe.image_urls
        })
        .then(res => {
          this.setState({
            presignedUrls: res.data.presignedUrls
          }, () => {
            const images = document.querySelectorAll('.materialboxed');
            M.Materialbox.init(images, {});
          })
        })
        .catch(err => console.log(err))
      } else {
        this.setState({
          presignedUrls: []
        })
      }

      this.state.tags.forEach((tag, index) => {
        if (recipe.tags.includes(tag.recipeTagPropertyName)) {
            // 1. Make a shallow copy of the items
            let tags = [...this.state.tags];
            // 2. Make a shallow copy of the item you want to mutate
            let item = {...tags[index]};
            // 3. Replace the property you're intested in
            item.selected = true;
            // 4. Put it back into our array. N.B. we *are* mutating the array here, but that's why we made a copy first
            tags[index] = item;
            // 5. Set the state to our new copy
            this.setState({tags});
        }
      })
      this.setState({
        loaded: true
      }, () => {
        let modal = document.querySelectorAll('.modal')
        M.Modal.init(modal, {
          opacity: 0.5
        })
        var select = document.querySelectorAll('select')
        M.FormSelect.init(select, {})
      })
    })
    .catch((err) => {
      console.log(err)
      if (err.response.status === 401) {
        // unathenticated; redirect to log in 
        this.props.history.push('/login')
      }
    })
  }

  componentDidMount() {
    this.fetchData()

    const elems = document.querySelectorAll('.fixed-action-btn');
    M.FloatingActionButton.init(elems, {});
  }

  openModal = () => {
    let singleModalElem = document.getElementById(`modal_${this.state.recipeId}`)
    let instance = M.Modal.getInstance(singleModalElem)
    instance.open()
    M.updateTextFields()
  }

  closeModal = () => {
    let singleModalElem = document.querySelector(`.modal`);
    let instance = M.Modal.getInstance(singleModalElem); 
    instance.close()
  } 

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

  deleteRecipe = () => {
    axios.delete(`/recipe/${this.state.recipeId}`)
    .then(() => {
        M.toast({html: 'Recipe deleted.'});
        this.closeModal()
        this.props.history.push('/dashboard')
    })
    .catch((err) => {
      console.log(err)
      this.closeModal()
      M.toast({html: 'There was an error.'})
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
    this.setState({tags}, () => this.checkValidity());
  }

  handleUpdate() {
    // Update recipe details to reflect the change
    this.fetchData()
    M.toast({html: 'Recipe updated.'})
    this.setState({
      loading: false,
      filesToDelete: [],
      newFiles: []
    })
  }

  uploadFiles = async(recipeId) => {
    let uploads = this.state.newFiles
    await Promise.all(uploads.map( async file => {
      let formData = new FormData() 
      formData.append('image', file.file)

      await axios.post(
        `/file-upload/${recipeId}`, 
        formData,
        {
          headers: {
            'content-type': 'multipart/form-data'
          }
        }
      )
    }))
  }

  // this being called when it shouldn't
  deleteFiles = async() => {
    await Promise.all(this.state.filesToDelete.map( async url => {
      let key = url.split('amazonaws.com/')[1].split('?')[0]
        await axios.delete(`/file-upload/${key}`)
        .then(() => {})
        .catch(err => {
          console.log(err)
        })
      })
    )
  }

  updateRecipe = (e) => {
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
      axios.put(`/recipe`, {
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
        isKeto: tags[8].selected
      })
      .then(res => {
        if (res) {
          // handle image uploads
          let uploads = this.state.newFiles
          if (uploads.length && this.state.filesToDelete.length) {
            Promise.all([this.uploadFiles(this.state.recipeId), this.deleteFiles()]).then((val) => {
              this.handleUpdate()
            })
          } else if (uploads.length) { 
            this.uploadFiles(this.state.recipeId)
            .then(() => this.handleUpdate())
            .catch(err => console.log(err))
          } else if (this.state.filesToDelete.length) {
            this.deleteFiles()
            .then(() => this.handleUpdate())
            .catch(err => console.log(err))
          } else {    
            // does this ever run?      
            this.handleUpdate()
          }
        }
      })
      .catch((err) => {
        console.log(err)
        M.toast({html: 'There was an error updating the recipe.'})
        this.setState({
          loading: false
        })
      })
  }

  handleModelChange = (content, delta, source, editor) => {
    this.setState({
      recipe_title_edit: content,
      recipe_title_raw_edit: editor.getText()
    }, () => this.checkValidity());
  }

  handleModelChangeIngredients = (html) => {
    this.setState({
      ingredients_edit: html
    }, () => this.checkValidity());
  }

  handleModelChangeDirections = (html) => {
    this.setState({
      directions_edit: html
    }, () => this.checkValidity());
  }

  setFiles = (val) => {
    // new files 
    this.setState({
      newFiles: val
    })
  }

  setFilesToDelete = (files) => {
    this.setState({
      filesToDelete: files
    })
  }

  render() {
    const { recipeId, category, loading } = this.state;
    const options = [
      { value: 'breakfast', label: 'Breakfast' },
      { value: 'lunch', label: 'Lunch' },
      { value: 'dinner', label: 'Dinner' },
      { value: 'dessert', label: 'Dessert' },
      { value: 'side_dish', label: 'Side Dish' },
      { value: 'drinks', label: 'Drinks' },
      { value: 'other', label: 'Other' }
    ]

    return (
      <>
      <Nav loggedIn={true}/>
        {
          !loading ? 
          <>
            <h1 className="Title">
              <i onClick={this.goBack} className="fas fa-chevron-circle-left"></i>
              <span style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{__html: this.state.recipe_title_raw}}/>
            </h1>
            <div className="view-recipe" >
              <div>
                <div className="section">
                  <div id="recipe-title" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(this.state.recipe_title)}}/>
                </div>
                <div className="section">
                  <h3 className="default">Ingredients</h3>
                  <div dangerouslySetInnerHTML={{__html: this.state.ingredients}} />
                </div>
                <div className="section">
                  <h3 className="default">Directions </h3>
                  <div dangerouslySetInnerHTML={{__html: this.state.directions}}/>
                </div>
                <div className="section">
                  <h3 className="default">Category</h3>
                  <h2>{category}</h2>
                </div>
                <div className="section">
                  {
                    this.state.tags.map((tag) => {
                        return ( tag.selected ? <div className="chip z-depth-2 selectedTag">{ tag.label }</div> : null )
                    }) 
                  }
                </div>
                <div id="images">
                  {
                    this.state.presignedUrls.map(url => {
                      return (
                        <div
                            className="materialboxed z-depth-2 recipe-image"
                            style={{ backgroundImage: `url(${url})`  }}>
                            
                        </div>
                      )
                    })
                  }
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
              <div>
                <h1 className="Title fixed">Edit Recipe</h1>
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
                  this.state.tags.map((tag, index) => {
                    return <div 
                      onClick={this.toggleTagSelectionStatus} 
                      id={index} 
                      className={`chip z-depth-2 ${this.state.recipe && this.state.tags[index].selected  ? "selectedTag" : "null"}`}
                      key={index}>
                        {tag.label}
                      </div>
                  })
                }
              </div>
              <FileUpload 
                preExistingImageUrls={this.state.presignedUrls}
                passFilesToDelete={this.setFilesToDelete}
                passFiles={this.setFiles}>
              </FileUpload>   
            </div>
          </div> 
          <div className="modal-close-buttons">
              <button id="primary-color" className="waves-effect waves-light btn" onClick={this.deleteRecipe}>Delete Recipe <i className="fas fa-trash"></i></button>
              <div>
                <button onClick={this.closeModal} className="btn waves-effect waves-light grayBtn">Cancel</button>
                <button 
                  className={!this.state.recipeValid ? 'waves-effect waves-light btn disabled' : 'waves-effect waves-light btn enabled'}
                  disabled={!this.state.recipeValid} 
                  onClick={this.updateRecipe}>
                    {this.state.loading ? 
                      <div class="preloader-wrapper small active">
                        <div class="spinner-layer">
                          <div class="circle-clipper left">
                            <div class="circle"></div>
                          </div><div class="gap-patch">
                            <div class="circle"></div>
                          </div><div class="circle-clipper right">
                            <div class="circle"></div>
                          </div>
                        </div>
                      </div> : 
                      <>
                        Update Recipe
                        <i className="fas fa-check-square"></i>
                      </>
                      }
                </button>
              </div>
            </div>
        </div>
          </> :  
          <div className="BounceLoader">
            <BounceLoader
                size={100}
                color={"#689943"}
            />
          </div>
        }
        </>
    )
  }
}

export default withRouter(Recipe);
