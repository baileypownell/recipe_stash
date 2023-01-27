import { createTheme } from '@mui/material';

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
    orange;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    orange;
  }
}

export const theme = createTheme({
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
