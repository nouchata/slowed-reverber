import { useContext, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import type { IAppModalPaneProps } from '@/utils/interfaces/AppModalState';
import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';

import VisualDataPreview from '../../VisualDataPreview';

const SaveVisual = (
  props: IBasicPropsInterface &
    IAppModalPaneProps & {
      draftData?: Blob;
      successCallback: Function;
    }
) => {
  const [isSaving, setIsSaving] = useState(false);
  const { soundsManager } = useContext(SoundsManagerContext);
  const { setAppData } = useContext(AppDataContext);
  return (
    <div
      className={`${props.className} flex flex-col flex-nowrap items-center justify-center pb-20 phone-landscape:justify-start`}
    >
      <VisualDataPreview
        className={`text-app-input-border w-[40vh] h-[40vh] min-h-[150px] min-w-[150px] max-w-[80vw] outline-dashed outline-2 outline-offset-8 rounded my-6 ${
          !props.draftData || !props.isActive
            ? 'outline-app-input-border'
            : 'outline-amber-300'
        } ${
          !props.draftData || !props.isActive
            ? 'bg-transparent'
            : 'bg-amber-300/50'
        }`}
        isActive={props.isActive}
        blob={props.draftData}
      />
      <button
        className={`w-3/4 max-w-[40vh] min-w-[220px] flex-[0_0_50px] text-app-modal-xl-background rounded drop-shadow-md font-extrabold ${
          !props.draftData || !props.isActive || isSaving
            ? 'bg-app-input-border'
            : 'bg-amber-300'
        }`}
        disabled={!props.draftData || isSaving}
        onClick={() => {
          if (!props.draftData || isSaving) return;
          setIsSaving(true);
          (async () => {
            await soundsManager
              ?.updateVisualSource(
                await props.draftData!.arrayBuffer(),
                props.draftData!.type
              )
              .then(() => props.successCallback())
              .catch((reason) => {
                /* error handling if addFile fails */
                setAppData!({
                  error: { type: 'normal', value: reason.message },
                });
              });
            setIsSaving(false);
          })();
        }}
      >
        {(!props.draftData || !props.isActive) && 'Nothing to save for now'}
        {props.draftData && props.isActive && !isSaving && 'Save it !'}
        {props.draftData && props.isActive && isSaving && (
          <img
            className="animate-spin w-[40px] h-[40px] m-auto"
            src={`data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='2' x2='12' y2='6'%3E%3C/line%3E%3Cline x1='12' y1='18' x2='12' y2='22'%3E%3C/line%3E%3Cline x1='4.93' y1='4.93' x2='7.76' y2='7.76'%3E%3C/line%3E%3Cline x1='16.24' y1='16.24' x2='19.07' y2='19.07'%3E%3C/line%3E%3Cline x1='2' y1='12' x2='6' y2='12'%3E%3C/line%3E%3Cline x1='18' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cline x1='4.93' y1='19.07' x2='7.76' y2='16.24'%3E%3C/line%3E%3Cline x1='16.24' y1='7.76' x2='19.07' y2='4.93'%3E%3C/line%3E%3C/svg%3E`}
            alt="Saving ..."
          />
        )}
      </button>
    </div>
  );
};

export default SaveVisual;
