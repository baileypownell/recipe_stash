import React, { useEffect } from 'react';
import AddRecipe from './AddRecipe/AddRecipe';
import Square from './Square/Square';

const Category = (props) => {
  useEffect(() => {
      let opacity = document.querySelectorAll('.opacity');
      let Appear = () => {
        for (let i = 0; i < opacity.length; i++) {
        opacity[i].classList.add('maxOpacity');
        }
      }
      setTimeout(Appear, 300);
  })
  const { title, id, recipes } = props;
    return (
      <>
        <h3 className="opacity">{title}</h3>
        <div className="recipeBox opacity">
          <AddRecipe
            id={id}
            category={title}
            updateDashboard={props.updateDashboard}
          />
          {
              recipes ? recipes.map((recipe) => {
              return (
                <Square key={recipe.id} data={recipe} title={recipe.title}/>
              )
              })
          : null}
        </div>
      </>
    )
}

export default Category;
