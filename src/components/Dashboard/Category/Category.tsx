import React from 'react'
import AddRecipe from './AddRecipe/AddRecipe'
import Square from './Square/Square'
import ListItem from './ListItem/ListItem'
import Fade from 'react-reveal/Fade'
import { FullRecipe } from '../../../../server/recipe'

const Category = (props: {
  title: string
  id: string
  recipes: FullRecipe[]
  visibility: string
  gridView: boolean
  addRecipe: Function
  children: any
}) => {
  const { title, id, recipes, visibility, gridView } = props
  return (
      <Fade>
        <div className={visibility === 'true' ? 'visible category' : 'invisible category'}>
          <h3 >{title}</h3>
          <div className="recipeBox">
            <AddRecipe
              id={id}
              gridView={gridView}
              category={title}
              addRecipe={props.addRecipe}
            />
            { recipes
              ? recipes.map((recipe) => {
                return (
                  gridView
                    ? <Square
                      key={recipe.id}
                      awsUrl={recipe.preSignedDefaultTileImageUrl}
                      data={recipe}
                      rawTitle={recipe.rawTitle}/>
                    : <ListItem
                      key={recipe.id}
                      data={recipe}
                      rawTitle={recipe.rawTitle}>
                    </ListItem>
                )
              })
              : null
            }
          </div>
        </div>
      </Fade>
  )
}

export default Category
