import { useContext, useEffect, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import { EAppModalState } from '@/utils/interfaces/AppModalState';

import AppModalsCriticalError from '../../AppModalsCriticalError';
import Player from '../../player/Player';
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
  const { isCurrentSoundReady, soundsManager } =
    useContext(SoundsManagerContext);
  const { router, oldRoutes } = useContext(AppDataContext).appData!;

  useEffect(() => {
    if (router.query.md === 'addSong') {
      setModalState({ state: EAppModalState.SUCCESS });
      return;
    }
    /* skips the first pane if we're in edit mode */
    setCurrentEditState(ECurrentEditState.EDIT_STRINGS);
    /* proceeds to check if we already have a song loaded in the memory
     * and prevents the soundsmanager to reinject it between related
     * pages (e.g. going from view to editSong) */
    const lastHistoryEntry = oldRoutes.length
      ? oldRoutes[oldRoutes.length - 1]
      : undefined;
    const uselessToResetSong =
      lastHistoryEntry &&
      lastHistoryEntry.pathname === '/app/songs' &&
      lastHistoryEntry.query.md;
    /* query checks */
    if (!router.query.s && !router.query.t) {
      setModalState({
        state: EAppModalState.ERROR,
        error: 'No song id was given',
      });
      return;
    }
    /* try to load the song */
    if (!uselessToResetSong)
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
                file.name.replace(/\.[^.]*$/, '')
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
