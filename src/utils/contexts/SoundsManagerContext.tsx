import type { Dispatch, SetStateAction } from 'react';
import { createContext, useEffect, useState } from 'react';

import type { ISoundsManagerCurrentSound } from '../interfaces/SoundsManagerInterfaces';
import SoundsManager from '../SoundModule/SoundsManager';

type ISoundsManagerContextValues = {
  /* if an error occurs, it will be filled here */
  soundsManagerError: string;
  /* is the sounds manager well init */
  isSoundsManagerInit: boolean;
  /* is the sound ready to be used w/ the player */
  isCurrentSoundReady: boolean;
  /* play state for the player */
  playState: boolean;
  /* the soundsmanager instance */
  soundsManager: SoundsManager;
  /* the current sound instance */
  currentSound: ISoundsManagerCurrentSound;
  /* setter for the current sound instance */
  setCurrentSound: Dispatch<SetStateAction<ISoundsManagerCurrentSound>>;
};

const SoundsManagerContext = createContext<
  Partial<ISoundsManagerContextValues>
>({});

const SoundsManagerProvider = (props: { children: any }) => {
  const [soundsManagerError, setSoundsManagerError] = useState('');
  const [isSoundsManagerInit, setIsSoundsManagerInit] = useState(false);
  const [isCurrentSoundReady, setIsCurrentSoundReady] = useState(false);
  const [playState, setPlayState] = useState(false);
  const [currentSound, setCurrentSound] = useState<ISoundsManagerCurrentSound>(
    {}
  );
  const [soundsManager, setSoundsManager] = useState<SoundsManager>();
  /* soundsManager cleanup */
  useEffect(() => {
    const sm = new SoundsManager({
      errorCallback: setSoundsManagerError,
      successCallback: setIsSoundsManagerInit,
      successCallbackArgs: [true],
      setCurrentSoundCallback: setCurrentSound,
      setSoundReadyCallback: setIsCurrentSoundReady,
      setPlayStateCallback: setPlayState,
    });
    sm.contextUpdateCurrentSound(currentSound);
    setSoundsManager(sm);
    return () => sm.destructor();
  }, []);
  /* keep the soundsmanager up with the currentSound state */
  useEffect(() => {
    soundsManager?.contextUpdateCurrentSound(currentSound);
  }, [currentSound]);
  return (
    <SoundsManagerContext.Provider
      value={{
        soundsManagerError,
        isSoundsManagerInit,
        isCurrentSoundReady,
        playState,
        soundsManager,
        currentSound,
        setCurrentSound,
      }}
    >
      {props.children}
    </SoundsManagerContext.Provider>
  );
};

export default SoundsManagerProvider;
export { SoundsManagerContext };
