import { Box, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
import './ListItem.scss'

interface Props {
  recipeId: string
  key: string
  rawTitle: string
}

const ListItem = (props: Props) => {
  const navigate = useNavigate()
  const viewRecipe = () => {
    navigate(`/recipes/${props.recipeId}`)
  }

  const { key, rawTitle } = props
  return (
    <Box
      className="list-item hoverable"
      key={key}
      onClick={viewRecipe}
    >
      <Typography variant="body1">{rawTitle}</Typography>
    </Box>
  )
}

export default ListItem
