import { Theme, ThemeOptions } from '@mui/material';
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
export declare const getChip: () => ThemeOptions;
export declare const getInput: (theme: Theme) => ThemeOptions;
export declare const getForm: (theme: Theme) => ThemeOptions;
export declare const theme: Theme;
