import { Chip, Divider, Fab, Tooltip } from '@material-ui/core'
import DOMPurify from 'dompurify'
import React from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import BounceLoader from 'react-spinners/BounceLoader'
import { BehaviorSubject } from 'rxjs'
import { appear } from '../../models/functions'
import Tag, { tags } from '../../models/tags'
import { RecipeInterface, RecipeService } from '../../services/recipe-services'
import InnerNavigationBar from '../InnerNavigationBar/InnerNavigationBar'
import LightboxComponent from './LightboxComponent/LightboxComponent'
import MobileRecipeToolbar from './MobileRecipeToolbar/MobileRecipeToolbar'
import './Recipe.scss'
import RecipeDialog from './RecipeDialog/RecipeDialog'

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

class Recipe extends React.Component<RouteComponentProps, State> {
  state = {
    loading: true,
    recipe: null,
    tags,
    cloning: false,
    width: window.innerWidth,
    dialogOpen: false
  }

  triggerDialog = () => {
    const state = this.state.dialogOpen
    this.setState({
      dialogOpen: !state
    })
  }

  fetchData = async () => {
    try {
      const recipe: RecipeInterface = await RecipeService.getRecipe(this.props.match.params.id)
      this.setState({
        recipe,
        loading: false
      }, () => {
        if (recipe.preSignedUrls) {
          presignedUrlsSubject.next(recipe.preSignedUrls)
        } else {
          presignedUrlsSubject.next([])
        }
        const elems = document.querySelectorAll('.fixed-action-btn')
      })

      const tagState = tags.map(tag => {
        tag.selected = !!recipe.tags.includes(tag.recipeTagPropertyName)
        return tag
      })
      this.setState({
        tags: tagState
      })
    } catch (err) {
      console.log(err)
      if (err.response?.status === 401) {
        // unathenticated; redirect to log in
        this.props.history.push('/login')
      }
    }
  }

  componentDidMount () {
    this.fetchData()
    const faded = document.querySelectorAll('.fade')
    setTimeout(() => appear(faded, 'fade-in'), 700)
    window.addEventListener('resize', this.handleWindowSizeChange)
  }

  componentWillUnmount () {
    window.removeEventListener('resize', this.handleWindowSizeChange)
  }

  handleWindowSizeChange = () => {
    this.setState({
      width: window.innerWidth
    })
  }

  cloneRecipe = () => {
    presignedUrlsSubject.next([])
    this.setState({
      cloning: true
    }, () => this.triggerDialog())
  }

  render () {
    const {
      loading,
      tags,
      recipe,
      cloning,
      width
    } = this.state

    return (
      !loading
        ? <div id="recipe-container">
            <InnerNavigationBar title={recipe.rawTitle}></InnerNavigationBar>
            <RecipeDialog
              edit={true}
              recipe={this.state.recipe}
              open={this.state.dialogOpen}
              cloning={cloning}
              defaultTileImageKey={recipe.defaultTileImageKey}
              openSnackBar={this.props.openSnackBar}
              presignedUrls$={presignedUrls$}
              fetchData={this.fetchData}
              addRecipeMutation={this.props.addRecipeMutation}
              triggerDialog={this.triggerDialog}>
            </RecipeDialog>
            <div className="view-recipe" >
              <MobileRecipeToolbar
                width={width}
                triggerDialog={this.triggerDialog}
                cloneRecipe={this.cloneRecipe}>
              </MobileRecipeToolbar>
              <div id="width-setter">
                <div className="section">
                  <div id="recipe-title" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(recipe.title) }}/>
                </div>
                <div className="section">
                  <div dangerouslySetInnerHTML={{ __html: recipe.ingredients }} />
                </div>
                <div className="section">
                  <div dangerouslySetInnerHTML={{ __html: recipe.directions }}/>
                </div>
                <div className="section">
                  {tags.map((tag) => (tag.selected
                    ? <Chip 
                        key={tag.label}
                        className={'chip selectedTag'}
                        label={tag.label} />
                    : null)
                  )}
                </div>
                <Divider style={{ margin: '20px 0 10px 0' }} />
                <div id={recipe.preSignedUrls?.length < 2 ? 'noGrid' : 'images'}>
                  <LightboxComponent preSignedUrls={recipe.preSignedUrls}></LightboxComponent>
                </div>
              </div>
            </div>
            { width > 700
              ? <div id="floating-buttons">
                <Tooltip title="Edit recipe" aria-label="edit recipe">
                  <Fab color="secondary" onClick={this.triggerDialog}>
                    <i className="material-icons">mode_edit</i>
                  </Fab>
                </Tooltip>

                <Tooltip title="Duplicate recipe" aria-label="duplicate">
                  <Fab color="primary" onClick={this.cloneRecipe}>
                    <i className="far fa-clone"></i>
                  </Fab>
                </Tooltip>
              </div>
              : null }
          </div>
        : <div className="BounceLoader">
            <BounceLoader
                size={100}
                color={'#689943'}
            />
          </div>
    )
  }
}

export default withRouter(Recipe)
