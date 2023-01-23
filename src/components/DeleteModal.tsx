import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useEffect, useState } from 'react';

type DeleteModalProps = {
  isOpen: boolean;
  deleteFunction: () => void;
  closeModal: Function;
};

const DeleteModal = ({
  isOpen,
  deleteFunction,
  closeModal,
}: DeleteModalProps) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => closeModal();

  useEffect(() => {
    setOpen(isOpen);
  });

  return open ? (
    <Dialog
      open={true}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{'Are you sure?'}</DialogTitle>
      <DialogContent>
        <DialogContentText>This action cannot be undone.</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="contained">
          Cancel
        </Button>
        <Button
          onClick={deleteFunction}
          color="primary"
          variant="outlined"
          autoFocus
        >
          Continue
        </Button>
      </DialogActions>
    </Dialog>
  ) : null;
};

export default DeleteModal;
