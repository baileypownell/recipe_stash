import React from 'react';
import AddRecipe from './AddRecipe/AddRecipe';
import Square from './Square/Square';

const Category = (props) => {
    return (
      <>
        <h3>{props.title}</h3>
        <div className="recipeBox">
          <AddRecipe
            id={props.id}
            category={props.title}
            updateDashboard={props.updateDashboard}
          />
          {
              props.recipes.map((recipe) => {
              return (
                <Square key={recipe.id} data={recipe} title={recipe.title}/>
              )
              })
          }
        </div>
      </>
    )
}

export default Category;
