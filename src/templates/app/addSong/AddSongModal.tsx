import { useEffect, useState } from 'react';

import Player from '../player/Player';
import InjectNewSong from './components/InjectNewSong';

enum ECurrentEditState {
  INPUT_SONG,
  EDIT_STRINGS,
  EDIT_VALUES,
  INPUT_VISUAL,
}

const editStateOffset = [0, -100, -200, -300];

const AddSongModal = (props: { freshSongEdit: boolean }) => {
  const [currentEditState, setCurrentEditState] = useState<ECurrentEditState>(
    props.freshSongEdit
      ? ECurrentEditState.INPUT_SONG
      : ECurrentEditState.EDIT_STRINGS
  );
  // const router = useRouter();
  useEffect(() => {
    /* button availability */
  }, [currentEditState]);
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
            {currentEditState === ECurrentEditState.INPUT_SONG &&
              'Add an audio file'}
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
        <div
          className="overflow-visible flex-1 w-full flex flex-nowrap transition-transform"
          style={{
            transform: `translateX(${editStateOffset[currentEditState]}%)`,
          }}
        >
          <InjectNewSong
            className="box-border flex-[0_0_100%] overflow-auto p-2"
            /* switch to the next pane */
            successCallback={() =>
              setCurrentEditState(ECurrentEditState.EDIT_STRINGS)
            }
            isActive={currentEditState === ECurrentEditState.INPUT_SONG}
          />
          <div className="flex-[0_0_100%] bg-red-700 text-white">
            auiaygyaygayhfehyeffueuiehueduiueieshues
          </div>
          <div className="flex-[0_0_100%] bg-slate-400 relative"></div>
        </div>
      </div>
      <Player
        style={{
          /* used to show the player by disable the transform property */
          transform: currentEditState ? 'none' : undefined,
        }}
        className="absolute bottom-5 w-[90%] left-[5%] h-12 bg-app-modal-xl-lighter drop-shadow-lg translate-y-32 transition-transform z-10"
      />
    </div>
  );
};

export default AddSongModal;
