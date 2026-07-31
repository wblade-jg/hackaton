import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// ============================================================
// Compás · "La Línea"
// Visual world: the operations transit map. Midnight-blue enamel
// ground, porcelain-white stations, and the four semantic "lines"
// (green / amber / scarlet / cobalt) that carry a batch from
// received to validated. Geometry stays disciplined: 45/90° only.
// ============================================================

let theme = createTheme({
  palette: {
    primary: {
      main: '#164B7D',
      light: '#4E7CAE',
      dark: '#0D2E4F',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#1F5FA8',
      light: '#5B8FC8',
      dark: '#15406F',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#1F8A4C',
      light: '#5CB87F',
      dark: '#146236',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#B36500',
      light: '#E8930C',
      dark: '#8F5C00',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#C2342B',
      light: '#DD7068',
      dark: '#96221C',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#1F5FA8',
      light: '#5B8FC8',
      dark: '#15406F',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F3F6FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#14263C',
      secondary: '#5A6B80',
      disabled: '#9AA7B8',
    },
    divider: '#DFE5EE',
    custom: {
      sidebar: '#0B2545',
      sidebarActive: 'rgba(255, 255, 255, 0.12)',
      track: '#E3E9F2',
      tableHead: '#F7F9FC',
      rowHover: 'rgba(22, 75, 125, 0.05)',
    },
  },
  typography: {
    fontFamily: '"Public Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    fontSize: 16,
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.375rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.9375rem',
      letterSpacing: '0.01em',
    },
    caption: {
      fontSize: '0.8125rem',
      lineHeight: 1.5,
    },
    label: {
      fontSize: '0.6875rem',
      fontWeight: 700,
      letterSpacing: '0.09em',
      textTransform: 'uppercase',
      lineHeight: 1.4,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '8px 20px',
          minHeight: 40,
          '&:active': {
            transform: 'scale(0.98)',
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(11, 37, 69, 0.18)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 1px 2px rgba(20, 38, 60, 0.06), 0px 1px 4px rgba(20, 38, 60, 0.04)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          boxShadow: '0px 1px 2px rgba(20, 38, 60, 0.06), 0px 1px 4px rgba(20, 38, 60, 0.04)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            fontWeight: 700,
            fontSize: '0.6875rem',
            letterSpacing: '0.09em',
            textTransform: 'uppercase',
            color: '#5A6B80',
            backgroundColor: '#F7F9FC',
            borderBottom: '2px solid #E3E9F2',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '14px 18px',
          fontSize: '0.9375rem',
          borderBottomColor: '#E7ECF4',
          fontVariantNumeric: 'tabular-nums',
        },
        head: {
          fontWeight: 700,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': {
            backgroundColor: 'rgba(22, 75, 125, 0.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.8125rem',
          letterSpacing: '0.02em',
        },
        colorWarning: {
          backgroundColor: '#8F5C00',
          color: '#FFFFFF',
        },
        colorError: {
          backgroundColor: '#C2342B',
          color: '#FFFFFF',
        },
        colorSuccess: {
          backgroundColor: '#177D42',
          color: '#FFFFFF',
        },
        colorPrimary: {
          backgroundColor: '#164B7D',
          color: '#FFFFFF',
        },
        colorInfo: {
          backgroundColor: '#1F5FA8',
          color: '#FFFFFF',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: '#D4DCE6',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
        outlinedWarning: {
          color: '#8F5C00',
          borderColor: '#E8930C',
          backgroundColor: '#FFF9F0',
          '& .MuiAlert-icon': {
            color: '#B36500',
          },
        },
        outlinedError: {
          backgroundColor: '#FDF3F3',
        },
        outlinedInfo: {
          backgroundColor: '#F4F8FD',
        },
        outlinedSuccess: {
          backgroundColor: '#F2FAF5',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          fontSize: '0.75rem',
          borderRadius: 6,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

theme = responsiveFontSizes(theme);

export default theme;
