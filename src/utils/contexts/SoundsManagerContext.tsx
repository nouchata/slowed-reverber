import { createContext, useState } from 'react';

import SoundsManager from '../SoundModule/SoundsManager';

type ISoundsManagerContextValues = {
  /* if an error occurs, it will be filled here */
  error?: string;
  /* the soundsmanager instance */
  soundsManager?: SoundsManager;
};

const SoundsManagerContext = createContext<ISoundsManagerContextValues>({});

const SoundsManagerProvider = (props: { children: any }) => {
  const [error, setError] = useState('');
  return (
    <SoundsManagerContext.Provider
      value={{
        error,
        soundsManager: new SoundsManager({
          errorCallback: setError,
        }),
      }}
    >
      {props.children}
    </SoundsManagerContext.Provider>
  );
};

export default SoundsManagerProvider;
