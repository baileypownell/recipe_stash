import { alpha, createTheme } from '@mui/material';
import type { Theme, ThemeOptions } from '@mui/material';

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
  interface Theme {
    surfaces: {
      quiet: {
        backgroundColor: string;
        border: string;
        borderRadius: string;
        boxShadow: string;
      };
    };
  }
  interface ThemeOptions {
    surfaces?: {
      quiet?: {
        backgroundColor?: string;
        border?: string;
        borderRadius?: string;
        boxShadow?: string;
      };
    };
  }
}

declare module '@mui/material/Checkbox' {
  interface CheckboxPropsColorOverrides {
    orange: true;
  }
}

declare module '@mui/material/Button' {
  interface ButtonPropsColorOverrides {
    orange: true;
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
  surfaces: {
    quiet: {
      backgroundColor: '#fff',
      border: '1px solid rgba(53, 53, 49, 0.12)',
      borderRadius: '4px',
      boxShadow: '0 1px 4px rgba(53, 53, 49, 0.05)',
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

const getButton = (): ThemeOptions => ({
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 700,
          textTransform: 'none',
        },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            '&.Mui-disabled': {
              backgroundColor: 'rgb(232, 96, 84, 0.5)',
              color: 'rgba(255, 255, 255, 0.5)',
            },
          },
        },
      ],
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

export const getChip = (theme: Theme): ThemeOptions => ({
  components: {
    MuiChip: {
      defaultProps: {
        variant: 'filled',
        color: 'primary',
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
          transition: 'background-color 160ms ease, border-color 160ms ease',
        },
        sizeSmall: {
          height: 22,
          fontSize: '0.72rem',
        },
        outlined: {
          backgroundColor: '#fff',
          borderColor: alpha(theme.palette.gray.main, 0.18),
          color: theme.palette.gray.main,
        },
      },
    },
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#fff',
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
  },
});

const getSurfaceComponents = (theme: Theme): ThemeOptions => ({
  components: {
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          ...theme.surfaces.quiet,
          transition: 'border-color 160ms ease, box-shadow 160ms ease',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: theme.surfaces.quiet.borderRadius,
          transition: 'border-color 160ms ease, background-color 160ms ease',
        },
      },
    },
  },
});

export const theme = createTheme(
  base,
  getAppBar(base),
  getButton(),
  getList(base),
  getChip(base),
  getForm(base),
  getSurfaceComponents(base),
);
