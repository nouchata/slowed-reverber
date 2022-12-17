import { useContext, useEffect, useState } from 'react';

import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';

import Player from '../player/Player';
import EditStrings from './components/EditStrings';
import InjectNewSong from './components/InjectNewSong';
import TweakValues from './components/TweakValues';

enum ECurrentEditState {
  INPUT_SONG,
  EDIT_STRINGS,
  EDIT_VALUES,
  INPUT_VISUAL,
}

const editStateOffset = [0, -100, -200, -300];

const editStateTitle = ['Add an audio file', 'Edit metadata', 'Tweak values'];

/* left is previous, right is next */
const editStateBtnAvailability = [
  [false, false],
  [false, true],
  [true, false],
];

const AddSongModal = (props: { freshSongEdit: boolean }) => {
  const [currentEditState, setCurrentEditState] = useState<ECurrentEditState>(
    props.freshSongEdit
      ? ECurrentEditState.INPUT_SONG
      : ECurrentEditState.EDIT_STRINGS
  );
  const [previousBtnCallback /* , setPreviousBtnCallback */] =
    useState<() => Promise<boolean>>();
  const [nextBtnCallback, setNextBtnCallback] =
    useState<() => Promise<boolean>>();
  const [aButtonIsPressed, setAButtonIsPressed] = useState<boolean>(false);
  const { isCurrentSoundReady } = useContext(SoundsManagerContext);
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
          <button
            className={`flex-[0_0_20%] text-white text-xs overflow-hidden ${
              editStateBtnAvailability[currentEditState]![0]
                ? 'visible'
                : 'invisible'
            }`}
            disabled={aButtonIsPressed}
            onClick={() => {
              if (aButtonIsPressed) return;
              setAButtonIsPressed(true);
              (async () => {
                if (previousBtnCallback) {
                  const returnValue = await previousBtnCallback();
                  if (returnValue) {
                    setCurrentEditState(currentEditState - 1);
                  }
                } else {
                  setCurrentEditState(currentEditState - 1);
                }
                setAButtonIsPressed(false);
              })();
            }}
          >
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
            {editStateTitle[currentEditState]}
          </h2>
          <button
            className={`flex-[0_0_20%] text-white text-xs overflow-hidden ${
              editStateBtnAvailability[currentEditState]![1] || false
                ? 'visible'
                : 'invisible'
            }`}
            disabled={aButtonIsPressed}
            onClick={() => {
              if (!nextBtnCallback || aButtonIsPressed) return;
              setAButtonIsPressed(true);
              (async () => {
                const returnValue = await nextBtnCallback();
                if (returnValue) {
                  setCurrentEditState(currentEditState + 1);
                }
                setAButtonIsPressed(false);
              })();
            }}
          >
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
          /* the height calc fixes the overflow bc for some reasons it doesn't
           * get the header size w/ h-full */
          className="overflow-visible flex-1 w-full h-[calc(100%-50px)] flex flex-nowrap transition-transform"
          style={{
            transform: `translateX(${editStateOffset[currentEditState]}%)`,
          }}
        >
          <InjectNewSong
            className="box-border flex-[0_0_100%] overflow-auto"
            /* switch to the next pane */
            successCallback={() =>
              setCurrentEditState(ECurrentEditState.EDIT_STRINGS)
            }
            isActive={currentEditState === ECurrentEditState.INPUT_SONG}
          />
          <EditStrings
            setNextCallback={setNextBtnCallback}
            className="box-border flex-[0_0_100%] overflow-auto"
            isActive={
              !aButtonIsPressed &&
              currentEditState === ECurrentEditState.EDIT_STRINGS &&
              !!isCurrentSoundReady
            }
          />
          <TweakValues
            setNextCallback={setNextBtnCallback}
            className="box-border flex-[0_0_100%] overflow-auto"
            isActive={
              !aButtonIsPressed &&
              currentEditState === ECurrentEditState.EDIT_VALUES &&
              !!isCurrentSoundReady
            }
            /* the pane stacking confuses getboundingrect so i'm refreshing it
             * to get the good x offset value using key but it could have been
             * an observer */
            key={currentEditState}
          />
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
