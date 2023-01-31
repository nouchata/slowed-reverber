import { useContext, useEffect, useMemo, useState } from 'react';

import { Meta } from '@/layouts/Meta';
import LowpassSVG from '@/svgs/app/addSong/editValues/Lowpass';
import ReverbSVG from '@/svgs/app/addSong/editValues/Reverb';
import SpeedSVG from '@/svgs/app/addSong/editValues/Speed';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import { EAppModalState } from '@/utils/interfaces/AppModalState';
import SoundsManager from '@/utils/SoundModule/SoundsManager';
import valuesBreakpoints from '@/utils/valuesBreakpoints';

import AppModalsCriticalError from '../../AppModalsCriticalError';
import XlModalHeader from '../layout/XlModalHeader';
import ModalXlLoading from '../ModalXlLoading';
import VisualDataPreview from '../VisualDataPreview';
import ValueDisplayer from './components/ValueDisplayer';

enum EDeleteBtnState {
  NOT_PRESSED,
  PRESSED_ONE,
  CONFIRMED,
}

const ViewSongModal = () => {
  const [modalState, setModalState] = useState<{
    state: EAppModalState;
    error?: string;
  }>({ state: EAppModalState.LOADING });
  const { isCurrentSoundReady, currentSound, soundsManager } =
    useContext(SoundsManagerContext);
  const { appData, setAppData } = useContext(AppDataContext);
  const { router } = appData!;
  /* memo are used to prevent redudant calls to util function whenever
   * react updates the dom */
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
  const processedPercentage = useMemo(() => {
    return {
      speed: currentSound?.soundInfoData?.speedValue
        ? Math.round(
            SoundsManager.valueConverter(
              'speed',
              currentSound.soundInfoData.speedValue,
              false
            ) * 10
          ) / 10
        : undefined,
      reverb: currentSound?.soundInfoData?.reverbEffectValue
        ? Math.round(
            SoundsManager.valueConverter(
              'reverb',
              currentSound.soundInfoData.reverbEffectValue,
              false
            ) * 10
          ) / 10
        : undefined,
      distance: currentSound?.soundInfoData?.lowKeyEffectValue
        ? Math.round(
            SoundsManager.valueConverter(
              'distance',
              currentSound.soundInfoData.lowKeyEffectValue,
              false
            ) * 10
          ) / 10
        : undefined,
    };
  }, [currentSound?.soundInfoData]);

  /* delete button state */
  const [deleteBtnState, setDeleteBtnState] = useState<EDeleteBtnState>(
    EDeleteBtnState.NOT_PRESSED
  );
  useEffect(() => {
    let timeout: any = 0;
    /* shows the confirm message */
    if (deleteBtnState === EDeleteBtnState.PRESSED_ONE)
      timeout = setTimeout(
        () => setDeleteBtnState(EDeleteBtnState.NOT_PRESSED),
        1500
      );
    /* deletes the sound */ else if (
      deleteBtnState === EDeleteBtnState.CONFIRMED
    )
      soundsManager
        ?.deleteCurrentSound()
        .then(() => {
          router.push('/app/songs');
        })
        .catch((reason) => {
          setAppData!({
            error: { type: 'normal', value: reason.message },
          });
          setDeleteBtnState(EDeleteBtnState.NOT_PRESSED);
        });

    return () => clearTimeout(timeout);
  }, [deleteBtnState]);

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
      /* song loading */
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
      <Meta
        title={`${
          currentSound?.soundInfoData?.name
            ? `${currentSound?.soundInfoData?.name}`
            : 'View song'
        } - Slowed Reverber`}
        description={'Global view of the current song'}
      ></Meta>
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
          className="relative overflow-visible flex-1 w-full h-[calc(100%-50px)] flex flex-nowrap transition-transform"
        >
          <div className="flex-[0_0_100%] overflow-auto pb-20 flex flex-col text-white select-none">
            <div className="relative flex flex-col shrink-0 overflow-hidden bg-app-input-disabled py-8">
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
              <h3 className="overflow-hidden whitespace-nowrap text-ellipsis text-center z-10 text-3xl pt-1 px-2 font-extrabold">
                {currentSound?.soundInfoData?.name || 'Unknown title'}
              </h3>
              <h4 className="overflow-hidden whitespace-nowrap text-ellipsis text-center z-10 text-xl pb-1 px-2 font-thin">
                {currentSound?.soundInfoData?.author || 'Unknown author'}
              </h4>
              <p className="overflow-hidden whitespace-nowrap text-ellipsis text-center z-10 text-sm py-1">
                added: {addedDate?.toDateString() || 'Unknown date'}
              </p>
            </div>
            <div className="flex flex-col shrink-0 m-3 p-1 bg-app-modal-xl-lighter rounded shadow">
              <div className="border-b-2 border-app-modal-xl-background text-center font-bold py-2">
                {currentSound?.soundInfoData?.dontChangePitch
                  ? 'Pitch kept'
                  : 'Natural pitch'}
              </div>
              <div className="flex flex-row flex-wrap py-2">
                <ValueDisplayer
                  className="flex-[1_0_33%] h-20 overflow-hidden"
                  Svg={SpeedSVG}
                  name="Speed"
                  percentage={processedPercentage.speed ?? 50}
                  basePercentage={50}
                  breakpoints={valuesBreakpoints.speed}
                />
                <ValueDisplayer
                  className="flex-[1_0_33%] h-20 overflow-hidden"
                  Svg={ReverbSVG}
                  name="Reverb"
                  percentage={processedPercentage.reverb || 0}
                  breakpoints={valuesBreakpoints.reverb}
                />
                <ValueDisplayer
                  className="flex-[1_0_33%] narrow-width:flex-[0_0_100%] narrow-width:mt-3 h-20 overflow-hidden"
                  Svg={LowpassSVG}
                  name="Distance"
                  percentage={processedPercentage.distance || 0}
                  breakpoints={valuesBreakpoints.distance}
                />
              </div>
            </div>
            <div className="flex flex-row flex-wrap shrink-0 gap-2 py-2 px-3">
              <button
                disabled={deleteBtnState === EDeleteBtnState.CONFIRMED}
                className="bg-app-modal-xl-lighter flex-1 h-12 rounded shadow min-w-[40%] narrow-width:min-w-[80%] font-bold"
                onClick={() => {
                  if (currentSound?.soundInfoKey)
                    router.push({
                      pathname: '/app/songs',
                      query: { md: 'editSong', s: currentSound.soundInfoKey },
                    });
                }}
              >
                <span className="inline-block">
                  <span
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'%3E%3C/path%3E%3Cpolyline points='14 2 14 8 20 8'%3E%3C/polyline%3E%3Cline x1='16' y1='13' x2='8' y2='13'%3E%3C/line%3E%3Cline x1='16' y1='17' x2='8' y2='17'%3E%3C/line%3E%3Cpolyline points='10 9 9 9 8 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                    }}
                    className="inline px-3 bg-no-repeat bg-left bg-contain"
                  />
                  Edit song
                </span>
              </button>
              <button
                disabled={deleteBtnState === EDeleteBtnState.CONFIRMED}
                className="bg-app-modal-xl-lighter flex-1 h-12 rounded shadow min-w-[40%] narrow-width:min-w-[80%] font-bold"
                onClick={() => {
                  if (currentSound?.soundInfoKey)
                    router.push({
                      pathname: '/app/songs',
                      query: { md: 'editVisual', s: currentSound.soundInfoKey },
                    });
                }}
              >
                <span className="inline-block">
                  <span
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E")`,
                    }}
                    className="inline px-3 bg-no-repeat bg-left bg-contain"
                  />
                  Edit visual
                </span>
              </button>
              <button
                disabled={deleteBtnState === EDeleteBtnState.CONFIRMED}
                className="bg-green-600 flex-1 h-12 rounded shadow min-w-[40%] narrow-width:min-w-[80%] font-bold"
                onClick={() => {
                  if (currentSound?.soundInfoKey)
                    router.push({
                      pathname: '/app/songs',
                      query: {
                        md: 'exportMedia',
                        s: currentSound.soundInfoKey,
                      },
                    });
                }}
              >
                <span className="inline-block">
                  <span
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z'%3E%3C/path%3E%3Cpolyline points='17 21 17 13 7 13 7 21'%3E%3C/polyline%3E%3Cpolyline points='7 3 7 8 15 8'%3E%3C/polyline%3E%3C/svg%3E")`,
                    }}
                    className="inline px-3 bg-no-repeat bg-left bg-contain"
                  />
                  Export
                </span>
              </button>
              <button
                disabled={deleteBtnState === EDeleteBtnState.CONFIRMED}
                className="bg-red-800 flex-1 h-12 rounded shadow min-w-[40%] narrow-width:min-w-[80%] font-bold"
                onClick={() => {
                  if (deleteBtnState !== EDeleteBtnState.CONFIRMED)
                    setDeleteBtnState(deleteBtnState + 1);
                }}
              >
                <span className="inline-block">
                  {deleteBtnState === EDeleteBtnState.NOT_PRESSED && (
                    <>
                      <span
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='3 6 5 6 21 6'%3E%3C/polyline%3E%3Cpath d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'%3E%3C/path%3E%3Cline x1='10' y1='11' x2='10' y2='17'%3E%3C/line%3E%3Cline x1='14' y1='11' x2='14' y2='17'%3E%3C/line%3E%3C/svg%3E")`,
                        }}
                        className="inline px-3 bg-no-repeat bg-left bg-contain"
                      />
                      Delete
                    </>
                  )}
                  {deleteBtnState !== EDeleteBtnState.NOT_PRESSED && 'Confirm?'}
                </span>
              </button>
            </div>
          </div>
          {deleteBtnState === EDeleteBtnState.CONFIRMED && (
            <div className="absolute top-0 left-0 w-full h-full bg-black/60 z-10 flex justify-center items-center">
              <img
                className="h-16 animate-spin"
                alt="Loading..."
                src={`data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='2' x2='12' y2='6'%3E%3C/line%3E%3Cline x1='12' y1='18' x2='12' y2='22'%3E%3C/line%3E%3Cline x1='4.93' y1='4.93' x2='7.76' y2='7.76'%3E%3C/line%3E%3Cline x1='16.24' y1='16.24' x2='19.07' y2='19.07'%3E%3C/line%3E%3Cline x1='2' y1='12' x2='6' y2='12'%3E%3C/line%3E%3Cline x1='18' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cline x1='4.93' y1='19.07' x2='7.76' y2='16.24'%3E%3C/line%3E%3Cline x1='16.24' y1='7.76' x2='19.07' y2='4.93'%3E%3C/line%3E%3C/svg%3E`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewSongModal;
