import router from 'next/router';
import { useContext, useEffect, useState } from 'react';

import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import { EAppModalState } from '@/utils/interfaces/AppModalState';
import { EExportChoices } from '@/utils/interfaces/ExportChoicesEnum';

import AppModalsCriticalError from '../../AppModalsCriticalError';
import XlModalHeader from '../layout/XlModalHeader';
import ModalXlLoading from '../ModalXlLoading';
import ExportConfiguration from './components/ExportConfiguration';
import ExportExecution from './components/ExportExecution';

enum EExportMediaState {
  CONFIG,
  ENCODING,
}

const editStateOffset = [0, -100];

const editStateTitle = ['Configuration', 'Export'];

const ExportMediaModal = () => {
  const [modalState, setModalState] = useState<{
    state: EAppModalState;
    error?: string;
  }>({ state: EAppModalState.LOADING });

  const { currentSound, soundsManager } = useContext(SoundsManagerContext);

  const [currentEditState, setCurrentEditState] = useState<EExportMediaState>(
    EExportMediaState.CONFIG
  );
  const [aButtonIsPressed, setAButtonIsPressed] = useState<boolean>(false);

  const [exportChoice, setExportChoice] = useState<EExportChoices>(
    EExportChoices.NO_CHOICE
  );

  useEffect(() => {
    /* query checks */
    if (!router.query.s) {
      setModalState({
        state: EAppModalState.ERROR,
        error: 'No song id was given',
      });
      return;
    }

    (async () => {
      let errorFlag = false;
      /* proceeds to check if we already have a song loaded in the memory
       * and prevents the soundsmanager to reinject it between related
       * pages (e.g. going from view to editSong) */
      const uselessToResetSong =
        currentSound?.soundInfoKey !== undefined &&
        currentSound.soundInfoKey === Number(router.query.s);

      /* try to load the song if it isn't */
      if (!uselessToResetSong) {
        soundsManager?.resetCurrentSound();
        await soundsManager
          ?.injectInCurrentSong('sounds-info', Number(router.query.s), true, {
            visualSourceData: true,
          })
          .catch((reason) => {
            errorFlag = true;
            setModalState({
              state: EAppModalState.ERROR,
              error: reason.message,
            });
          });
      }

      /* exits if there was an error during injection above */
      if (errorFlag) return;
      /* the requested media could be just a song hence the visual asset is sideloaded
       * to prevent throwing errors if it isn't available */
      if (!currentSound?.visualSourceData?.data)
        soundsManager
          ?.injectInCurrentSong('sounds-info', 0, false, {
            soundInfoData: true,
            soundInfoKey: true,
            soundInfoStore: true,
            soundSourceData: true,
          })
          .catch(() => undefined)
          .finally(() => {
            setModalState({
              state: EAppModalState.SUCCESS,
            });
          });
      else
        setModalState({
          state: EAppModalState.SUCCESS,
        });
    })();
  }, []);
  if (modalState.state === EAppModalState.LOADING) return <ModalXlLoading />;
  if (modalState.state === EAppModalState.ERROR)
    return <AppModalsCriticalError error={modalState.error || ''} />;
  return (
    <div
      id="export-media-modal-container"
      className="relative w-full h-full box-border rounded-t-lg"
    >
      <div
        id="export-media-modal-container"
        className="rounded-t-lg flex flex-col flex-nowrap w-full h-full"
      >
        <XlModalHeader
          aButtonIsPressed={aButtonIsPressed}
          currentPaneState={currentEditState}
          setAButtonIsPressed={setAButtonIsPressed}
          nextBtnCallback={async () => true}
          setPaneState={setCurrentEditState}
          /* only the first pane will have a next button available when
           * the user made a choice */
          buttonAvailability={[
            false,
            currentEditState === EExportMediaState.CONFIG &&
              exportChoice !== EExportChoices.NO_CHOICE,
          ]}
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
          <ExportConfiguration
            className="box-border flex-[0_0_100%] overflow-auto"
            isActive={currentEditState === EExportMediaState.CONFIG}
            exportChoice={exportChoice}
            setExportChoice={setExportChoice}
          />
          <ExportExecution
            className="box-border flex-[0_0_100%] overflow-auto"
            exportChoice={exportChoice}
            isActive={currentEditState === EExportMediaState.ENCODING}
          />
        </div>
      </div>
    </div>
  );
};

export default ExportMediaModal;
