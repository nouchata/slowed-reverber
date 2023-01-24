import type { Reducer } from 'react';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';

import ExtractFromDatabaseSVG from '@/svgs/app/exportMedia/ExtractFromDatabase';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import type { IAppModalPaneProps } from '@/utils/interfaces/AppModalState';
import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import { EExportChoices } from '@/utils/interfaces/ExportChoicesEnum';
import { EEncoderState } from '@/utils/interfaces/SoundsManagerInterfaces';
import encoderExtensions from '@/utils/SoundModule/encoderExtensions';

function filenameFormatter(author?: string, name?: string, extension?: string) {
  let formatted = '';
  if (author) formatted += `${author} - `;
  formatted += `${name || 'Unknown song'}.${extension || 'media'}`;
  return formatted;
}

export type IProgressVarsArgs = {
  progress?: number;
  consoleEntry?: { type: 'normal' | 'error' | 'success'; entry: string };
};

const exportSteps = ['Raw audio process', 'Custom export'];

const ExportExecution = (
  props: IBasicPropsInterface &
    IAppModalPaneProps & {
      exportChoice: EExportChoices;
    }
) => {
  const [media, setMedia] = useState<{ blob: Blob; link: string }>();
  const consoleRef = useRef<HTMLDivElement & { consoleRunning: boolean }>(null);
  const { soundsManager, isSoundsManagerInit, encoderState, currentSound } =
    useContext(SoundsManagerContext);
  const { setAppData } = useContext(AppDataContext);
  const [progressVars, setProgressVars] = useReducer<
    Reducer<{ progress: number; stepCount: number }, IProgressVarsArgs>
  >(
    (prevState, newState) => {
      /* progress bar value update */
      const newValues: { progress: number; stepCount: number } = {
        progress: newState.progress || prevState.progress,
        stepCount: prevState.stepCount,
      };
      if (newValues.progress === 1) {
        newValues.progress = 0;
        newValues.stepCount += 1;
      }

      /* console update */
      if (consoleRef.current && newState.consoleEntry) {
        let { entry } = newState.consoleEntry;
        /* styling */
        if (newState.consoleEntry.type !== 'normal') {
          entry = `<span style="color: ${
            newState.consoleEntry.type === 'error' ? 'red' : 'green'
          };">${entry}</span>`;
        }

        /* newline addition */
        if ((consoleRef.current.firstChild! as HTMLElement).innerHTML.length)
          (consoleRef.current.firstChild! as HTMLElement).innerHTML += '<br />';
        (consoleRef.current.firstChild! as HTMLElement).innerHTML += entry;
        /* then scroll to the end */
        consoleRef.current.scrollTo(0, consoleRef.current.scrollHeight);
      }

      return newValues;
    },
    { progress: 0, stepCount: 0 }
  );

  useEffect(() => {
    (async () => {
      if (
        consoleRef.current &&
        props.isActive &&
        isSoundsManagerInit &&
        encoderState === EEncoderState.LOADED &&
        props.exportChoice !== EExportChoices.NO_CHOICE &&
        !consoleRef.current.consoleRunning
      ) {
        /* no re-run flag */
        consoleRef.current.consoleRunning = true;
        /* rendering a raw audio file w/ the filters */
        const rawSong = await soundsManager!
          .exportSong(setProgressVars)
          .catch((reason) =>
            setProgressVars({
              consoleEntry: { type: 'error', entry: reason.message },
            })
          );
        /* encoder part if needed */
        if (rawSong && props.exportChoice !== EExportChoices.TO_RAW_AUDIO) {
          const blob = await soundsManager!
            .encoderUtils(
              await rawSong.arrayBuffer(),
              props.exportChoice,
              setProgressVars
            )
            .catch((reason) =>
              setProgressVars({
                consoleEntry: { type: 'error', entry: reason.message },
              })
            );
          if (blob) setMedia({ blob, link: URL.createObjectURL(blob) });
        }
        if (rawSong && props.exportChoice === EExportChoices.TO_RAW_AUDIO)
          setMedia({ blob: rawSong, link: URL.createObjectURL(rawSong) });
      }
    })();
  }, [
    props.isActive,
    props.exportChoice,
    consoleRef.current,
    isSoundsManagerInit,
    encoderState,
  ]);

  return (
    <div
      className={`${props.className} flex flex-col flex-nowrap items-center pb-20 select-none text-white`}
    >
      <ExtractFromDatabaseSVG
        className=" w-full flex-[0_0_120px]"
        fillColor="22252A"
      />
      <h3 className="font-extrabold text-lg my-3">
        {progressVars.stepCount <
          (props.exportChoice === EExportChoices.TO_RAW_AUDIO ? 1 : 2) &&
          `Step ${progressVars.stepCount + 1}/${
            props.exportChoice === EExportChoices.TO_RAW_AUDIO ? 1 : 2
          } - ${exportSteps[progressVars.stepCount]}`}
        {progressVars.stepCount >=
          (props.exportChoice === EExportChoices.TO_RAW_AUDIO ? 1 : 2) &&
          'Done'}
      </h3>
      {!media && (
        <div
          id="export-progress"
          className="w-11/12 flex-[0_0_20px] my-3 border-white border-2 rounded"
        >
          <div
            className="w-full h-full transition-all bg-white"
            style={{
              transformOrigin: 'left',
              transform: `scaleX(${progressVars.progress})`,
            }}
          ></div>
        </div>
      )}
      <div
        className={`box-border w-11/12 overflow-hidden flex-[0_0_400px] p-2 bg-slate-900 shadow-inner rounded transition-colors`}
      >
        <div
          ref={consoleRef}
          className={`relative w-full h-full overflow-hidden font-mono text-sm break-words`}
        >
          {!media && (
            <>
              <span></span>
              <span className="animate-inline-blink">_</span>
            </>
          )}
          {media && (
            <div className="absolute top-0 left-0 w-full h-full flex flex-col gap-2">
              <div className="relative flex-[0_0_80%] flex justify-center items-center">
                {media.blob.type.includes('audio') && (
                  <audio controls={true} src={media.link} />
                )}
                {media.blob.type.includes('video') && (
                  <video
                    className="absolute top-0 left-0 w-full h-full"
                    controls={true}
                    src={media.link}
                  />
                )}
              </div>
              <div className="flex-1 flex gap-2">
                <a
                  className="flex-1 flex justify-center items-center cursor-pointer no-underline"
                  href={media.link}
                  download={filenameFormatter(
                    currentSound?.soundInfoData?.author,
                    currentSound?.soundInfoData?.name,
                    encoderExtensions[props.exportChoice]
                  )}
                >
                  <img
                    className="h-10"
                    alt="Download"
                    src={`data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'%3E%3C/path%3E%3Cpolyline points='7 10 12 15 17 10'%3E%3C/polyline%3E%3Cline x1='12' y1='15' x2='12' y2='3'%3E%3C/line%3E%3C/svg%3E`}
                  />
                </a>
                <button
                  className="flex-1 flex justify-center items-center"
                  onClick={() => {
                    const name = filenameFormatter(
                      currentSound?.soundInfoData?.author,
                      currentSound?.soundInfoData?.name,
                      encoderExtensions[props.exportChoice]
                    );
                    /* data format */
                    const data = {
                      files: [
                        new File([media.blob], name, {
                          type: media.blob.type,
                        }),
                      ],
                      title: name,
                    };
                    /* share api */
                    if (navigator.canShare && navigator.canShare(data)) {
                      navigator.share(data);
                    } else {
                      setAppData!({
                        error: {
                          type: 'normal',
                          value:
                            'The share function is not available with your configuration',
                        },
                      });
                    }
                  }}
                >
                  <img
                    className="h-10"
                    alt="Share"
                    src={`data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='18' cy='5' r='3'%3E%3C/circle%3E%3Ccircle cx='6' cy='12' r='3'%3E%3C/circle%3E%3Ccircle cx='18' cy='19' r='3'%3E%3C/circle%3E%3Cline x1='8.59' y1='13.51' x2='15.42' y2='17.49'%3E%3C/line%3E%3Cline x1='15.41' y1='6.51' x2='8.59' y2='10.49'%3E%3C/line%3E%3C/svg%3E`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportExecution;
