import '../styles/global.css';

import type { AppProps } from 'next/app';

import AppDataProvider from '@/utils/contexts/AppDataContext';
import {
  TransitionLayout,
  TransitionProvider,
} from '@/utils/contexts/TransitionContext';
import type { NextPageLayoutInterface } from '@/utils/interfaces/NextPageLayoutInterface';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const getLayout =
    (Component as NextPageLayoutInterface).getLayout ?? ((page: any) => page);

  return (
    <TransitionProvider>
      <TransitionLayout>
        <AppDataProvider>
          {getLayout(<Component {...pageProps} />)}
        </AppDataProvider>
      </TransitionLayout>
    </TransitionProvider>
  );
};

export default MyApp;
