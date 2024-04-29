declare module '@mui/material/styles' {
    interface Palette {
        gray: Palette['primary'];
        orange: Palette['primary'];
        boxShadow: Palette['primary'];
    }
    interface PaletteOptions {
        gray: PaletteOptions['primary'];
        orange: PaletteOptions['primary'];
        boxShadow: PaletteOptions['primary'];
    }
}
declare module '@mui/material/Checkbox' {
    interface CheckboxPropsColorOverrides {
        orange: any;
    }
}
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        orange: any;
    }
}
export declare const theme: import("@mui/material").Theme;
