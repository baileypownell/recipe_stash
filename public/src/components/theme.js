"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = exports.getForm = exports.getChip = void 0;
const material_1 = require("@mui/material");
const base = (0, material_1.createTheme)({
    palette: {
        primary: {
            main: '#e86054',
            dark: '#ab3f35',
            light: '#fa7569',
        },
        secondary: {
            main: '#4a4a48',
            contrastText: '#fff',
        },
        error: {
            main: '#dd7244',
            dark: '#c23c3c',
        },
        info: {
            main: '#f7f7f7',
            contrastText: '#353531',
        },
        gray: {
            main: '#353531',
        },
        orange: {
            main: '#dd7244',
        },
        boxShadow: {
            main: '#868686',
        },
    },
});
const getAppBar = (theme) => ({
    components: {
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: theme.palette.gray.main,
                    position: 'sticky',
                },
            },
        },
    },
});
const getList = (theme) => ({
    components: {
        MuiList: {
            styleOverrides: {
                root: {
                    color: theme.palette.gray.main,
                    svg: {
                        color: theme.palette.gray.main,
                    },
                },
            },
        },
    },
});
const getChip = () => ({
    components: {
        MuiChip: {
            defaultProps: {
                variant: 'filled',
                color: 'primary',
            },
            styleOverrides: {
                root: {
                    transition: 'all 0.4s',
                },
            },
        },
    },
});
exports.getChip = getChip;
const getForm = (theme) => ({
    components: {
        MuiFormLabel: {
            styleOverrides: {
                root: {
                    color: theme.palette.gray.main,
                },
            },
        },
        MuiSelect: {
            styleOverrides: {
                root: {
                    '.MuiFilledInput-input': {
                        color: theme.palette.gray.main,
                    },
                },
            },
        },
    },
});
exports.getForm = getForm;
exports.theme = (0, material_1.createTheme)(base, getAppBar(base), getList(base), (0, exports.getChip)(), (0, exports.getForm)(base));
//# sourceMappingURL=theme.js.map