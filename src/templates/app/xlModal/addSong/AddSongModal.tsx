import { useContext, useEffect, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import { EAppModalState } from '@/utils/interfaces/AppModalState';

import AppModalsCriticalError from '../../AppModalsCriticalError';
import InjectNewFile from '../InjectNewFile';
import XlModalHeader from '../layout/XlModalHeader';
import ModalXlLoading from '../ModalXlLoading';
import EditStrings from './components/EditStrings';
import TweakValues from './components/TweakValues';

enum ECurrentEditState {
  INPUT_SONG,
  EDIT_STRINGS,
  EDIT_VALUES,
}

const editStateOffset = [0, -100, -200];

const editStateTitle = ['Add an audio file', 'Edit metadata', 'Tweak values'];

/* left is previous, right is next */
const editStateBtnAvailability: Array<[boolean, boolean]> = [
  [false, false],
  [false, true],
  [true, true],
];

const AddSongModal = () => {
  const [modalState, setModalState] = useState<{
    state: EAppModalState;
    error?: string;
  }>({ state: EAppModalState.LOADING });
  const [currentEditState, setCurrentEditState] = useState<ECurrentEditState>(
    ECurrentEditState.INPUT_SONG
  );
  const [previousBtnCallback /* , setPreviousBtnCallback */] =
    useState<() => Promise<boolean>>();
  const [nextBtnCallback, setNextBtnCallback] =
    useState<() => Promise<boolean>>();
  const [aButtonIsPressed, setAButtonIsPressed] = useState<boolean>(false);
  const { isCurrentSoundReady, currentSound, soundsManager } =
    useContext(SoundsManagerContext);
  const { router } = useContext(AppDataContext).appData!;

  useEffect(() => {
    /* checks if it's add mode */
    if (router.query.md === 'addSong') {
      /* reset to allow a new entry */
      soundsManager?.resetCurrentSound();
      setModalState({ state: EAppModalState.SUCCESS });
      return;
    }
    /* skips the first pane since we're in edit mode */
    setCurrentEditState(ECurrentEditState.EDIT_STRINGS);
    /* edit mode query checks */
    if (!router.query.s && !router.query.t) {
      setModalState({
        state: EAppModalState.ERROR,
        error: 'No song id was given',
      });
      return;
    }
    /* proceeds to check if we already have a song loaded in the memory
     * and prevents the soundsmanager to reinject it between related
     * pages (e.g. going from view to editSong) */
    const uselessToResetSong =
      currentSound?.soundInfoKey !== undefined &&
      currentSound.soundInfoKey === Number(router.query.s || router.query.t);
    /* try to load the song */
    if (uselessToResetSong)
      setModalState({
        state: EAppModalState.SUCCESS,
      });
    else {
      soundsManager?.resetCurrentSound();
      soundsManager
        ?.injectInCurrentSong(
          router.query.s ? 'sounds-info' : 'sounds-temp-info',
          Number(router.query.s || router.query.t),
          true,
          { visualSourceData: true }
        )
        .then(() => {
          setModalState({
            state: EAppModalState.SUCCESS,
          });
        })
        .catch((reason) => {
          setModalState({
            state: EAppModalState.ERROR,
            error: reason.message,
          });
        });
    }
  }, []);
  if (modalState.state === EAppModalState.LOADING) return <ModalXlLoading />;
  if (modalState.state === EAppModalState.ERROR)
    return <AppModalsCriticalError error={modalState.error || ''} />;
  return (
    <div
      id="add-song-modal-container"
      className="relative w-full h-full box-border rounded-t-lg"
    >
      <div
        id="add-song-modal-container-content"
        className="rounded-t-lg flex flex-col flex-nowrap w-full h-full"
      >
        <XlModalHeader
          aButtonIsPressed={aButtonIsPressed}
          currentPaneState={currentEditState}
          lastPaneState={ECurrentEditState.EDIT_VALUES}
          setAButtonIsPressed={setAButtonIsPressed}
          nextBtnCallback={nextBtnCallback}
          previousBtnCallback={previousBtnCallback}
          setPaneState={setCurrentEditState}
          buttonAvailability={editStateBtnAvailability[currentEditState]!}
          title={editStateTitle[currentEditState]!}
        />
        <div
          /* the height calc fixes the overflow bc for some reasons it doesn't
           * get the header size w/ h-full */
          className="overflow-visible flex-1 w-full h-[calc(100%-50px)] flex flex-nowrap transition-transform"
          style={{
            transform: `translateX(${editStateOffset[currentEditState]}%)`,
          }}
        >
          <InjectNewFile
            className="box-border flex-[0_0_100%] overflow-auto"
            /* switch to the next pane */
            successCallback={() =>
              setCurrentEditState(ECurrentEditState.EDIT_STRINGS)
            }
            processCallback={async (file) => {
              await soundsManager!.addFile(
                await file.arrayBuffer(),
                /* removes the extension */
                file.name.replace(/\.[^.]*$/, ''),
                file.type
              );
            }}
            isActive={currentEditState === ECurrentEditState.INPUT_SONG}
            fileTypes={['audio']}
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
    </div>
  );
};

export default AddSongModal;
