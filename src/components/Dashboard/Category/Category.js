import React from 'react';
import AddRecipe from './AddRecipe/AddRecipe';
import Square from './Square/Square';

const Category = (props) => {
  const { title, id, recipes } = props;
    return (
      <>
        <h3>{title}</h3>
        <div className="recipeBox">
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
