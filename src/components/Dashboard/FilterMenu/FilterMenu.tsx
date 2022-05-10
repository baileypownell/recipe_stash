import React from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { Checkbox, Divider } from '@material-ui/core'
import './FilterMenu.scss'

export default function FilterMenu (props: {
    numberOfSelectedFilters: number,
    filters: any[],
    categories: any[],
    appliedFilt: any,
    appliedCat: any,
    filter: Function,
    filterByCategory: Function
}) {
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  return (
    <div>
      <Button id="filter-button" aria-controls="menu" aria-haspopup="true" onClick={handleClick}>
        <span style={{ marginRight: '35px' }}>Filter</span>
        <span style={{ marginLeft: '5px' }}>{
          props.numberOfSelectedFilters > 0
            ? `(${props.numberOfSelectedFilters})`
            : <i className="small material-icons" id="filter-icon">filter_list</i>
        }</span>
      </Button>
      <Menu
        id="menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
          <div id="menu">
            <div><p style={{ fontWeight: 'bold' }}>Features</p><i className="fas fa-filter"></i></div>
            <Divider />
                {props.filters.map((item, index) => {
                  return (
                    <MenuItem
                        key={index}
                        onClick={() => props.filter(item.key)}>
                        <div className="option">
                            <span>{item.name}</span>
                            <Checkbox
                                checked={props.appliedFilt[item.key]}
                                id={item.key}
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                        </div>
                    </MenuItem>
                  )
                })}
            <div><p style={{ fontWeight: 'bold' }}>Categories</p><i className="fas fa-filter"></i></div>
            <Divider />
                {props.categories.map((item, index) => {
                  return (
                    <MenuItem
                        key={index}
                        onClick={() => props.filterByCategory(item.key)}>
                        <div className="option">
                            <span>{item.name}</span>
                            <Checkbox
                                checked={props.appliedCat[item.key]}
                                id={item.key}
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                        </div>
                    </MenuItem>
                  )
                })}
          </div>
      </Menu>
    </div>
  )
}
