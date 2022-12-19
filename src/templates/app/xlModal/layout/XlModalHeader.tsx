import type { Dispatch, SetStateAction } from 'react';
import { useContext } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';

type XlModalHeaderProps = {
  aButtonIsPressed: boolean;
  setAButtonIsPressed: Dispatch<SetStateAction<boolean>>;
  previousBtnCallback?: () => Promise<boolean>;
  nextBtnCallback?: () => Promise<boolean>;
  currentPaneState: number;
  lastPaneState?: number;
  setPaneState: Dispatch<SetStateAction<number>>;
  buttonAvailability: [boolean, boolean];
  title: string;
};

const XlModalHeader = (props: XlModalHeaderProps) => {
  const { router, oldRoutes } = useContext(AppDataContext).appData!;
  return (
    <header className="w-full flex-[0_0_50px] flex flex-nowrap select-none">
      <button
        className={`flex-[0_0_20%] text-white text-xs overflow-hidden ${
          props.buttonAvailability[0] ? 'visible' : 'invisible'
        }`}
        disabled={props.aButtonIsPressed || !props.buttonAvailability[0]}
        onClick={() => {
          if (props.aButtonIsPressed) return;
          props.setAButtonIsPressed(true);
          (async () => {
            if (props.previousBtnCallback) {
              const returnValue = await props.previousBtnCallback();
              if (returnValue) {
                props.setPaneState(props.currentPaneState - 1);
              }
            } else {
              props.setPaneState(props.currentPaneState - 1);
            }
            props.setAButtonIsPressed(false);
          })();
        }}
      >
        <span className="inline-block">
          <span
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' y1='12' x2='5' y2='12'%3E%3C/line%3E%3Cpolyline points='12 19 5 12 12 5'%3E%3C/polyline%3E%3C/svg%3E")`,
            }}
            className="inline px-2 bg-no-repeat bg-left bg-contain"
          />
          Previous
        </span>
      </button>
      <h2 className="flex-1 flex justify-center items-center text-lg font-bold text-white">
        {props.title}
      </h2>
      <button
        className={`flex-[0_0_20%] text-white text-xs overflow-hidden ${
          props.buttonAvailability[1] || false ? 'visible' : 'invisible'
        }`}
        disabled={props.aButtonIsPressed || !props.buttonAvailability[1]}
        onClick={() => {
          if (!props.nextBtnCallback || props.aButtonIsPressed) return;
          props.setAButtonIsPressed(true);
          (async () => {
            const returnValue = await props.nextBtnCallback!();
            if (returnValue) {
              if (
                props.lastPaneState === undefined ||
                props.currentPaneState !== props.lastPaneState
              )
                props.setPaneState(props.currentPaneState + 1);
              else
                router.push(
                  oldRoutes.length
                    ? oldRoutes[oldRoutes.length - 1]!.asPath
                    : '/app/songs'
                );
            }
            props.setAButtonIsPressed(false);
          })();
        }}
      >
        <span className="inline-block">
          {props.lastPaneState === undefined ||
          props.currentPaneState !== props.lastPaneState
            ? 'Next'
            : 'Save'}
          <span
            style={{
              backgroundImage:
                props.lastPaneState === undefined ||
                props.currentPaneState !== props.lastPaneState
                  ? `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3Cpolyline points='12 5 19 12 12 19'%3E%3C/polyline%3E%3C/svg%3E")`
                  : `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E")`,
            }}
            className="inline px-2 bg-no-repeat bg-right bg-contain"
          />
        </span>
      </button>
    </header>
  );
};

export default XlModalHeader;
