import type { AppProps } from 'next/app'
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import  { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import {ToastProvider} from "../contexts/ToastContext";
import {AuthProvider} from "../contexts/AuthContext";


const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
        //paper: '#121221',
       paper: '#1a1a1a',
    },
    primary: {
      light: '#757ce8',
      main: '#0F52BA',
      dark: '#0F52BA',
      contrastText: '#fff',

    },
    secondary: {
      light: '#ff7961',
      main: '#f44336',
      dark: '#ba000d',
      contrastText: '#000',
    },
  },
});



export default function App({ Component, pageProps }: AppProps) {

  //@ts-ignore
  const getLayout = Component.getLayout ?? ((page) => page);


  return (
      <AuthProvider>
        <ToastProvider>
          <ThemeProvider theme={theme}>
            {getLayout(<Component {...pageProps} />)}
          </ThemeProvider>
        </ToastProvider>
      </AuthProvider>
    )
}
