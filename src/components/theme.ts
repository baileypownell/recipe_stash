import { Anchor, createTheme, rgba } from '@mantine/core';
import type { CSSProperties } from 'react';

const recipeRed = [
  '#fff0ee',
  '#ffd9d4',
  '#f9aea6',
  '#f47f73',
  '#ee594b',
  '#e86054',
  '#d54a40',
  '#ab3f35',
  '#8d3129',
  '#72251f',
] as const;

const appColors = {
  primary: {
    main: recipeRed[5],
    dark: recipeRed[7],
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
};

type AppTheme = {
  palette: {
    primary: {
      main: string;
      dark: string;
      light: string;
    };
    error: {
      dark: string;
    };
    info: {
      contrastText: string;
    };
    gray: {
      main: string;
    };
  };
  shadows: {
    floating: string;
    overlay: string;
    panel: string;
    preview: string;
    raised: string;
    toolbar: string;
  };
  gradients: {
    heroContentScrim: string;
    heroFallback: string;
    heroImageOverlay: string;
    pageOverlay: string;
    tileImageScrim: string;
  };
  text: {
    link: string;
    inverseMuted: string;
  };
  borders: {
    faint: string;
    inverseSubtle: string;
    primary: string;
    subtle: string;
  };
  overlays: {
    lightbox: CSSProperties;
  };
  surfaces: {
    inset: CSSProperties;
    quiet: CSSProperties;
    page: CSSProperties;
    inverseTint: CSSProperties;
    primaryTint: CSSProperties;
  };
};

declare module '@mantine/core' {
  export interface MantineThemeOther {
    app: AppTheme;
  }
}

export const mantineTheme = createTheme({
  primaryColor: 'recipeRed',
  colors: {
    recipeRed,
  },
  primaryShade: 5,
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    fontWeight: '800',
  },
  components: {
    Modal: {
      defaultProps: {
        centered: true,
      },
    },
    Anchor: Anchor.extend({
      defaultProps: {
        underline: 'hover',
      },
      styles: (theme) => ({
        root: {
          color: theme.other.app.text.link,
          cursor: 'pointer',
          fontWeight: 800,
        },
      }),
    }),
  },
  other: {
    app: {
      palette: {
        primary: appColors.primary,
        error: {
          dark: appColors.error.dark,
        },
        info: {
          contrastText: appColors.info.contrastText,
        },
        gray: appColors.gray,
      },
      shadows: {
        floating: '0 14px 28px rgba(232, 96, 84, 0.32)',
        overlay: '0 18px 44px rgba(20, 20, 18, 0.42)',
        panel: '0 1px 8px rgba(53, 53, 49, 0.045)',
        preview: '5px 1px 30px rgba(53, 53, 49, 0.18)',
        raised: '0 16px 34px rgba(53, 53, 49, 0.11)',
        toolbar: '0 8px 24px rgba(53, 53, 49, 0.07)',
      },
      gradients: {
        heroContentScrim: `linear-gradient(180deg, ${rgba(appColors.gray.main, 0.02)}, ${rgba(appColors.gray.main, 0.72)})`,
        heroFallback: `linear-gradient(135deg, ${rgba(appColors.gray.main, 0.92)}, ${rgba(appColors.primary.main, 0.86)})`,
        heroImageOverlay: `linear-gradient(135deg, ${rgba(appColors.gray.main, 0.42)}, ${rgba(appColors.gray.main, 0.68)})`,
        pageOverlay:
          `linear-gradient(120deg, ${rgba(appColors.primary.main, 0.48)}, ${rgba(appColors.gray.main, 0.28)})`,
        tileImageScrim:
          `linear-gradient(180deg, transparent 0%, ${rgba(appColors.gray.main, 0.1)} 38%, ${rgba(appColors.gray.main, 0.74)} 100%)`,
      },
      text: {
        link: appColors.primary.light,
        inverseMuted: 'rgba(255, 255, 255, 0.68)',
      },
      borders: {
        faint: 'rgba(53, 53, 49, 0.08)',
        inverseSubtle: 'rgba(255, 255, 255, 0.34)',
        primary: 'rgba(232, 96, 84, 0.36)',
        subtle: 'rgba(53, 53, 49, 0.1)',
      },
      overlays: {
        lightbox: {
          backgroundColor: rgba(appColors.gray.main, 0.95),
        },
      },
      surfaces: {
        inset: {
          backgroundColor: 'rgba(53, 53, 49, 0.015)',
        },
        page: {
          background:
            `linear-gradient(180deg, ${rgba(appColors.primary.main, 0.045)}, transparent 320px), ${rgba(appColors.gray.main, 0.018)}`,
        },
        inverseTint: {
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
        },
        primaryTint: {
          backgroundColor: 'rgba(232, 96, 84, 0.08)',
        },
        quiet: {
          backgroundColor: '#fff',
          border: '1px solid rgba(53, 53, 49, 0.12)',
          borderRadius: '4px',
          boxShadow: '0 1px 8px rgba(53, 53, 49, 0.045)',
        },
      },
    },
  },
});
