import type { Dispatch, SetStateAction } from 'react';
import { useContext, useEffect, useRef } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

const EditStrings = (
  props: IStylePropsInterface & {
    setNextCallback?: Dispatch<
      SetStateAction<(() => Promise<boolean>) | undefined>
    >;
    isActive: boolean;
  }
) => {
  const { isCurrentSoundReady, currentSound, soundsManager } =
    useContext(SoundsManagerContext);
  const { setAppData } = useContext(AppDataContext);
  const inputTitleRef = useRef<HTMLInputElement>(null);
  const inputAuthorRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputTitleRef.current)
      inputTitleRef.current.value = currentSound?.soundInfoData?.name || '';
    const callback = () => {
      return async () => {
        if (!inputTitleRef.current?.value.length) {
          setAppData!({
            error: { type: 'normal', value: 'You must at least input a title' },
          });
          return false;
        }
        let wentWell = true;
        await soundsManager!
          .updateCurrentSound({
            ...currentSound?.soundInfoData,
            name: inputTitleRef.current.value,
            author: inputAuthorRef.current?.value,
          })
          .catch((reason) => {
            setAppData!({
              error: { type: 'normal', value: reason.message },
            });
            wentWell = false;
          });
        return wentWell;
      };
    };
    if (props.setNextCallback) props.setNextCallback(callback);
  }, [currentSound, inputTitleRef, inputAuthorRef]);
  return (
    <form
      className={`${props.className} pb-20 p-2 flex flex-col justify-start text-white`}
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div className="flex-[0_0_80px] flex flex-col">
        <label htmlFor="editStringTitle" className="text-sm">
          Title: <span className="text-red-600">*</span>
        </label>
        <input
          ref={inputTitleRef}
          className="box-border flex-1 m-1 px-4 bg-app-input-bg text-2xl font-bold rounded drop-shadow-md focus:outline-2 focus:outline-app-input-border focus:outline focus:outline-offset-1 invalid:outline-2 invalid:outline-red-800 invalid:outline invalid:outline-offset-1 disabled:bg-app-input-disabled placeholder:italic placeholder:font-semibold"
          type="text"
          name="title"
          id="editStringTitle"
          required={true}
          placeholder="Song title"
          disabled={!isCurrentSoundReady || !props.isActive}
        />
      </div>
      <div className="flex-[0_0_80px] flex flex-col">
        <label htmlFor="editStringAuthor" className="text-sm">
          Author:
        </label>
        <input
          ref={inputAuthorRef}
          className="box-border flex-1 m-1 px-4 bg-app-input-bg text-xl font-normal rounded drop-shadow-md focus:outline-2 focus:outline-app-input-border focus:outline focus:outline-offset-1 disabled:bg-app-input-disabled placeholder:italic placeholder:font-thin"
          type="text"
          name="author"
          id="editStringAuthor"
          placeholder="Optionnal author name"
          disabled={!isCurrentSoundReady || !props.isActive}
        />
      </div>
    </form>
  );
};

export default EditStrings;
