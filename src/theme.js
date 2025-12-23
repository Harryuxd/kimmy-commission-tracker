import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#EC5598', // Pink
            contrastText: '#fff',
        },
        secondary: {
            main: '#FCB900', // Gold
            contrastText: '#000',
        },
        background: {
            default: '#F8F9FA',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#222222',
            secondary: '#666666',
        },
    },
    typography: {
        fontFamily: "'Open Sans', sans-serif",
        h1: {
            fontFamily: "'Raleway', sans-serif",
        },
        h2: {
            fontFamily: "'Raleway', sans-serif",
            fontWeight: 700,
        },
        h3: {
            fontFamily: "'Raleway', sans-serif",
        },
        button: {
            fontFamily: "'Raleway', sans-serif",
            fontWeight: 700,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 50, // Pill shape
                    textTransform: 'none',
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
            },
        },
    },
});

export default theme;
