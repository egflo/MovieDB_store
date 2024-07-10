import type { AppProps } from 'next/app'
import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import  { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import {ToastProvider} from "../contexts/ToastContext";
import {AuthProvider} from "../contexts/AuthContext";
import {CartProvider} from "../contexts/CartContext";
import {SWRConfig} from "swr";
import BookmarkProvider from "../contexts/BookmarkContext";


export const theme = createTheme({

  typography: {
    fontFamily: [
        'Roboto',
        'sans-serif',
    ].join(','),
  } ,

  palette: {
    mode: 'dark',
    background: {
        paper: '#121221',
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
      <SWRConfig value={{
        refreshInterval: 30000,
      }}>
        <AuthProvider>
          <BookmarkProvider>
            <CartProvider>
              <ToastProvider>
                <ThemeProvider theme={theme}>
                  {getLayout(<Component {...pageProps} />)}
                </ThemeProvider>
              </ToastProvider>
            </CartProvider>
          </BookmarkProvider>
        </AuthProvider>
      </SWRConfig>
    )
}
