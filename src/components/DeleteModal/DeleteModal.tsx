import React from 'react'
import './DeleteModal.scss'
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@material-ui/core'

// const DeleteModal = (props: any) => {
//     const [open, setOpen] = React.useState(props.open)

//     const handleClose = () => {
//         setOpen(false)
//       }
//     return (
//         <Dialog
//             open={open}
//             aria-labelledby="alert-dialog-title"
//             aria-describedby="alert-dialog-description"
//             >
//             <DialogTitle id="alert-dialog-title">{"Are you sure?"}</DialogTitle>
//             <DialogContent>
//                 <DialogContentText>
//                     This action cannot be undone.
//                 </DialogContentText>
//             </DialogContent>
//             <DialogActions>
//                 <Button onClick={handleClose} color="primary">
//                     Cancel
//                 </Button>
//                 <Button onClick={handleClose} color="primary" autoFocus>
//                     Continue
//                 </Button>
//             </DialogActions>
//         </Dialog>
//     )
// }

const DeleteModal = (props: any) => {
  return (
        <div id="deletion-modal">
            <div className="modal-content">
                <h4>Are you sure?</h4>
                <p>This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
                <Button variant="contained" color="primary" className="modal-close">Cancel</Button>
                {/* <a id="primary-color" className="modal-close waves-effect waves-green btn">Cancel</a> */}
                <Button onClick={props.deleteFunction} className="modal-close">Continue</Button>
                {/* <a className="modal-close waves-effect waves btn-flat" onClick={props.deleteFunction}>Continue</a> */}
            </div>
        </div>
  )
}

export default DeleteModal
