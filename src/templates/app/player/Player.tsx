import { useContext, useEffect, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

import PlayerControlState from './PlayerControlState';
import PlayerProgressState from './PlayerProgressState';

const Player = (props: IStylePropsInterface) => {
  const {
    isCurrentSoundReady,
    isSoundsManagerInit,
    soundsManager,
    playState,
    currentSound,
  } = useContext(SoundsManagerContext);
  const { appData, setAppData } = useContext(AppDataContext);
  /* time formatting */
  const [minutesSeconds, setMinutesSeconds] = useState<Array<string>>([
    '--',
    '--',
  ]);
  /* cut the audio if the player leaves the DOM */
  useEffect(() => {
    const sm = soundsManager!;
    return () => sm.cutAudio(true);
  }, []);
  /* updates the duration display */
  useEffect(() => {
    /* total duration takes account of the speedvalue factor */
    const totalDuration =
      (currentSound?.soundBufferDuration || 0) /
      (currentSound?.soundInfoData?.speedValue || 1);
    const minutes = Math.floor(totalDuration / 60);
    const seconds = Math.floor(totalDuration - minutes * 60);
    if (minutes && seconds)
      setMinutesSeconds([
        String(minutes).padStart(2, '0'),
        String(seconds).padStart(2, '0'),
      ]);
    else setMinutesSeconds(['--', '--']);
  }, [currentSound]);
  return (
    <div
      style={props.style}
      className={`text-white flex flex-row flex-nowrap rounded select-none min-w-[250px] ${props.className}`}
    >
      <button
        onClick={() => {
          try {
            if (!playState) soundsManager!.play();
            else soundsManager!.pause();
          } catch (e: any) {
            setAppData!({ ...appData, error: e.message });
          }
        }}
        className="flex-[0_0_80px] flex justify-center items-center box-border py-2"
      >
        <PlayerControlState className="w-full h-full" isPaused={!playState} />
      </button>
      <PlayerProgressState className="flex-1" />
      <span
        id="player-sound-total-time"
        className="flex-[0_0_80px] flex justify-center items-center"
      >
        {minutesSeconds[0]}:{minutesSeconds[1]}
      </span>
      {!(isCurrentSoundReady && isSoundsManagerInit) && (
        <div
          className="absolute w-full h-full rounded opacity-80"
          style={{
            background:
              'repeating-linear-gradient(-55deg,#222,#222 10px,#333 10px,#333 20px)',
          }}
        ></div>
      )}
    </div>
  );
};

export default Player;
