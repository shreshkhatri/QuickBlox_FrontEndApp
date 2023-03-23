import { createTheme, ThemeProvider} from '@mui/material/styles';

const theme = createTheme({
    palette: {
      type: 'light',
      primary: {
        main: '#3978fc',
      },
      secondary: {
        main: '#FFD421',
      },
      background: {
        default: '#ffffff',
      },
      error:{
        light:'#ef5350',
        main:'#d32f2f'

      }
    },
    typography: {
      fontSize: 12,
      color:'black'
    },
  });

export const DefaultThemeProvider =({children})=>{
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>
  }


  