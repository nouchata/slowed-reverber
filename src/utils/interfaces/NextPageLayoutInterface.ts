import type { NextPage } from 'next';
import type { ReactElement, ReactNode } from 'react';

export type NextPageLayoutInterface<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};
