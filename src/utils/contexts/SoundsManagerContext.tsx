import { createContext, useContext, useEffect, useState } from 'react';

import type { ISoundsManagerCurrentSound } from '../interfaces/SoundsManagerInterfaces';
import SoundsManager from '../SoundModule/SoundsManager';
import { AppDataContext } from './AppDataContext';

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
};

const SoundsManagerContext = createContext<
  Partial<ISoundsManagerContextValues>
>({});

const SoundsManagerProvider = (props: { children: any }) => {
  const [isSoundsManagerInit, setIsSoundsManagerInit] = useState(false);
  const [isCurrentSoundReady, setIsCurrentSoundReady] = useState(false);
  const [playState, setPlayState] = useState(false);
  const [currentSound, setCurrentSound] = useState<ISoundsManagerCurrentSound>(
    {}
  );
  const [soundsManager, setSoundsManager] = useState<SoundsManager>();
  const { appData, setAppData } = useContext(AppDataContext);
  /* soundsManager cleanup */
  useEffect(() => {
    const sm = new SoundsManager({
      successCallback: setIsSoundsManagerInit,
      successCallbackArgs: [true],
      setCurrentSoundCallback: setCurrentSound,
      setSoundReadyCallback: setIsCurrentSoundReady,
      setPlayStateCallback: setPlayState,
      setAppDataCallback: setAppData,
      appData,
    });
    sm.resetCurrentSound();
    setSoundsManager(sm);
    return () => sm.destructor();
  }, []);
  /* keep the soundsmanager up with the currentSound and appData state */
  useEffect(() => {
    soundsManager?.contextUpdateCurrentSound(currentSound);
  }, [currentSound, soundsManager]);
  useEffect(() => {
    if (appData) soundsManager?.contextUpdateCurrentAppData(appData);
  }, [appData]);
  return (
    <SoundsManagerContext.Provider
      value={{
        isSoundsManagerInit,
        isCurrentSoundReady,
        playState,
        soundsManager,
        currentSound,
      }}
    >
      {props.children}
    </SoundsManagerContext.Provider>
  );
};

export default SoundsManagerProvider;
export { SoundsManagerContext };
