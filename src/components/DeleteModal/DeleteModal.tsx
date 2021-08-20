import React from 'react'
import './DeleteModal.scss'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core'

const DeleteModal = (props: any) => {
    const [open, setOpen] = React.useState(props.open)

    const handleClose = () => {
        setOpen(false)
      }
    return (
        <Dialog
            open={open}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            >
            <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
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
    )
}

export default DeleteModal