"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_1 = require("react");
const DeleteModal = ({ isOpen, deleteFunction, closeModal, }) => {
    const [open, setOpen] = (0, react_1.useState)(false);
    const handleClose = () => closeModal();
    (0, react_1.useEffect)(() => {
        setOpen(isOpen);
    });
    return open ? ((0, jsx_runtime_1.jsxs)(material_1.Dialog, { open: true, "aria-labelledby": "alert-dialog-title", "aria-describedby": "alert-dialog-description", children: [(0, jsx_runtime_1.jsx)(material_1.DialogTitle, { id: "alert-dialog-title", children: 'Are you sure?' }), (0, jsx_runtime_1.jsx)(material_1.DialogContent, { children: (0, jsx_runtime_1.jsx)(material_1.DialogContentText, { children: "This action cannot be undone." }) }), (0, jsx_runtime_1.jsxs)(material_1.DialogActions, { children: [(0, jsx_runtime_1.jsx)(material_1.Button, { onClick: handleClose, color: "primary", variant: "contained", children: "Cancel" }), (0, jsx_runtime_1.jsx)(material_1.Button, { onClick: deleteFunction, color: "primary", variant: "outlined", autoFocus: true, children: "Continue" })] })] })) : null;
};
exports.default = DeleteModal;
//# sourceMappingURL=DeleteModal.js.map