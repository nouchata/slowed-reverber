import { useRouter } from 'next/router';
import { useEffect } from 'react';

import Player from '../player/Player';
import InjectNewSong from './components/InjectNewSong';

const AddSongModal = () => {
  const router = useRouter();
  const classForSteps = 'flex-1 overflow-auto w-full border-box p-2';
  useEffect(() => {}, [router.query]);
  return (
    <div
      id="add-song-modal-container"
      className="relative w-full h-full box-border rounded-t-lg"
    >
      <div
        id="add-song-modal-container-content"
        className="rounded-t-lg flex flex-col flex-nowrap w-full h-full"
      >
        <div
          id="add-song-modal-container-content-header"
          className="w-full flex-[0_0_50px] flex flex-nowrap select-none"
        >
          <button className="flex-[0_0_20%] text-white text-xs overflow-hidden">
            <span className="inline-block">
              <span
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' y1='12' x2='5' y2='12'%3E%3C/line%3E%3Cpolyline points='12 19 5 12 12 5'%3E%3C/polyline%3E%3C/svg%3E")`,
                }}
                className="inline px-2 bg-no-repeat bg-left bg-contain"
              />
              Previous
            </span>
          </button>
          <h2 className="flex-1 flex justify-center items-center text-lg font-bold text-white">
            {router.query.step === '1' && 'Add a file'}
          </h2>
          <button className="flex-[0_0_20%] text-white text-xs overflow-hidden">
            <span className="inline-block">
              Next
              <span
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3Cpolyline points='12 5 19 12 12 19'%3E%3C/polyline%3E%3C/svg%3E")`,
                }}
                className="inline px-2 bg-no-repeat bg-right bg-contain"
              />
            </span>
            <span></span>
          </button>
        </div>
        {router.query.step === '1' && (
          <InjectNewSong className={classForSteps} />
        )}
      </div>
      <Player
        style={{
          /* used to show the player by disable the transform property */
          transform:
            router.query.step && router.query.step !== '1' ? 'none' : undefined,
        }}
        className="absolute bottom-5 w-[90%] left-[5%] h-12 bg-app-modal-xl-lighter drop-shadow-lg translate-y-32 transition-transform z-10"
      />
    </div>
  );
};

export default AddSongModal;
