import React from 'react'
import { withRouter } from "react-router-dom"
import './Recipe.scss'
import M from 'materialize-css'
import BounceLoader from "react-spinners/BounceLoader"
import DOMPurify from 'dompurify'
import { BehaviorSubject } from 'rxjs'
import { tags } from '../../models/tags'
import { RecipeService, RecipeInterface } from '../../services/recipe-services'
import Tag from '../../models/tags'
import { appear } from '../../models/functions'
import Fade from 'react-reveal/Fade'
import RecipeDialog from './RecipeDialog/RecipeDialog'
import { Divider } from '@material-ui/core'
import LightboxComponent from './LightboxComponent/LightboxComponent'
const presignedUrlsSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([])
const presignedUrls$ = presignedUrlsSubject.asObservable()

type State = {
  loading: boolean
  recipe: RecipeInterface | null
  tags: Tag[]
  cloning: boolean
  width: number
  dialogOpen: boolean
}

class Recipe extends React.Component<any, State> {

  state = {
    loading: true,
    recipe: null,
    tags,
    cloning: false,
    width: window.innerWidth,
    dialogOpen: false,
  }

  goBack = () => {
    this.props.history.push('/recipes')
  }

  triggerDialog = () => {
    let state = this.state.dialogOpen
    this.setState({
      dialogOpen: !state
    })
  }

  fetchData = async() => {
    try {
      const recipe: RecipeInterface = await RecipeService.getRecipe(this.props.match.params.id)
      this.setState({
        recipe,
        loading: false,
      }, () => {
          if (recipe.preSignedUrls) {
            presignedUrlsSubject.next(recipe.preSignedUrls)
          } else {
            presignedUrlsSubject.next([])
          }
          const elems = document.querySelectorAll('.fixed-action-btn')
          M.FloatingActionButton.init(elems, {})
      })

      const tagState = tags.map(tag => {
        tag.selected = !!recipe.tags.includes(tag.recipeTagPropertyName)
        return tag
      })
      this.setState({
        tags: tagState
      })
    } catch(err) {
      console.log(err)
      if (err.response?.status === 401) {
        // unathenticated; redirect to log in
        this.props.history.push('/login')
      }
    }
  }

  componentDidMount() {
    this.fetchData()
    const faded = document.querySelectorAll('.fade')
    setTimeout(() => appear(faded, 'fade-in'), 700)
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

  cloneRecipe = (e: Event) => {
    e.stopPropagation()
    presignedUrlsSubject.next([])
    this.setState({
      cloning: true
    }, () => this.triggerDialog())
  }

  render() {
    const {
      loading,
      tags,
      recipe,
      cloning,
      width,
    } = this.state;

    return (
          !loading  ?
          <div id="mobile-recipe-container">
            <h1 className="title">
              <i onClick={this.goBack} className="fas fa-chevron-circle-left"></i>
              <span style={{ display: 'inline-block' }} dangerouslySetInnerHTML={{__html: recipe.rawTitle}}/>
            </h1>
            <Fade>
              <RecipeDialog 
                edit={true} 
                recipe={this.state.recipe}
                open={this.state.dialogOpen} 
                cloning={cloning}
                defaultTileImageKey={recipe.defaultTileImageKey}
                presignedUrls$={presignedUrls$}
                fetchData={this.fetchData}
                addRecipeMutation={this.props.addRecipeMutation}
                triggerDialog={this.triggerDialog}>
              </RecipeDialog>
              <div className="view-recipe" >
                <div id="recipe-mobile-toolbar" className={width > 700 ? "hidden" : ''}>
                    <a className='dropdown-trigger' data-target='dropdown1'><i className="fas fa-ellipsis-v"></i></a>
                    <ul id='dropdown1' className='dropdown-content'>
                      <li onClick={this.triggerDialog}><a>Edit</a></li>
                      <li onClick={this.cloneRecipe}><a>Duplicate</a></li>
                    </ul>
                </div>
                <div id="width-setter">
                  <div className="section">
                    <div id="recipe-title" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(recipe.title)}}/>
                  </div>
                  <div className="section">
                    <div dangerouslySetInnerHTML={{__html: recipe.ingredients}} />
                  </div>
                  <div className="section">
                    <div dangerouslySetInnerHTML={{__html: recipe.directions}}/>
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
                  <Divider style={{'margin': '20px 0 10px 0'}} />
                  <div id={recipe.preSignedUrls?.length < 2 ? 'noGrid' : 'images'}>
                    <LightboxComponent preSignedUrls={recipe.preSignedUrls}></LightboxComponent>
                  </div>
                  { width > 700 ?
                    <div onClick={this.triggerDialog} className="fixed-action-btn">
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
          </div>
             :
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
