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
const lab_1 = require("@mui/lab");
const material_1 = require("@mui/material");
const formik_1 = require("formik");
const react_1 = require("react");
const react_router_1 = require("react-router");
const yup = __importStar(require("yup"));
const ingredients_jpg_1 = __importDefault(require("../images/ingredients.jpg"));
const functions_1 = require("../models/functions");
const auth_service_1 = __importDefault(require("../services/auth-service"));
const user_service_1 = __importDefault(require("../services/user-service"));
const validationSchema = yup.object({
    firstName: yup.string().required('First name is required.'),
    lastName: yup.string().required('Last name is required.'),
    email: yup
        .string()
        .email('Enter a valid email.')
        .required('Email is required.'),
    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters long.')
        .test('is-valid', 'Password must contain at least one capital letter, one lower case letter, and one number.', (value) => (0, functions_1.isPasswordValid)(value))
        .required('Password is required.'),
    confirmPassword: yup
        .string()
        .min(8, 'Password must be at least 8 characters long.')
        .oneOf([yup.ref('password')], "Passwords don't match.")
        .required('Password confirmation is required.'),
});
const Signup = () => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [snackBarOpen, setSnackBarOpen] = (0, react_1.useState)(false);
    const [snackBarMessage, setSnackBarMessage] = (0, react_1.useState)('');
    const navigate = (0, react_router_1.useNavigate)();
    const theme = (0, material_1.useTheme)();
    const openSnackBar = (message) => {
        setSnackBarMessage(message);
        setSnackBarOpen(true);
    };
    const signup = async (values) => {
        setLoading(true);
        try {
            const userInput = {
                firstName: values.firstName,
                lastName: values.lastName,
                password: values.password,
                email: values.email,
            };
            const response = await user_service_1.default.createUser(userInput);
            if (response.success) {
                auth_service_1.default.setUserLoggedIn();
                navigate('/recipes');
            }
            else {
                setLoading(false);
                openSnackBar(response.message);
            }
        }
        catch (err) {
            setLoading(false);
            openSnackBar(err.response.data.error);
        }
    };
    const closeSnackBar = () => {
        setSnackBarMessage('');
        setSnackBarOpen(false);
    };
    const login = () => navigate('/login');
    return ((0, jsx_runtime_1.jsxs)(material_1.Stack, { justifyContent: "center", alignItems: "center", sx: {
            backgroundImage: `url(${ingredients_jpg_1.default})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }, children: [(0, jsx_runtime_1.jsx)(material_1.Stack, { alignItems: "center", justifyContent: "center", textAlign: "center", sx: {
                    height: '100%',
                    background: 'linear-gradient(120deg, rgba(255, 68, 68, 0.826), rgba(221, 114, 68, 0.22))',
                    width: '100%',
                    color: 'white',
                    input: {
                        color: theme.palette.info.main,
                    },
                }, children: (0, jsx_runtime_1.jsx)(material_1.Fade, { children: (0, jsx_runtime_1.jsx)(formik_1.Formik, { initialValues: {
                            firstName: '',
                            lastName: '',
                            email: '',
                            password: '',
                            confirmPassword: '',
                        }, validationSchema: validationSchema, onSubmit: (values) => signup(values), validateOnMount: true, render: (formik) => ((0, jsx_runtime_1.jsx)(formik_1.Form, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                    backgroundColor: theme.palette.gray.main,
                                    boxShadow: `0px 10px 30px ${theme.palette.gray.main}`,
                                    borderRadius: 1,
                                    padding: '40px',
                                    label: {
                                        color: `${theme.palette.info.main}!important`,
                                    },
                                }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", children: "Signup" }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { paddingTop: 2, spacing: 2, paddingBottom: 2, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { name: "firstName", type: "text", variant: "filled", label: "First Name", value: formik.values.firstName, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.touched.firstName &&
                                                    Boolean(formik.errors.firstName), helperText: formik.touched.firstName && formik.errors.firstName }), (0, jsx_runtime_1.jsx)(material_1.TextField, { name: "lastName", type: "text", variant: "filled", label: "Last Name", value: formik.values.lastName, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.touched.lastName &&
                                                    Boolean(formik.errors.lastName), helperText: formik.touched.lastName && formik.errors.lastName }), (0, jsx_runtime_1.jsx)(material_1.TextField, { name: "email", type: "email", variant: "filled", label: "Email", value: formik.values.email, onBlur: formik.handleBlur, onChange: formik.handleChange, error: formik.touched.email && Boolean(formik.errors.email), helperText: formik.touched.email && formik.errors.email }), (0, jsx_runtime_1.jsx)(material_1.TextField, { name: "password", type: "password", variant: "filled", label: "Password", value: formik.values.password, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.touched.password &&
                                                    Boolean(formik.errors.password), helperText: formik.touched.password && formik.errors.password }), (0, jsx_runtime_1.jsx)(material_1.TextField, { name: "confirmPassword", type: "password", variant: "filled", label: "Confirm Password", value: formik.values.confirmPassword, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.touched.confirmPassword &&
                                                    Boolean(formik.errors.confirmPassword), helperText: formik.touched.confirmPassword &&
                                                    formik.errors.confirmPassword })] }), (0, jsx_runtime_1.jsx)(lab_1.LoadingButton, { color: "secondary", disabled: !formik.isValid, type: "submit", loading: loading, variant: "contained", children: "Create Account" }), (0, jsx_runtime_1.jsxs)(material_1.Typography, { variant: "body1", marginTop: 3, children: ["Already have an account?", ' ', (0, jsx_runtime_1.jsx)(material_1.Link, { style: { cursor: 'pointer' }, onClick: login, children: "Log in." })] })] }) })) }) }) }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackBarOpen, anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                }, onClose: closeSnackBar, autoHideDuration: 4000, message: snackBarMessage }, 'bottom' + 'center')] }));
};
exports.default = Signup;
//# sourceMappingURL=Signup.js.map