import { useEffect, useRef } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

const InjectNewSong = (props?: IStylePropsInterface) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    /* input spoofer since the input element can't really be customized */
    buttonRef.current!.onclick = () => {
      inputFileRef.current!.click();
    };
  }, []);
  return (
    <div className={` ${props?.className}`}>
      <input
        ref={inputFileRef}
        type="file"
        accept="audio"
        className="absolute hidden"
      />
      <button ref={buttonRef} className="w-full h-full">
        Input file
      </button>
    </div>
  );
};

export default InjectNewSong;
