// import { RefineThemes } from '@refinedev/mui';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import gray from '@mui/material/colors/grey.js';

const LightTheme = createTheme({
  // ...RefineThemes.Green,
  palette: {
    mode: 'light',
    primary: { main: '#6D8040' }, // Your primary color
    secondary: { main: '#ec4899' }, // Your secondary color
  },
  components: {
    // ...RefineThemes.Green.components,
    MuiChip: {
      styleOverrides: {
        labelSmall: {
          lineHeight: '18px',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        'main.MuiBox-root': {
          backgroundColor: gray[100],
        },
        body: {
          backgroundColor: gray[100],
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variant: 'body2',
      },
    },
  },
});

const DarkTheme = createTheme({
  // ...RefineThemes.GreenDark,
  palette: {
    mode: 'dark',
    primary: { main: '#6D8040' },
    secondary: { main: '#ec4899' },
  },
  components: {
    // ...RefineThemes.GreenDark.components,
    MuiChip: {
      styleOverrides: {
        labelSmall: {
          lineHeight: '18px',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        'main.MuiBox-root': {
          backgroundColor: '#121212',
        },
        body: {
          backgroundColor: '#121212',
        },
      },
    },
    MuiTypography: {
      defaultProps: {
        variant: 'body2',
      },
    },
  },
});

const DarkThemeWithResponsiveFontSizes = responsiveFontSizes(DarkTheme);
const LightThemeWithResponsiveFontSizes = responsiveFontSizes(LightTheme);

export { LightThemeWithResponsiveFontSizes, DarkThemeWithResponsiveFontSizes };
