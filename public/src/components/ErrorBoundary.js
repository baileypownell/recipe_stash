"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const BlenderRounded_1 = __importDefault(require("@mui/icons-material/BlenderRounded"));
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_router_dom_1 = require("react-router-dom");
const withNavigate = (Component) => (props) => {
    const navigate = (0, react_router_dom_1.useNavigate)();
    const goHome = () => {
        navigate('/');
        navigate(0);
    };
    return (0, jsx_runtime_1.jsx)(Component, { ...props, navigate: goHome });
};
class ErrorBoundary extends react_1.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    componentDidCatch() {
        this.setState({ hasError: true });
    }
    render() {
        if (this.state.hasError) {
            return ((0, jsx_runtime_1.jsxs)(material_1.Stack, { alignItems: "center", justifyContent: "center", textAlign: "center", children: [(0, jsx_runtime_1.jsx)(material_1.Box, { marginBottom: 3, sx: {
                            svg: {
                                fontSize: '125px',
                                color: '#353531',
                            },
                        }, children: (0, jsx_runtime_1.jsx)(BlenderRounded_1.default, {}) }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h5", children: "Something went wrong." }), (0, jsx_runtime_1.jsx)(material_1.Divider, {}), (0, jsx_runtime_1.jsx)(material_1.Box, { padding: 3, children: (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "outlined", color: "secondary", onClick: this.props.navigate, children: "Home" }) })] }));
        }
        return this.props.children;
    }
}
exports.default = withNavigate(ErrorBoundary);
//# sourceMappingURL=ErrorBoundary.js.map