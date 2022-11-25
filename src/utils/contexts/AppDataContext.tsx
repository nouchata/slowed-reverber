import type { Dispatch, SetStateAction } from 'react';
import { createContext, useState } from 'react';

export type IAppData = {
  /* error to be passed to the small modal */
  error: string;
  /* if this is set to critical, it can be used as well for critical
   * error (though i don't see any use for now) */
  criticalError: boolean;
  /* used for printing message in the medium modal */
  mediumModalText: string;
  /* drag and drop flag for the song / image input */
  fileDragAndDrop: boolean;
};

export type IAppDataContextValues = {
  appData: Partial<IAppData>;
  setAppData: Dispatch<SetStateAction<Partial<IAppData>>>;
};

const AppDataContext = createContext<Partial<IAppDataContextValues>>({});

const AppDataProvider = (props: { children: any }) => {
  const [appData, setAppData] = useState<Partial<IAppData>>({});
  return (
    <AppDataContext.Provider value={{ appData, setAppData }}>
      {props.children}
    </AppDataContext.Provider>
  );
};

export default AppDataProvider;
export { AppDataContext };
