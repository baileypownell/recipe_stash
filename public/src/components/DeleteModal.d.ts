/// <reference types="react" />
type DeleteModalProps = {
    isOpen: boolean;
    deleteFunction: () => void;
    closeModal: Function;
};
declare const DeleteModal: ({ isOpen, deleteFunction, closeModal, }: DeleteModalProps) => JSX.Element | null;
export default DeleteModal;
