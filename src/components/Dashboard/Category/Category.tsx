import { Box, Typography } from '@mui/material'
import { FullRecipe } from '../../../../server/recipe'
import { GridView } from '../Dashboard'
import ListItem from './ListItem/ListItem'
import RecipeDialog, { Mode } from './RecipeDialog/RecipeDialog'
import Square from './Square/Square'

type Props = {
  title: string
  id: string
  recipes: FullRecipe[]
  gridView: GridView
  addRecipe: Function
  children: any
}

const Category = ({
  title,
  id,
  recipes,
  gridView,
  addRecipe,
}: Props) => (
  <Box className="category">
    <Typography variant="h6" sx={{ marginBottom: 1 }}>{title}</Typography>
    <Box className="recipeBox">
      <RecipeDialog
        mode={Mode.Add}
        recipeDialogInfo={{
          id,
          gridView,
          category: title,
          addRecipe: addRecipe
        }}
      />
      { recipes ? recipes.map((recipe) => ( gridView === GridView.Grid ? 
        <Square
          key={recipe.id}
          awsUrl={recipe.preSignedDefaultTileImageUrl}
          recipeId={recipe.id}
          rawTitle={recipe.rawTitle}/>
        : <ListItem
            key={recipe.id}
            recipeId={recipe.id}
            rawTitle={recipe.rawTitle} />
        )) : null }
    </Box>
  </Box>
)

export default Category
