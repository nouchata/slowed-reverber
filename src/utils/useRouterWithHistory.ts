import type { BaseRouter } from 'next/dist/shared/lib/router/router';
import type { NextRouter } from 'next/router';
import { useRouter } from 'next/router';
import type { Reducer } from 'react';
import { useEffect, useReducer, useRef } from 'react';

const useRouterWithHistory = (): [NextRouter, BaseRouter[]] => {
  const bareRouter = useRouter();
  /* oldRoutes contains the previous entries of the history, router is
   * exposed with a reducer to ensure that the oldRoutes are update at
   * the exact same time to prevent data dissonance */
  const oldRoutes = useRef<Array<BaseRouter>>([]);
  const [router, setRouter] = useReducer<Reducer<NextRouter, NextRouter>>(
    (prevState, newState) => {
      if (prevState.isReady && prevState.asPath !== newState.asPath)
        oldRoutes.current.push(prevState);
      return newState;
    },
    bareRouter
  );

  useEffect(() => {
    setRouter(bareRouter);
  }, [bareRouter]);

  return [router, oldRoutes.current];
};

export default useRouterWithHistory;
