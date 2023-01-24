import type { Dispatch, SetStateAction } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import { EExportChoices } from '@/utils/interfaces/ExportChoicesEnum';

const ExportConfigurationChoices = (
  props: IStylePropsInterface & {
    isActive: boolean;
    type: 'audio' | 'video';
    exportChoice: EExportChoices;
    setExportChoice: Dispatch<SetStateAction<EExportChoices>>;
    isEncoderLoaded: boolean;
  }
) => {
  if (props.type === 'video')
    return (
      <div
        className={`${props.className} box-border flex flex-row flex-nowrap items-center bg-app-input-bg rounded drop-shadow-md hover:outline-2 hover:outline-app-input-border hover:outline hover:outline-offset-1`}
      >
        <button
          className={`box-border flex flex-col items-center justify-center flex-1 h-full p-1 text-sm hover:bg-white/5 disabled:hover:bg-transparent disabled:bg-app-element-disabled-faded disabled:text-gray-600 font-bold ${
            props.exportChoice === EExportChoices.TO_MP4
              ? 'font-extrabold bg-white/5  '
              : ''
          }`}
          disabled={!props.isActive || !props.isEncoderLoaded}
          onClick={() => {
            props.setExportChoice(EExportChoices.TO_MP4);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`flex-[0_1_70px] ${
              props.exportChoice === EExportChoices.TO_MP4 ? 'fill-current' : ''
            }`}
          >
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <p className="overflow-hidden flex flex-col">
            <span>Export MP4</span>
            <span className="text-xs font-light">(most compatible)</span>
          </p>
        </button>
        <div className="bg-app-modal-xl-background h-5/6 w-[1px]"></div>
        <button
          className={`box-border flex flex-col items-center justify-center flex-1 h-full p-1 text-sm hover:bg-white/5 disabled:hover:bg-transparent disabled:bg-app-element-disabled-faded disabled:text-gray-600 font-bold ${
            props.exportChoice === EExportChoices.TO_WEBM
              ? 'font-extrabold bg-white/5  '
              : ''
          }`}
          disabled={!props.isActive || !props.isEncoderLoaded}
          onClick={() => {
            props.setExportChoice(EExportChoices.TO_WEBM);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-[0_1_70px]"
          >
            <path
              className={
                props.exportChoice === EExportChoices.TO_WEBM
                  ? 'fill-current'
                  : ''
              }
              d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"
            ></path>
            <polygon
              className={
                props.exportChoice === EExportChoices.TO_WEBM
                  ? 'fill-app-input-bg stroke-app-input-bg'
                  : ''
              }
              points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"
            ></polygon>
          </svg>
          <p className="overflow-hidden flex flex-col">
            <span>Export WEBM</span>
            <span className="text-xs font-light">(lightweight)</span>
          </p>
        </button>
        {!props.isActive && (
          <div className="absolute w-full h-full top-0 left-0 rounded bg-app-element-disabled opacity-50"></div>
        )}
      </div>
    );
  return (
    <div
      className={`${props.className} box-border flex flex-col flex-nowrap items-center bg-app-input-bg rounded drop-shadow-md hover:outline-2 hover:outline-app-input-border hover:outline hover:outline-offset-1`}
    >
      <button
        className={`box-border flex flex-col items-center justify-center flex-1 w-full text-sm hover:bg-white/5 disabled:hover:bg-transparent disabled:bg-app-element-disabled-faded disabled:text-gray-600 font-bold ${
          props.exportChoice === EExportChoices.TO_RAW_AUDIO
            ? 'font-extrabold bg-white/5  '
            : ''
        }`}
        disabled={!props.isActive}
        onClick={() => {
          props.setExportChoice(EExportChoices.TO_RAW_AUDIO);
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="flex-[0_1_50px]"
        >
          <circle
            className={
              props.exportChoice === EExportChoices.TO_RAW_AUDIO
                ? 'fill-current'
                : ''
            }
            cx="12"
            cy="12"
            r="10"
          ></circle>
          <circle
            className={
              props.exportChoice === EExportChoices.TO_RAW_AUDIO
                ? 'fill-current stroke-app-input-bg'
                : ''
            }
            cx="12"
            cy="12"
            r="3"
          ></circle>
        </svg>
        <p className="overflow-hidden flex flex-col">
          <span>Export raw data</span>
          <span className="text-xs font-light">(.wav format)</span>
        </p>
      </button>
      <div className="bg-app-modal-xl-background w-5/6 h-[1px]"></div>
      <div className="flex-1 flex flex-row flex-nowrap w-full">
        <button
          className={`box-border flex flex-col items-center justify-center flex-1 w-full p-1 text-sm hover:bg-white/5 disabled:hover:bg-transparent disabled:bg-app-element-disabled-faded disabled:text-gray-600 font-bold ${
            props.exportChoice === EExportChoices.TO_MP3
              ? 'font-extrabold bg-white/5  '
              : ''
          }`}
          disabled={!props.isActive || !props.isEncoderLoaded}
          onClick={() => {
            props.setExportChoice(EExportChoices.TO_MP3);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-[0_1_50px]"
          >
            <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
            <path
              className={
                props.exportChoice === EExportChoices.TO_MP3
                  ? 'fill-current'
                  : ''
              }
              d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"
            ></path>
          </svg>
          <p className="overflow-hidden flex flex-col">
            <span>Export MP3</span>
            <span className="text-xs font-light">(most common)</span>
          </p>
        </button>
        <div className="bg-app-modal-xl-background h-5/6 w-[1px]"></div>
        <button
          className={`box-border flex flex-col items-center justify-center flex-1 w-full p-1 text-sm hover:bg-white/5 disabled:hover:bg-transparent disabled:bg-app-element-disabled-faded disabled:text-gray-600 font-bold ${
            props.exportChoice === EExportChoices.TO_AAC
              ? 'font-extrabold bg-white/5  '
              : ''
          }`}
          disabled={!props.isActive || !props.isEncoderLoaded}
          onClick={() => {
            props.setExportChoice(EExportChoices.TO_AAC);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="flex-[0_1_50px]"
          >
            <rect
              className={
                props.exportChoice === EExportChoices.TO_AAC
                  ? 'fill-current'
                  : ''
              }
              x="4"
              y="2"
              width="16"
              height="20"
              rx="2"
              ry="2"
            ></rect>
            <circle
              className={
                props.exportChoice === EExportChoices.TO_AAC
                  ? 'stroke-app-input-bg'
                  : ''
              }
              cx="12"
              cy="14"
              r="4"
            ></circle>
            <line
              className={
                props.exportChoice === EExportChoices.TO_AAC
                  ? 'stroke-app-input-bg stroke-[3]'
                  : ''
              }
              x1="12"
              y1="6"
              x2="12.01"
              y2="6"
            ></line>
          </svg>
          <p className="overflow-hidden flex flex-col">
            <span>Export AAC</span>
            <span className="text-xs font-light">(better quality)</span>
          </p>
        </button>
      </div>
      {!props.isActive && (
        <div className="absolute w-full h-full top-0 left-0 rounded bg-app-element-disabled opacity-50"></div>
      )}
    </div>
  );
};

export default ExportConfigurationChoices;
