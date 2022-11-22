import { useState } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

import PlayerControlState from './PlayerControlState';
import PlayerProgressState from './PlayerProgressState';

const Player = (props: IStylePropsInterface) => {
  const [isPaused, setIsPaused] = useState(true);
  return (
    <div
      className={`text-white flex flex-row flex-nowrap rounded bg-slate-600 select-none min-w-[250px] ${props.className}`}
    >
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="flex-[0_0_80px] flex justify-center items-center box-border py-2"
      >
        <PlayerControlState className="w-full h-full" isPaused={isPaused} />
      </button>
      <PlayerProgressState className="flex-1" value={33} />
      <span
        id="player-sound-total-time"
        className="flex-[0_0_80px] flex justify-center items-center"
      >
        00:00
      </span>
    </div>
  );
};

export default Player;
