import * as React from 'react';
import type { AppProps } from 'next/app';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ThemeProvider, CssBaseline, createTheme, Box } from '@mui/material';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import createEmotionCache from '../utility/createEmotionCache';
import lightThemeOptions from '../styles/theme/lightThemeOptions';
import darkThemeOptions from '../styles/theme/darkThemeOptions'
import '../styles/globals.css';
import { Decimal } from "decimal.js"
import SuperJSON from 'superjson'
import SideBar from '../components/layout/SideBar';
import { Suspense } from 'react';
import { NextPage } from 'next';

SuperJSON.registerCustom<Decimal, string>(
  {
    isApplicable: (v): v is Decimal => Decimal.isDecimal(v),
    serialize: v => v.toJSON(),
    deserialize: v => new Decimal(v),
  },
  'decimal.js'
);

const clientSideEmotionCache = createEmotionCache();

const lightTheme = createTheme(lightThemeOptions);
const darkTheme = createTheme(darkThemeOptions)

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
  emotionCache?: EmotionCache;
}

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: React.ReactElement) => React.ReactElement
}

const MyApp: React.FunctionComponent<AppPropsWithLayout> = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  const getLayout = Component.getLayout ?? ((page) => {
    return <CacheProvider value={emotionCache}>
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />

      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <SideBar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Suspense fallback={'Loading...'}>
            {page}
          </Suspense>
        </Box>
      </Box>
    </ThemeProvider>
  </CacheProvider>
  })

  return getLayout(<Component {...pageProps} />)
};

export default MyApp;
