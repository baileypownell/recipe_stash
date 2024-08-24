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
const LoadingButton_1 = __importDefault(require("@mui/lab/LoadingButton"));
const material_1 = require("@mui/material");
const formik_1 = require("formik");
const react_1 = require("react");
const react_router_1 = require("react-router");
const yup = __importStar(require("yup"));
const PersonAddAltRounded_1 = __importDefault(require("@mui/icons-material/PersonAddAltRounded"));
const ingredients_jpg_1 = __importDefault(require("../images/ingredients.jpg"));
const auth_service_1 = __importDefault(require("../services/auth-service"));
const validationSchema = yup.object({
    email: yup
        .string()
        .email('Enter a valid email.')
        .required('Email is required.'),
    password: yup.string().required('Password is required.'),
});
const Login = () => {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [signInError, setSignInError] = (0, react_1.useState)(false);
    const [snackBarOpen, setSnackBarOpen] = (0, react_1.useState)(false);
    const [snackBarMessage, setSnackBarMessage] = (0, react_1.useState)('');
    const navigate = (0, react_router_1.useNavigate)();
    const theme = (0, material_1.useTheme)();
    const openSnackBar = (message) => {
        setSnackBarOpen(true);
        setSnackBarMessage(message);
    };
    const closeSnackBar = () => {
        setSnackBarOpen(false);
        setSnackBarMessage('');
    };
    const sendPasswordResetLink = async (email) => {
        try {
            const res = await auth_service_1.default.getPasswordResetLink(email);
            res.data.success
                ? openSnackBar('Check the provided email for a link to reset your password.')
                : openSnackBar('There was an error.');
        }
        catch (err) {
            console.log(err);
            openSnackBar('There was an error.');
        }
    };
    const authenticateWithGoogle = async (response) => {
        try {
            const res = await auth_service_1.default.signInWithGoogle(response.credential);
            if (res.data.success) {
                auth_service_1.default.setUserLoggedIn();
                navigate('/recipes');
            }
            else {
                openSnackBar(res.data.message);
                setSignInError(true);
            }
        }
        catch (err) {
            console.log(err);
            openSnackBar(err.data ? err.data.message : 'Could not authenticate.');
            setSignInError(true);
        }
    };
    const signin = async (data) => {
        setLoading(true);
        try {
            const res = await auth_service_1.default.signIn(data.password, data.email);
            if (res.data?.success) {
                auth_service_1.default.setUserLoggedIn();
                navigate('/recipes');
            }
            else {
                setLoading(false);
                setSignInError(true);
                openSnackBar(res.data.message);
            }
        }
        catch (err) {
            console.log(err);
            openSnackBar(err.response.data?.error || 'There was an error.');
            setSignInError(true);
            setLoading(false);
        }
    };
    (0, react_1.useEffect)(() => {
        window.google.accounts.id.initialize({
            client_id: `${process.env.GOOGLE_LOGIN_CLIENT_ID}`,
            callback: authenticateWithGoogle,
        });
        window.google.accounts.id.renderButton(document.getElementById('google-button-anchor'), { theme: 'outline', size: 'large' });
        window.google.accounts.id.prompt();
    }, []);
    return ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Stack, { justifyContent: "center", alignItems: "center", sx: {
                    backgroundImage: `url(${ingredients_jpg_1.default})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    label: {
                        color: theme.palette.primary.main,
                    },
                }, children: (0, jsx_runtime_1.jsx)(material_1.Stack, { alignItems: "center", justifyContent: "center", textAlign: "center", height: "100%", width: "100%", color: "white", sx: {
                        background: 'linear-gradient(120deg, rgba(255, 68, 68, 0.826), rgba(221, 114, 68, 0.22))',
                    }, children: (0, jsx_runtime_1.jsx)(material_1.Fade, { children: (0, jsx_runtime_1.jsx)(formik_1.Formik, { initialValues: {
                                email: '',
                                password: '',
                            }, validationSchema: validationSchema, validateOnMount: true, onSubmit: (values) => signin(values), render: (formik) => ((0, jsx_runtime_1.jsx)(formik_1.Form, { children: (0, jsx_runtime_1.jsxs)(material_1.Box, { sx: {
                                        backgroundColor: theme.palette.gray.main,
                                        boxShadow: `0px 10px 30px ${theme.palette.gray.main}`,
                                        borderRadius: 1,
                                        padding: '40px',
                                    }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h4", children: "Login" }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { paddingTop: 2, spacing: 2, paddingBottom: 2, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { label: "Email", variant: "filled", value: formik.values.email, onChange: formik.handleChange, error: formik.touched.email && Boolean(formik.errors.email), helperText: formik.touched.email && formik.errors.email, onBlur: formik.handleBlur, type: "email", name: "email" }), (0, jsx_runtime_1.jsx)(material_1.TextField, { value: formik.values.password, variant: "filled", onChange: formik.handleChange, error: formik.touched.password &&
                                                        Boolean(formik.errors.password), helperText: formik.touched.password && formik.errors.password, onBlur: formik.handleBlur, type: "password", label: "Password", name: "password" })] }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { direction: "column", spacing: 2, children: [(0, jsx_runtime_1.jsx)(LoadingButton_1.default, { color: "secondary", disabled: !formik.isValid, type: "submit", loading: loading, variant: "outlined", children: "Login" }), (0, jsx_runtime_1.jsx)(material_1.Stack, { justifyContent: "center", alignItems: "center", marginTop: 2, marginBottom: 2, children: (0, jsx_runtime_1.jsx)("div", { id: "google-button-anchor" }) }), signInError ? ((0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", onClick: () => sendPasswordResetLink(formik.values.email), color: "primary", disabled: formik.touched.email && Boolean(formik.errors.email), children: "Reset Password" })) : null] }), (0, jsx_runtime_1.jsx)(material_1.Divider, { sx: { backgroundColor: 'white', marginTop: 2 } }), (0, jsx_runtime_1.jsxs)(material_1.Stack, { spacing: 1, marginTop: 1, alignItems: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { children: "Don't have an account?" }), (0, jsx_runtime_1.jsx)(material_1.Button, { startIcon: (0, jsx_runtime_1.jsx)(PersonAddAltRounded_1.default, {}), onClick: () => navigate('/signup'), children: "Sign up" })] })] }) })) }) }) }) }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackBarOpen, anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                }, onClose: closeSnackBar, autoHideDuration: 3000, message: snackBarMessage }, 'bottom' + 'center')] }));
};
exports.default = Login;
//# sourceMappingURL=Login.js.map