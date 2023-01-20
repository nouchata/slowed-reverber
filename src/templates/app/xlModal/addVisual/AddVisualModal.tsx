import { useContext, useEffect, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import { EAppModalState } from '@/utils/interfaces/AppModalState';

import AppModalsCriticalError from '../../AppModalsCriticalError';
import Player from '../../player/Player';
import InjectNewFile from '../InjectNewFile';
import XlModalHeader from '../layout/XlModalHeader';
import ModalXlLoading from '../ModalXlLoading';
import InjectFromGiphy from './components/giphy/InjectFromGiphy';
import SaveVisual from './components/SaveVisual';
import SourceChoice from './components/SourceChoice';

enum EMakeVideoState {
  CHOICE,
  SOURCE,
  ENCODE_VIDEO,
}

const editStateOffset = [0, -100, -200];

const editStateTitle = ['Source selector', 'Injection', 'Encode video'];
const injectionTitle = { local: 'File injection', giphy: 'GIPHY injection' };

/* left is previous, right is next */
const editStateBtnAvailability: Array<[boolean, boolean]> = [
  [false, false],
  [true, false],
  [true, false],
];

const AddVisualModal = () => {
  const [modalState, setModalState] = useState<{
    state: EAppModalState;
    error?: string;
  }>({ state: EAppModalState.LOADING });
  const { router, oldRoutes } = useContext(AppDataContext).appData!;
  const { currentSound, soundsManager } = useContext(SoundsManagerContext);

  const [currentInjectionPane, setCurrentInjectionPane] = useState<
    'local' | 'giphy'
  >();
  const [currentEditState, setCurrentEditState] = useState<EMakeVideoState>(
    currentSound!.visualSourceData
      ? EMakeVideoState.ENCODE_VIDEO
      : EMakeVideoState.CHOICE
  );

  const [draftVisual, setDraftVisual] = useState<File | Blob>();
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
          /* the navigation buttons are only used by the sources selector so
           * their callbacks are directly defined here for now since they likely
           * won't be edited */
          nextBtnCallback={undefined}
          previousBtnCallback={async () => {
            setCurrentEditState(EMakeVideoState.CHOICE);
            setDraftVisual(undefined);
            return false;
          }}
          setPaneState={setCurrentEditState}
          buttonAvailability={editStateBtnAvailability[currentEditState]!}
          title={
            currentEditState === EMakeVideoState.SOURCE && currentInjectionPane
              ? injectionTitle[currentInjectionPane]
              : editStateTitle[currentEditState]!
          }
        />
        <div
          /* the height calc fixes the overflow bc for some reasons it doesn't
           * get the header size w/ h-full */
          className="overflow-visible flex-1 w-full h-[calc(100%-50px)] flex flex-nowrap transition-transform"
          style={{
            transform: `translateX(${editStateOffset[currentEditState]}%)`,
          }}
        >
          <SourceChoice
            className="box-border flex-[0_0_100%] overflow-auto"
            isActive={currentEditState === EMakeVideoState.CHOICE}
            choiceSetterCallback={(choice) => {
              setCurrentInjectionPane(choice);
              setCurrentEditState(EMakeVideoState.SOURCE);
            }}
          />
          <div
            id="make-video-modal-source-inject-container"
            className="box-border flex-[0_0_100%] overflow-auto"
          >
            {currentInjectionPane === 'local' && (
              <InjectNewFile
                className="w-full h-full overflow-auto"
                key={currentEditState}
                isActive={currentEditState === EMakeVideoState.SOURCE}
                processCallback={async (file) => {
                  setDraftVisual(file);
                }}
                successCallback={() =>
                  setCurrentEditState(EMakeVideoState.ENCODE_VIDEO)
                }
                fileTypes={['image', 'video']}
              />
            )}
            {currentInjectionPane === 'giphy' && (
              <InjectFromGiphy
                className="w-full h-full overflow-auto"
                key={currentEditState}
                processCallback={async (file) => {
                  setDraftVisual(file);
                }}
                successCallback={() =>
                  setCurrentEditState(EMakeVideoState.ENCODE_VIDEO)
                }
                isActive={currentEditState === EMakeVideoState.SOURCE}
              />
            )}
            {!currentInjectionPane && <ModalXlLoading />}
          </div>
          <SaveVisual
            className="box-border flex-[0_0_100%] overflow-auto"
            isActive={currentEditState === EMakeVideoState.ENCODE_VIDEO}
            draftData={draftVisual}
            successCallback={() => {
              if (oldRoutes.length) router.back();
              else router.push('/app/songs');
            }}
          />
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

export default AddVisualModal;
