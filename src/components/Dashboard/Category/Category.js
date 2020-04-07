import React from 'react';

import Square from './Square/Square';

const Category = (props) => {
    return (
      <>
        <h3>{props.title}</h3>
        <div className="recipeBox">
          <div className="addRecipe" id={props.id} >
            <i className="fas fa-plus-circle"></i>
          </div>
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
