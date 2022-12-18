import type { BaseRouter } from 'next/dist/shared/lib/router/router';
import type { NextRouter } from 'next/router';
import type { Dispatch, Reducer } from 'react';
import { createContext, useEffect, useReducer } from 'react';

import useRouterWithHistory from '../useRouterWithHistory';

export type IAppData = {
  /* error to be passed to the small or big modal based on type */
  error: { type: 'normal' | 'critical' | 'none'; value: string };
  /* used for printing message in the medium modal */
  mediumModalText: string;
  /* drag and drop flag for the song / image input */
  fileDragAndDrop: boolean;
  /* router with history references */
  router: NextRouter;
  oldRoutes: BaseRouter[];
};

export type IAppDataContextValues = {
  appData: IAppData;
  setAppData: Dispatch<Partial<IAppData>>;
};

const AppDataContext = createContext<Partial<IAppDataContextValues>>({});

const AppDataProvider = (props: { children: any }) => {
  /* using a reducer instead of a state helps to have a better workflow
   * regarding error handling since their closing behavior may be debounced
   * and so it could update an old version of appData since edits can happened
   * meanwhile */
  const [router, oldRoutes] = useRouterWithHistory();
  const [appData, setAppData] = useReducer<
    Reducer<IAppData, Partial<IAppData>>
  >(
    (state, updates) => ({
      error: updates.error || state.error,
      fileDragAndDrop: updates.fileDragAndDrop ?? state.fileDragAndDrop,
      mediumModalText: updates.mediumModalText ?? state.mediumModalText,
      router: updates.router ?? state.router,
      oldRoutes: updates.oldRoutes ?? state.oldRoutes,
    }),
    {
      error: { type: 'none', value: '' },
      fileDragAndDrop: false,
      mediumModalText: '',
      router,
      oldRoutes,
    }
  );
  useEffect(() => {
    setAppData({ router });
  }, [router]);
  return (
    <AppDataContext.Provider value={{ appData, setAppData }}>
      {props.children}
    </AppDataContext.Provider>
  );
};

export default AppDataProvider;
export { AppDataContext };
