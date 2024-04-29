"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const AccountCircleRounded_1 = __importDefault(require("@mui/icons-material/AccountCircleRounded"));
const DeleteRounded_1 = __importDefault(require("@mui/icons-material/DeleteRounded"));
const EmailRounded_1 = __importDefault(require("@mui/icons-material/EmailRounded"));
const ExpandMore_1 = __importDefault(require("@mui/icons-material/ExpandMore"));
const PersonRounded_1 = __importDefault(require("@mui/icons-material/PersonRounded"));
const SecurityRounded_1 = __importDefault(require("@mui/icons-material/SecurityRounded"));
const material_1 = require("@mui/material");
const formik_1 = require("formik");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const yup = __importStar(require("yup"));
const functions_1 = require("../models/functions");
const auth_service_1 = __importDefault(require("../services/auth-service"));
const user_service_1 = __importDefault(require("../services/user-service"));
const DeleteModal_1 = __importDefault(require("./DeleteModal"));
const validationSchema = yup.object({
    email: yup.object({
        email: yup
            .string()
            .required('Email is required.')
            .email('Enter a valid email.'),
        password: yup
            .string()
            .min(8, 'Password must be at least 8 characters long.')
            .test('is-valid', 'Password must contain at least one capital letter, one lower case letter, and one number.', (value) => (0, functions_1.isPasswordValid)(value))
            .required('Password is required.'),
    }),
    names: yup.object({
        firstName: yup.string(),
        lastName: yup.string(),
    }),
});
const Settings = (props) => {
    const [snackBarOpen, setSnackBarOpen] = (0, react_1.useState)(false);
    const [snackBarMessage, setSnackBarMessage] = (0, react_1.useState)('');
    const [deleteModalOpen, setDeleteModalOpen] = (0, react_1.useState)(false);
    const [user, setUser] = (0, react_1.useState)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const theme = (0, material_1.useTheme)();
    const openSnackBar = (message) => {
        setSnackBarOpen(true);
        setSnackBarMessage(message);
    };
    const getUserData = async () => {
        try {
            const user = await user_service_1.default.getUser();
            setUser(user);
        }
        catch (err) {
            console.log(err);
        }
    };
    const logout = async () => {
        try {
            await auth_service_1.default.logout();
            auth_service_1.default.setUserLoggedOut();
            navigate('/');
        }
        catch (err) {
            console.log(err);
        }
    };
    (0, react_1.useEffect)(() => {
        getUserData();
    }, []);
    const updateNames = async (values) => {
        if (!values.names.firstName && !values.names.lastName) {
            openSnackBar('Must enter either first name or last name.');
            return;
        }
        const { id } = props;
        try {
            const payload = {
                firstName: values.names.firstName || user.firstName,
                lastName: values.names.lastName || user.lastName,
                id: id,
            };
            await user_service_1.default.updateUser(payload);
            openSnackBar('Profile updated successfully.');
            getUserData();
        }
        catch (err) {
            console.log(err);
        }
    };
    const updateEmail = async (values) => {
        try {
            const payload = {
                newEmail: values.email.email,
                password: values.email.password,
            };
            const res = await user_service_1.default.updateUser(payload);
            if (res.data.success) {
                openSnackBar(res.data.message);
                getUserData();
            }
            else {
                openSnackBar('Invalid email.');
            }
        }
        catch (err) {
            console.log(err);
            openSnackBar('There was an error.');
        }
    };
    const deleteAccount = async () => {
        try {
            await user_service_1.default.deleteUser();
            openSnackBar('Account deleted.');
            logout();
        }
        catch (err) {
            console.log(err);
            openSnackBar('There was an error.');
        }
    };
    const updatePassword = async () => {
        try {
            const res = await auth_service_1.default.getPasswordResetLink(user.email);
            setSnackBarOpen(res.data.message);
            if (res.data.success) {
                logout();
            }
        }
        catch (err) {
            console.log(err);
            openSnackBar('There was an error.');
        }
    };
    const openDeleteModal = () => {
        setDeleteModalOpen(true);
    };
    const closeSnackBar = () => {
        setSnackBarOpen(false);
        setSnackBarMessage('');
    };
    if (!user) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)(material_1.Fade, { children: (0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { width: "90%", sx: {
                            [theme.breakpoints.up('md')]: {
                                width: '50%',
                            },
                            [theme.breakpoints.up('lg')]: {
                                width: '35%',
                            },
                        }, margin: `0 auto`, padding: "4vh 0", children: [(0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", paddingBottom: "10px", children: [(0, jsx_runtime_1.jsx)(AccountCircleRounded_1.default, { sx: {
                                            fontSize: '60px',
                                            paddingRight: '15px',
                                        } }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { children: [(0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "h6", children: [user?.firstName, " ", user?.lastName] }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body2", children: user?.email })] })] }), (0, jsx_runtime_1.jsx)(formik_1.Formik, { initialValues: {
                                    email: {
                                        email: '',
                                        password: '',
                                    },
                                    names: {
                                        firstName: user?.firstName,
                                        lastName: user?.lastName,
                                    },
                                }, validationSchema: validationSchema, onSubmit: () => void 0, render: (formik) => ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)(material_1.Accordion, { children: [(0, jsx_runtime_1.jsx)(material_1.AccordionSummary, { expandIcon: (0, jsx_runtime_1.jsx)(ExpandMore_1.default, {}), children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", alignItems: "center", children: [(0, jsx_runtime_1.jsx)(EmailRounded_1.default, {}), (0, jsx_runtime_1.jsx)(material_1.Typography, { marginLeft: 1, children: "Update Email" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.AccordionDetails, { children: [(0, jsx_runtime_1.jsxs)(material_1.Stack, { marginBottom: 2, spacing: 2, children: [(0, jsx_runtime_1.jsx)(formik_1.Field, { name: "email.email", render: ({ form }) => ((0, jsx_runtime_1.jsx)(material_1.TextField, { id: "email", variant: "standard", name: "email.email", type: "email", label: "New Email", onChange: formik.handleChange, onBlur: formik.handleBlur, error: form.touched.email?.email &&
                                                                            Boolean(form.errors.email?.email), helperText: form.touched.email?.email &&
                                                                            form.errors.email?.email })) }), (0, jsx_runtime_1.jsx)(formik_1.Field, { name: "email.password", render: ({ form }) => ((0, jsx_runtime_1.jsx)(material_1.TextField, { id: "password", variant: "standard", type: "password", name: "email.password", label: "Password", onChange: formik.handleChange, onBlur: formik.handleBlur, error: form.touched.email?.password &&
                                                                            Boolean(form.errors.email?.password), helperText: form.touched.email?.password &&
                                                                            form.errors.email?.password })) })] }), (0, jsx_runtime_1.jsx)(material_1.Button, { color: "secondary", onClick: () => updateEmail(formik.values), variant: "contained", children: "Save" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Accordion, { children: [(0, jsx_runtime_1.jsx)(material_1.AccordionSummary, { expandIcon: (0, jsx_runtime_1.jsx)(ExpandMore_1.default, {}), children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", alignItems: "center", children: [(0, jsx_runtime_1.jsx)(PersonRounded_1.default, {}), (0, jsx_runtime_1.jsx)(material_1.Typography, { marginLeft: 1, children: "Update Name" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.AccordionDetails, { children: [(0, jsx_runtime_1.jsxs)(material_1.Stack, { marginBottom: 2, spacing: 2, children: [(0, jsx_runtime_1.jsx)(formik_1.Field, { name: "names.firstName", render: ({ form }) => ((0, jsx_runtime_1.jsx)(material_1.TextField, { variant: "standard", name: "names.firstName", label: "New First Name", type: "text", id: "firstName", value: formik.values.names.firstName, onChange: formik.handleChange, onBlur: formik.handleBlur, error: form.touched.names?.firstName &&
                                                                            Boolean(form.errors.names?.firstName), helperText: form.touched.names?.firstName &&
                                                                            form.errors.names?.firstName })) }), (0, jsx_runtime_1.jsx)(formik_1.Field, { name: "names.lastName", render: ({ form }) => ((0, jsx_runtime_1.jsx)(material_1.TextField, { variant: "standard", name: "names.lastName", label: "New Last Name", id: "lastName", type: "text", value: formik.values.names.lastName, onChange: formik.handleChange, onBlur: formik.handleBlur, error: form.touched.names?.lastName &&
                                                                            Boolean(form.errors.names?.lastName), helperText: form.touched.names?.lastName &&
                                                                            form.errors.names?.lastName })) })] }), (0, jsx_runtime_1.jsx)(material_1.Button, { color: "secondary", onClick: () => updateNames(formik.values), variant: "contained", children: "Save" })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Accordion, { children: [(0, jsx_runtime_1.jsx)(material_1.AccordionSummary, { expandIcon: (0, jsx_runtime_1.jsx)(ExpandMore_1.default, {}), children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", alignItems: "center", children: [(0, jsx_runtime_1.jsx)(SecurityRounded_1.default, {}), (0, jsx_runtime_1.jsx)(material_1.Typography, { marginLeft: 1, children: "Update Password" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.AccordionDetails, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", paddingBottom: 1, children: "Click the button below to receive an email with a link to reset your password." }), (0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { color: "secondary", onClick: updatePassword, variant: "contained", children: "Send Email" }) })] })] }), (0, jsx_runtime_1.jsxs)(material_1.Accordion, { children: [(0, jsx_runtime_1.jsx)(material_1.AccordionSummary, { expandIcon: (0, jsx_runtime_1.jsx)(ExpandMore_1.default, {}), children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "row", alignItems: "center", children: [(0, jsx_runtime_1.jsx)(DeleteRounded_1.default, {}), (0, jsx_runtime_1.jsx)(material_1.Typography, { marginLeft: 1, children: "Delete Account" })] }) }), (0, jsx_runtime_1.jsxs)(material_1.AccordionDetails, { children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "body1", paddingBottom: 2, children: "If you are sure you want to delete your account, click the button below." }), (0, jsx_runtime_1.jsx)(material_1.Divider, { light: true }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", paddingTop: 2, paddingBottom: 4, children: ["This action", (0, jsx_runtime_1.jsx)("span", { style: {
                                                                        fontWeight: 'bold',
                                                                        fontStyle: 'italic',
                                                                        marginLeft: '2px',
                                                                    }, children: "cannot" }), ' ', "be undone."] }), (0, jsx_runtime_1.jsx)(material_1.Box, { children: (0, jsx_runtime_1.jsx)(material_1.Button, { color: "primary", onClick: openDeleteModal, variant: "contained", startIcon: (0, jsx_runtime_1.jsx)(DeleteRounded_1.default, {}), children: "Delete Account" }) })] })] })] })) })] }) }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackBarOpen, anchorOrigin: {
                        vertical: 'bottom',
                        horizontal: 'center',
                    }, onClose: closeSnackBar, autoHideDuration: 3000, message: snackBarMessage }, 'bottom' + 'center'), (0, jsx_runtime_1.jsx)(DeleteModal_1.default, { isOpen: deleteModalOpen, deleteFunction: deleteAccount, closeModal: () => setDeleteModalOpen(false) })] }) }));
};
exports.default = Settings;
//# sourceMappingURL=Settings.js.map