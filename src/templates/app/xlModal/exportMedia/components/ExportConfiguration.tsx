import type { Dispatch, SetStateAction } from 'react';
import { useContext, useMemo, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import type { IAppModalPaneProps } from '@/utils/interfaces/AppModalState';
import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import { EExportChoices } from '@/utils/interfaces/ExportChoicesEnum';
import { EEncoderState } from '@/utils/interfaces/SoundsManagerInterfaces';

import VisualDataPreview from '../../VisualDataPreview';
import ExportConfigurationChoices from './ExportConfigurationChoices';

const ExportConfiguration = (
  props: IBasicPropsInterface &
    IAppModalPaneProps & {
      exportChoice: EExportChoices;
      setExportChoice: Dispatch<SetStateAction<EExportChoices>>;
    }
) => {
  const { encoderState, currentSound } = useContext(SoundsManagerContext);
  const { appData, setAppData } = useContext(AppDataContext);
  const { router } = appData!;
  const [exportType, setExportType] = useState<'audio' | 'video'>('audio');
  const visualBlob = useMemo(() => {
    return currentSound?.visualSourceData?.data
      ? new Blob([currentSound?.visualSourceData?.data], {
          type: currentSound?.visualSourceData?.type,
        })
      : undefined;
  }, [currentSound?.visualSourceData?.data]);
  return (
    <div
      className={`${props.className} flex flex-col items-center pb-20 select-none text-white`}
    >
      <div className="p-3 w-full flex-[0_0_auto] flex gap-5 justify-center">
        <VisualDataPreview
          className="flex-[0_0_auto] w-[10vh] h-[10vh] min-h-[70px] min-w-[70px] max-h-[120px] max-w-[120px] outline-dashed outline-2 outline-offset-8 mr-3 rounded"
          blob={visualBlob}
        />
        <div className="flex-initial h-full overflow-hidden flex flex-col justify-center">
          <h3 className="font-extrabold text-2xl overflow-hidden text-ellipsis whitespace-nowrap">
            {currentSound?.soundInfoData?.name || 'Unknown song name'}
          </h3>
          <h4 className="italic font-extralight text-lg overflow-hidden text-ellipsis whitespace-nowrap">
            {currentSound?.soundInfoData?.author || 'Unknown author'}
          </h4>
        </div>
      </div>
      <p className="w-11/12 py-2 text-center flex flex-col">
        {encoderState === EEncoderState.LOADING && (
          <>
            <span className="font-extrabold animate-pulse">
              Encoder still loading...
            </span>
            <span className="text-xs font-light">
              Your export choices are restricted until then
            </span>
          </>
        )}
        {encoderState === EEncoderState.ERROR && (
          <>
            <span className="font-extrabold text-red-700">
              {`The encoder hasn't loaded properly`}
            </span>
            <span className="text-xs font-light text-red-100">
              You can only extract raw edited song
            </span>
          </>
        )}
        {encoderState === EEncoderState.LOADED && (
          <span className="font-extrabold text-amber-400">Encoder loaded</span>
        )}
      </p>
      <div className="relative w-11/12 flex-[0_0_40px] my-5 box-border flex flex-row flex-nowrap items-center bg-app-input-bg rounded drop-shadow-md hover:outline-2 hover:outline-app-input-border hover:outline hover:outline-offset-1">
        <button
          className={`flex-1 h-full text-sm hover:bg-white/5 ${
            exportType === 'audio' ? 'font-extrabold' : ''
          }`}
          onClick={() => {
            if (exportType !== 'audio') {
              props.setExportChoice(EExportChoices.NO_CHOICE);
              setExportType('audio');
            }
          }}
          disabled={!props.isActive}
        >
          Audio export
        </button>
        <div className="w-[1px] h-5/6 bg-app-modal-xl-background"></div>
        <button
          className={`flex-1 flex flex-wrap justify-center content-center h-full text-sm hover:bg-white/5 ${
            exportType === 'video' ? 'font-extrabold' : ''
          }`}
          onClick={() => {
            if (exportType !== 'video') {
              props.setExportChoice(EExportChoices.NO_CHOICE);
              setExportType('video');
            }
            /* redirects the user to the visual input modal if there isn't an asset */
            if (!currentSound?.visualSourceData?.data) {
              setAppData!({
                error: {
                  type: 'normal',
                  value:
                    'To export a video, you first need to input a visual asset',
                },
              });
              router.push({
                pathname: '/app/songs',
                query: { md: 'editVisual', s: currentSound?.soundInfoKey },
              });
            }
          }}
          disabled={!props.isActive}
        >
          Video export
        </button>
        {!props.isActive && (
          <div className="absolute w-full h-full top-0 left-0 rounded bg-app-element-disabled opacity-50"></div>
        )}
      </div>
      <ExportConfigurationChoices
        className="relative w-11/12 flex-[0_0_200px] my-5"
        exportChoice={props.exportChoice}
        setExportChoice={props.setExportChoice}
        type={exportType}
        isActive={props.isActive}
        isEncoderLoaded={encoderState === EEncoderState.LOADED}
      />
    </div>
  );
};

export default ExportConfiguration;
