import { useContext, useEffect, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import { EAppModalState } from '@/utils/interfaces/AppModalState';

import AppModalsCriticalError from '../../AppModalsCriticalError';
import Player from '../../player/Player';
import XlModalHeader from '../layout/XlModalHeader';
import ModalXlLoading from '../ModalXlLoading';
import SourceChoice from './components/SourceChoice';

enum EMakeVideoState {
  CHOICE,
  LOCAL_SOURCE,
  GIPHY_SOURCE,
  ENCODE_VIDEO,
}

const editStateOffset = [0, -100, -100, -200];

const editStateTitle = [
  'Source selector',
  'Local source',
  'GIPHY source',
  'Encode video',
];

/* left is previous, right is next */
const editStateBtnAvailability: Array<[boolean, boolean]> = [
  [false, false],
  [true, false],
  [true, false],
  [true, false],
];

const MakeVideoModal = () => {
  const [modalState, setModalState] = useState<{
    state: EAppModalState;
    error?: string;
  }>({ state: EAppModalState.LOADING });
  const { router, oldRoutes } = useContext(AppDataContext).appData!;
  const { currentSound, soundsManager } = useContext(SoundsManagerContext);
  const [currentEditState, setCurrentEditState] = useState<EMakeVideoState>(
    currentSound!.visualSourceData
      ? EMakeVideoState.ENCODE_VIDEO
      : EMakeVideoState.CHOICE
  );
  const [previousBtnCallback /* , setPreviousBtnCallback */] =
    useState<() => Promise<boolean>>();
  const [nextBtnCallback /* , setNextBtnCallback */] =
    useState<() => Promise<boolean>>();
  const [aButtonIsPressed, setAButtonIsPressed] = useState<boolean>(false);

  useEffect(() => {
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
      id="make-video-modal-container"
      className="relative w-full h-full box-border rounded-t-lg"
    >
      <div
        id="make-video-modal-container-content"
        className="rounded-t-lg flex flex-col flex-nowrap w-full h-full"
      >
        <XlModalHeader
          aButtonIsPressed={aButtonIsPressed}
          currentPaneState={currentEditState}
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
          <SourceChoice className="box-border flex-[0_0_100%] overflow-auto" />
        </div>
      </div>
      <Player
        className={`absolute bottom-5 w-[90%] left-[5%] h-12 bg-app-modal-xl-lighter drop-shadow-lg transition-opacity ${
          !currentEditState ? 'opacity-20 hover:opacity-60' : ''
        } z-10`}
      />
    </div>
  );
};

export default MakeVideoModal;
