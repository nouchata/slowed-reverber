import { useContext, useEffect, useRef, useState } from 'react';

import NewFileSVG from '@/svgs/app/addSong/NewFile';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import type { IAppModalPaneProps } from '@/utils/interfaces/AppModalState';
import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

enum EInputFileState {
  WAITING_FOR_FILE,
  PROCESSING,
  DONE,
}

const buttonText = [
  'Click or drag-and-drop a file here',
  'Currently processing the file ...',
  'Processing done',
];

const InjectNewFile = (
  props: IStylePropsInterface &
    IAppModalPaneProps & {
      successCallback: Function;
      processCallback: (file: File) => Promise<any>;
      fileTypes: Array<string>;
    }
) => {
  const { appData, setAppData } = useContext(AppDataContext);

  const [processingFileState, setProcessingFileState] = useState(
    props.isActive ? EInputFileState.WAITING_FOR_FILE : EInputFileState.DONE
  );

  const [givenFile, setGivenFile] = useState<any>(undefined);

  const inputFileRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  /* a simple way to know to count the dragenter/leave events since they
   * retrigger each time they're passing on a new child elem */
  const enterAndLeaveEventCount = useRef(0);

  useEffect(() => {
    /* input spoofer since the input element can't really be customized */
    buttonRef.current!.onclick = function onclick() {
      inputFileRef.current!.click();
    };
  }, []);
  /* button's ondrop have huge flaws w/ setstate handling so i'm exporting
   * the logic here since it seems to be the only way to make it work w/ it */
  useEffect(() => {
    /* undefined is used for the initial state, null stands for no file given */
    if (givenFile === undefined) return;
    if (!givenFile) {
      setAppData!({
        error: { type: 'normal', value: 'You need to provide a file' },
      });
      setProcessingFileState(EInputFileState.WAITING_FOR_FILE);
      setGivenFile(undefined);
      return;
    }
    if (!props.fileTypes.find((value) => givenFile.type.includes(value))) {
      setAppData!({
        error: {
          type: 'normal',
          value: `You need to provide an ${props.fileTypes.join('/')} file`,
        },
      });
      setProcessingFileState(EInputFileState.WAITING_FOR_FILE);
      setGivenFile(undefined);
      return;
    }
    (async () => {
      await props
        .processCallback(givenFile)
        .then(() => {
          setProcessingFileState(EInputFileState.DONE);
          props.successCallback();
        })
        .catch((reason) => {
          /* error handling if addFile fails */
          setAppData!({
            error: { type: 'normal', value: reason.message },
          });
          setProcessingFileState(EInputFileState.WAITING_FOR_FILE);
          setGivenFile(undefined);
        });
    })();
  }, [givenFile]);
  useEffect(() => {
    /* can't do that inline w/ className bc in case of
     * direct-dragging over the button it causes issues w/ the react
     * revamp / bubbling thing */
    if (appData!.fileDragAndDrop && !processingFileState)
      buttonRef.current!.classList.add('outline-dashed');
    else buttonRef.current!.classList.remove('outline-dashed');
  }, [appData!.fileDragAndDrop]);
  return (
    <div className={`relative text-white ${props?.className}`}>
      <div className={`h-full w-full min-h-[400px]`}>
        <input
          ref={inputFileRef}
          type="file"
          accept="audio"
          className="absolute hidden"
          disabled={!!processingFileState}
          onChange={(e) => {
            if (!processingFileState) {
              setProcessingFileState(EInputFileState.PROCESSING);
              const fileList = (e.target as HTMLInputElement).files;
              if (!fileList) setGivenFile(null);
              else if (fileList[0]) setGivenFile(fileList[0]);
              else setProcessingFileState(EInputFileState.WAITING_FOR_FILE);
            }
            /* reset elem to reinput the same file in case of errors */
            (e.target as HTMLInputElement).value = '';
          }}
        />
        <button
          ref={buttonRef}
          className={`w-full h-full flex flex-col justify-center gap-4 items-center -outline-offset-2 outline-current outline-2`}
          disabled={!!processingFileState}
          onDragEnter={() => {
            if (!enterAndLeaveEventCount.current)
              buttonRef.current!.classList.add('text-app-primary-color');
            enterAndLeaveEventCount.current += 1;
          }}
          onDragLeave={() => {
            enterAndLeaveEventCount.current -= 1;
            if (!enterAndLeaveEventCount.current)
              buttonRef.current!.classList.remove('text-app-primary-color');
          }}
          onDrop={(e) => {
            enterAndLeaveEventCount.current -= 1;
            buttonRef.current!.classList.remove('text-app-primary-color');
            /* logic moved to givenfile useeffect */
            if (!processingFileState) {
              setProcessingFileState(EInputFileState.PROCESSING);
              setGivenFile(
                e.dataTransfer.items[0]
                  ? e.dataTransfer.items[0].getAsFile()
                  : null
              );
            }
          }}
        >
          <NewFileSVG
            animatePlusSign={processingFileState === EInputFileState.PROCESSING}
            valideFile={processingFileState === EInputFileState.DONE}
            className="flex-[0_0_40%] w-full stroke-1"
          />
          <strong>
            {appData?.fileDragAndDrop && !processingFileState
              ? 'Drop your file here'
              : buttonText[processingFileState]}
          </strong>
        </button>
      </div>
      {processingFileState === EInputFileState.DONE && (
        <div className="absolute w-full h-full top-0 left-0 bg-app-element-disabled opacity-50"></div>
      )}
    </div>
  );
};

export default InjectNewFile;
