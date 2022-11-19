import '../styles/global.scss';

import type { AppProps } from 'next/app';

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
        {getLayout(<Component {...pageProps} />)}
      </TransitionLayout>
    </TransitionProvider>
  );
};

export default MyApp;
