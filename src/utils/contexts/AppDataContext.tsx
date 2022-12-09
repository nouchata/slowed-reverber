import type { Dispatch, Reducer } from 'react';
import { createContext, useReducer } from 'react';

export type IAppData = {
  /* error to be passed to the small or big modal based on type */
  error: { type: 'normal' | 'critical' | 'none'; value: string };
  /* used for printing message in the medium modal */
  mediumModalText: string;
  /* drag and drop flag for the song / image input */
  fileDragAndDrop: boolean;
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
  const [appData, setAppData] = useReducer<
    Reducer<IAppData, Partial<IAppData>>
  >(
    (state, updates) => ({
      error: updates.error || state.error,
      fileDragAndDrop: updates.fileDragAndDrop ?? state.fileDragAndDrop,
      mediumModalText: updates.mediumModalText ?? state.mediumModalText,
    }),
    {
      error: { type: 'none', value: '' },
      fileDragAndDrop: false,
      mediumModalText: '',
    }
  );
  return (
    <AppDataContext.Provider value={{ appData, setAppData }}>
      {props.children}
    </AppDataContext.Provider>
  );
};

export default AppDataProvider;
export { AppDataContext };
