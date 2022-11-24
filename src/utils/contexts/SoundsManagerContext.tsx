import { createContext, useEffect, useState } from 'react';

import SoundsManager from '../SoundModule/SoundsManager';

type ISoundsManagerContextValues = {
  /* if an error occurs, it will be filled here */
  error: string;
  /* the soundsmanager instance */
  soundsManager: SoundsManager;
};

const SoundsManagerContext = createContext<
  Partial<ISoundsManagerContextValues>
>({});

const SoundsManagerProvider = (props: { children: any }) => {
  const [error, setError] = useState('');
  const [soundsManager, setSoundsManager] = useState<SoundsManager>();
  /* soundsManager cleanup */
  useEffect(() => {
    setSoundsManager(new SoundsManager({ errorCallback: setError }));
    return () => soundsManager?.destructor();
  }, []);
  return (
    <SoundsManagerContext.Provider
      value={{
        error,
        soundsManager,
      }}
    >
      {props.children}
    </SoundsManagerContext.Provider>
  );
};

export default SoundsManagerProvider;
export { SoundsManagerContext };
