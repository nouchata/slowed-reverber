import '../styles/global.scss';

import type { AppProps } from 'next/app';

import {
  TransitionLayout,
  TransitionProvider,
} from '@/utils/contexts/TransitionContext';

const MyApp = ({ Component, pageProps }: AppProps) => (
  /* the page transition components */
  <TransitionProvider>
    <TransitionLayout>
      <Component {...pageProps} />
    </TransitionLayout>
  </TransitionProvider>
);

export default MyApp;
