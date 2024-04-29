"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const material_1 = require("@mui/material");
const react_1 = require("react");
const react_router_1 = require("react-router");
const mobile_dashboard_png_1 = __importDefault(require("../images/mobile_dashboard.png"));
const white_text_transparent_svg_1 = __importDefault(require("../images/white-text-transparent.svg"));
const cutting_vegetables_jpg_1 = __importDefault(require("../images/cutting_vegetables.jpg"));
const DoubleArrowRounded_1 = __importDefault(require("@mui/icons-material/DoubleArrowRounded"));
const Home = () => {
    const [visible, setVisible] = (0, react_1.useState)(false);
    const navigate = (0, react_router_1.useNavigate)();
    const theme = (0, material_1.useTheme)();
    (0, react_1.useEffect)(() => {
        setTimeout(() => setVisible(true), 500);
    }, []);
    return ((0, jsx_runtime_1.jsx)(material_1.Box, { sx: {
            backgroundImage: `url(${cutting_vegetables_jpg_1.default})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { paddingTop: "30px", paddingBottom: "30px", alignItems: "center", justifyContent: "center", sx: {
                height: '100%',
                background: 'linear-gradient(120deg, rgba(230, 108, 108, 0.29), rgba(221, 114, 68, 0.42))',
            }, children: [(0, jsx_runtime_1.jsx)(material_1.Stack, { sx: {
                        img: {
                            height: '50px',
                            [theme.breakpoints.up('lg')]: {
                                height: '75px',
                            },
                        },
                    }, children: (0, jsx_runtime_1.jsx)("img", { src: white_text_transparent_svg_1.default, alt: "Woman chopping greens on a cutting board" }) }), (0, jsx_runtime_1.jsx)(material_1.Fade, { in: visible, children: (0, jsx_runtime_1.jsxs)(material_1.Stack, { alignItems: "center", children: [(0, jsx_runtime_1.jsxs)(material_1.Box, { textAlign: "center", sx: {
                                    color: theme.palette.info.main,
                                }, children: [(0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "All of your recipes." }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "All in one place." }), (0, jsx_runtime_1.jsx)(material_1.Typography, { variant: "h6", children: "And it's free." })] }), (0, jsx_runtime_1.jsx)(material_1.Box, { margin: 2, sx: {
                                    width: '200px',
                                    img: {
                                        width: '100%',
                                    },
                                }, children: (0, jsx_runtime_1.jsx)("img", { src: mobile_dashboard_png_1.default, alt: "whisk" }) }), (0, jsx_runtime_1.jsx)(material_1.Button, { variant: "contained", color: "secondary", onClick: () => navigate('/recipes'), startIcon: (0, jsx_runtime_1.jsx)(DoubleArrowRounded_1.default, {}), children: "Get Started" })] }) })] }) }));
};
exports.default = Home;
//# sourceMappingURL=Home.js.map