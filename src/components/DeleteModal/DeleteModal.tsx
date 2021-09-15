import React, { useEffect } from 'react'
import './DeleteModal.scss'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core'

const DeleteModal = (props: {
  open: boolean,
  deleteFunction: Function,
  closeModal: Function
}) => {
  const [open, setOpen] = React.useState(false)

  const handleClose = () => props.closeModal()

  useEffect(() => {
    setOpen(props.open)
  })

  return (
    open
      ? <Dialog
            open={true}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            >
            <DialogTitle id="alert-dialog-title">{'Are you sure?'}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    This action cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
                </Button>
                <Button onClick={handleClose} color="primary" autoFocus>
                    Continue
                </Button>
            </DialogActions>
        </Dialog>
      : null
  )
}

export default DeleteModal
