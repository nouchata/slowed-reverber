import { createContext, useEffect, useState } from 'react';

import SoundsManager from '../SoundModule/SoundsManager';

type ISoundsManagerContextValues = {
  /* if an error occurs, it will be filled here */
  soundsManagerError: string;
  /* is the sounds manager well init */
  isSoundsManagerInit: boolean;
  /* the soundsmanager instance */
  soundsManager: SoundsManager;
};

const SoundsManagerContext = createContext<
  Partial<ISoundsManagerContextValues>
>({});

const SoundsManagerProvider = (props: { children: any }) => {
  const [soundsManagerError, setSoundsManagerError] = useState('');
  const [isSoundsManagerInit, setIsSoundsManagerInit] = useState(false);
  const [soundsManager, setSoundsManager] = useState<SoundsManager>();
  /* soundsManager cleanup */
  useEffect(() => {
    const sm = new SoundsManager({
      errorCallback: setSoundsManagerError,
      successCallback: setIsSoundsManagerInit,
      successCallbackArgs: [true],
    });
    setSoundsManager(sm);
    return () => sm.destructor();
  }, []);
  return (
    <SoundsManagerContext.Provider
      value={{
        soundsManagerError,
        isSoundsManagerInit,
        soundsManager,
      }}
    >
      {props.children}
    </SoundsManagerContext.Provider>
  );
};

export default SoundsManagerProvider;
export { SoundsManagerContext };
