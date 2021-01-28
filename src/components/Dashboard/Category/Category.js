import React, { useEffect } from 'react'
import AddRecipe from './AddRecipe/AddRecipe'
import Square from './Square/Square'
import ListItem from './ListItem/ListItem'

const Category = (props) => {
  useEffect(() => {
      let opacity = document.querySelectorAll('.opacity')
      let Appear = () => {
        for (let i = 0; i < opacity.length; i++) {
        opacity[i].classList.add('maxOpacity')
        }
      }
      setTimeout(Appear, 300);
  })
  const { title, id, recipes, visibility, gridView } = props;
    return (
      <div className={visibility === 'true' ? 'visible category' : 'invisible category'}>
        <h3 className="opacity">{title}</h3>
        <div className="recipeBox opacity">
          <AddRecipe
            id={id}
            gridView={gridView}
            category={title}
            updateDashboard={props.updateDashboard}
          />
          {
              recipes ? recipes.map((recipe) => {
                return (
                  gridView ? <Square 
                    key={recipe.id} 
                    data={recipe} 
                    rawTitle={recipe.rawTitle}/> : 
                  <ListItem 
                    key={recipe.id} 
                    data={recipe} 
                    title={recipe.title}>
                  </ListItem>
                )
              })
              : null
          }
        </div>
      </div>
    )
}

export default Category;
