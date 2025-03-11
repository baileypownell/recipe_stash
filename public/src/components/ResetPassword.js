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
const material_1 = require("@mui/material");
const formik_1 = require("formik");
const react_1 = require("react");
const react_router_1 = require("react-router");
const yup = __importStar(require("yup"));
const functions_1 = require("../models/functions");
const auth_service_1 = __importDefault(require("../services/auth-service"));
const validationSchema = yup.object({
    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters long.')
        .test('is-valid', 'Password must contain at least one capital letter, one lower case letter, and one number.', (value) => (0, functions_1.isPasswordValid)(value))
        .required('Password is required.'),
});
const ResetPassword = () => {
    const [invalidLink, setInvalidLink] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [snackBarOpen, setSnackBarOpen] = (0, react_1.useState)(false);
    const [snackBarMessage, setSnackBarMessage] = (0, react_1.useState)('');
    const [email, setUserEmail] = (0, react_1.useState)('');
    const navigate = (0, react_router_1.useNavigate)();
    const { token } = (0, react_router_1.useParams)();
    const verifyToken = async () => {
        try {
            const res = await auth_service_1.default.verifyEmailResetToken(token);
            if (!res.data.success) {
                setInvalidLink(true);
            }
            else {
                setInvalidLink(false);
                setUserEmail(res.data.user_email);
            }
        }
        catch (err) {
            setInvalidLink(true);
            console.log(err);
        }
    };
    (0, react_1.useEffect)(() => {
        verifyToken();
    }, []);
    const goHome = () => {
        navigate('/');
    };
    const openSnackBar = (message) => {
        setSnackBarOpen(true);
        setSnackBarMessage(message);
    };
    const closeSnackBar = () => {
        setSnackBarOpen(false);
        setSnackBarMessage('');
    };
    const updatePassword = async (values) => {
        setLoading(true);
        try {
            await auth_service_1.default.updatePassword(values.password, token, email);
            openSnackBar('Password updated! Redirecting...');
            setLoading(false);
            navigate('/recipes');
        }
        catch (err) {
            openSnackBar('There was an error.');
            setLoading(false);
        }
    };
    return invalidLink ? ((0, jsx_runtime_1.jsxs)(material_1.Box, { margin: "0 auto", textAlign: "center", paddingTop: "10vh", children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { marginBottom: "15px", textAlign: "center", variant: "body1", children: "The link is invalid or expired." }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", onClick: goHome, color: "secondary", type: "submit", children: "Home" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)(material_1.Box, { width: "80%", margin: "0 auto", textAlign: "center", paddingTop: "10vh", children: (0, jsx_runtime_1.jsx)(formik_1.Formik, { initialValues: {
                        password: '',
                    }, validationSchema: validationSchema, validateOnMount: true, onSubmit: (values) => updatePassword(values), render: (formik) => ((0, jsx_runtime_1.jsx)(formik_1.Form, { children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { maxWidth: "400px", margin: "0 auto", spacing: 2, children: [(0, jsx_runtime_1.jsx)(material_1.TextField, { variant: "standard", type: "password", name: "password", required: true, label: "New Password", value: formik.values.password, onChange: formik.handleChange, onBlur: formik.handleBlur, error: formik.touched.password && Boolean(formik.errors.password), helperText: formik.touched.password && formik.errors.password }), (0, jsx_runtime_1.jsx)(material_1.Button, { sx: { margintop: '10px' }, disabled: !formik.isValid, variant: "contained", color: "secondary", type: "submit", loading: loading, children: "Submit" })] }) })) }) }), (0, jsx_runtime_1.jsx)(material_1.Snackbar, { open: snackBarOpen, anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                }, onClose: closeSnackBar, autoHideDuration: 4000, message: snackBarMessage }, 'bottom' + 'center')] }));
};
exports.default = ResetPassword;
//# sourceMappingURL=ResetPassword.js.map