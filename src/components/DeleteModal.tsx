import {
  Modal,
  Text,
  Group,
  Button,
} from '@mantine/core';
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
    <Modal
      opened={true}
      onClose={handleClose}
      title="Are you sure you want to delete your account?"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <Text fw={700}>This action cannot be undone.</Text>
      <Group
        justify="flex-end"
        pt="xl"
      >
        <Button onClick={handleClose} variant="default">
          Cancel
        </Button>
        <Button
          onClick={deleteFunction}
          color="red"
          variant="filled"
          autoFocus
        >
          Delete Account
        </Button>
      </Group>
    </Modal>
  ) : null;
};

export default DeleteModal;
