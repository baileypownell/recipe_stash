"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.theme = void 0;
const material_1 = require("@mui/material");
exports.theme = (0, material_1.createTheme)({
    palette: {
        primary: {
            main: '#e86054',
            dark: '#d1564c',
            light: '#ea7065',
        },
        secondary: {
            main: '#87ad6a',
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
//# sourceMappingURL=theme.js.map