import { useContext, useEffect, useMemo, useState } from 'react';

import LowpassSVG from '@/svgs/app/addSong/editValues/Lowpass';
import ReverbSVG from '@/svgs/app/addSong/editValues/Reverb';
import SpeedSVG from '@/svgs/app/addSong/editValues/Speed';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import { EAppModalState } from '@/utils/interfaces/AppModalState';

import AppModalsCriticalError from '../../AppModalsCriticalError';
import XlModalHeader from '../layout/XlModalHeader';
import ModalXlLoading from '../ModalXlLoading';
import VisualDataPreview from '../VisualDataPreview';
import ValueDisplayer from './components/ValueDisplayer';

const ViewSongModal = () => {
  const [modalState, setModalState] = useState<{
    state: EAppModalState;
    error?: string;
  }>({ state: EAppModalState.LOADING });
  const { isCurrentSoundReady, currentSound, soundsManager } =
    useContext(SoundsManagerContext);
  const { router } = useContext(AppDataContext).appData!;
  const visualBlob = useMemo(() => {
    return currentSound?.visualSourceData?.data
      ? new Blob([currentSound?.visualSourceData?.data], {
          type: currentSound?.visualSourceData?.type,
        })
      : undefined;
  }, [currentSound?.visualSourceData?.data]);
  const addedDate = useMemo(() => {
    if (currentSound?.soundInfoData?.creationDate)
      return new Date(currentSound?.soundInfoData?.creationDate);
    return undefined;
  }, [currentSound?.soundInfoData?.creationDate]);

  useEffect(() => {
    /* query checks */
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
        })
        .catch((reason) => {
          setModalState({
            state: EAppModalState.ERROR,
            error: reason.message,
          });
        });
    }
  }, []);
  if (modalState.state === EAppModalState.ERROR)
    return <AppModalsCriticalError error={modalState.error || ''} />;
  if (modalState.state === EAppModalState.LOADING || !isCurrentSoundReady)
    return <ModalXlLoading />;
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
          aButtonIsPressed={true}
          currentPaneState={0}
          setAButtonIsPressed={() => undefined}
          setPaneState={() => undefined}
          buttonAvailability={[false, false]}
          title={`${
            currentSound?.soundInfoData?.author
              ? `${currentSound?.soundInfoData?.author} - `
              : ''
          }${currentSound?.soundInfoData?.name}`}
        />
        <div
          /* the height calc fixes the overflow bc for some reasons it doesn't
           * get the header size w/ h-full */
          className="overflow-visible flex-1 w-full h-[calc(100%-50px)] flex flex-nowrap transition-transform"
        >
          <div className="flex-[0_0_100%] overflow-auto pb-20 flex flex-col text-white select-none">
            <div className="relative flex flex-col overflow-hidden bg-app-input-disabled py-8">
              {visualBlob && (
                <VisualDataPreview
                  className="absolute top-0 left-0 w-full h-full object-cover opacity-50"
                  blob={visualBlob}
                  notRounded={true}
                />
              )}
              <div
                id="song-data-fader"
                className="absolute bottom-0 left-0 h-1/6 w-full bg-gradient-to-t from-app-modal-xl-background"
              ></div>
              <h3 className="overflow-hidden whitespace-nowrap text-ellipsis text-center z-10 text-3xl pt-1 font-extrabold">
                {currentSound?.soundInfoData?.name || 'Unknown title'}
              </h3>
              <h4 className="overflow-hidden whitespace-nowrap text-ellipsis text-center z-10 text-xl pb-1 font-thin">
                {currentSound?.soundInfoData?.author || 'Unknown author'}
              </h4>
              <p className="overflow-hidden whitespace-nowrap text-ellipsis text-center z-10 text-sm py-1">
                added: {addedDate?.toDateString() || 'Unknown date'}
              </p>
            </div>
            <div className="flex flex-col m-3 p-1 bg-app-modal-xl-lighter rounded shadow">
              <div className="border-b-2 border-app-modal-xl-background text-center font-bold py-2">
                {currentSound?.soundInfoData?.dontChangePitch
                  ? 'Pitch kept'
                  : 'Natural pitch'}
              </div>
              <div className="flex flex-row py-2">
                <ValueDisplayer
                  className="flex-1 h-20"
                  Svg={SpeedSVG}
                  name="Speed"
                  percentage={50}
                  basePercentage={50}
                />
                <ValueDisplayer
                  className="flex-1 h-20"
                  Svg={ReverbSVG}
                  name="Reverb"
                  percentage={50}
                />
                <ValueDisplayer
                  className="flex-1 h-20"
                  Svg={LowpassSVG}
                  name="Distance"
                  percentage={50}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewSongModal;
