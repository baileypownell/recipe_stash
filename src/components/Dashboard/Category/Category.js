import React from 'react';


const Category = (props) => {
  let recipes = props.recipes;
  return (
    <>
      <h3>{props.title}</h3>
      <div className="recipeBox">
        <div className="addRecipe" id={props.id} >
          <i className="fas fa-plus-circle"></i>
        </div>
        {
            props.recipes.map((recipe) => {
            return  <div className="recipeCard">
                <h3>{recipe.title}</h3>
              </div>
            })
        }
      </div>
    </>
  )
}

export default Category;
