import { Theme, ThemeOptions, createTheme } from '@mui/material';

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

const base = createTheme({
  palette: {
    primary: {
      main: '#e86054',
      dark: '#ab3f35',
      light: '#fa7569',
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

const getAppBar = (theme: Theme): ThemeOptions => ({
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

const getList = (theme: Theme): ThemeOptions => ({
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

// export const getListItem = (theme: Theme): ThemeOptions => ({
//   components: {
//     MuiListItem: {
//       styleOverrides: {
//         root: {
//           cursor: 'pointer',
//         },
//       },
//     },
//   },
// });

export const getChip = (): ThemeOptions => ({
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

export const getInput = (theme: Theme): ThemeOptions => ({
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: theme.palette.info.main,
        },
      },
    },
    // MuiLabel
  },
});

export const getForm = (theme: Theme): ThemeOptions => ({
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

export const theme = createTheme(
  base,
  getAppBar(base),
  getList(base),
  getChip(),
  getInput(base),
  getForm(base),
);
