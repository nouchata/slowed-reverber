import type { Dispatch, SetStateAction } from 'react';
import { useContext, useEffect, useState } from 'react';

import LowpassSVG from '@/svgs/app/addSong/editValues/Lowpass';
import ReverbSVG from '@/svgs/app/addSong/editValues/Reverb';
import SpeedSVG from '@/svgs/app/addSong/editValues/Speed';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import SoundsManager from '@/utils/SoundModule/SoundsManager';

import TweakValuesSlider from './tweakValues/TweakValuesSlider';

const TweakValues = (
  props: IStylePropsInterface & {
    setNextCallback?: Dispatch<
      SetStateAction<(() => Promise<boolean>) | undefined>
    >;
    isActive: boolean;
  }
) => {
  const { currentSound, soundsManager } = useContext(SoundsManagerContext);
  const { setAppData } = useContext(AppDataContext);
  const [arbitraryValue, setArbitraryValue] = useState(false);

  useEffect(() => {
    const callback = () => {
      return async () => {
        let wentWell = true;
        await soundsManager!.undraftCurrentSong().catch((reason) => {
          setAppData!({
            error: { type: 'normal', value: reason.message },
          });
          wentWell = false;
        });
        return wentWell;
      };
    };

    if (props.setNextCallback && props.isActive)
      props.setNextCallback(callback);
  }, [props.isActive]);
  return (
    <form
      className={`${props.className} pb-20 p-2 flex gap-2 flex-col justify-start text-white select-none`}
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <div className="relative flex-[0_0_40px] box-border flex flex-row flex-nowrap items-center bg-app-input-bg rounded drop-shadow-md hover:outline-2 hover:outline-app-input-border hover:outline hover:outline-offset-1">
        <button
          className={`flex-1 h-full text-sm hover:bg-white/5 ${
            arbitraryValue ? 'font-extrabold' : ''
          }`}
          onClick={() => {
            setArbitraryValue(!arbitraryValue);
          }}
        >
          Arbitrary values
        </button>
        <div className="w-[1px] h-5/6 bg-app-modal-xl-background"></div>
        <button
          className={`flex-1 flex flex-wrap justify-center content-center h-full text-sm hover:bg-white/5 ${
            currentSound?.soundInfoData?.dontChangePitch ? 'font-extrabold' : ''
          }`}
          onClick={() => {
            soundsManager
              ?.updateCurrentSound({
                dontChangePitch: !currentSound?.soundInfoData?.dontChangePitch,
              })
              .catch((reason) =>
                setAppData!({
                  error: { type: 'normal', value: reason.message },
                })
              );
          }}
        >
          <span className="h-4 flex-[0_0_100%]">Keep audio pitch</span>
          <span className="text-xs h-4 flex-[0_0_100%]">(experimental)</span>
        </button>
        {!props.isActive && (
          <div className="absolute w-full h-full top-0 left-0 rounded bg-app-player-disabled opacity-50"></div>
        )}
      </div>
      <div className="relative flex-[0_0_120px] box-border p-1 flex flex-col flex-nowrap bg-app-input-bg rounded drop-shadow-md hover:outline-2 hover:outline-app-input-border hover:outline hover:outline-offset-1">
        <h3 className="flex-[0_0_50px] flex justify-center items-center font-extrabold text-xl">
          Speed
        </h3>
        <div className="flex-1 bg-white/5 rounded flex justify-center items-center">
          <TweakValuesSlider
            className="py-5 flex-[0_0_90%]"
            isActive={props.isActive}
            SvgElement={SpeedSVG}
            color="#ffffff"
            svgColor="#000000"
            title="Speed"
            startPercentage={SoundsManager.valueConverter(
              'speed',
              currentSound?.soundInfoData?.speedValue || 1,
              false
            )}
            arbitraryValue={arbitraryValue}
            breakpoints={{
              0: 'Cursed',
              30: 'Slowed down',
              '37.5': 'Perfect slowing',
              45: 'A bit under',
              50: 'Normal',
              75: 'Sped up',
              100: 'Nightcore',
            }}
            percentageCallback={(percentage) => {
              soundsManager
                ?.tweakDataCurrentSound('speed', percentage)
                .catch((reason) =>
                  setAppData!({
                    error: { type: 'normal', value: reason.message },
                  })
                );
            }}
          />
        </div>
        {!props.isActive && (
          <div className="absolute w-full h-full top-0 left-0 rounded bg-app-player-disabled opacity-50"></div>
        )}
      </div>
      <div className="relative flex-[0_0_120px] box-border p-1 flex flex-col flex-nowrap bg-app-input-bg rounded drop-shadow-md hover:outline-2 hover:outline-app-input-border hover:outline hover:outline-offset-1">
        <h3 className="flex-[0_0_50px] flex justify-center items-center font-extrabold text-xl">
          Reverb
        </h3>
        <div className="flex-1 bg-white/5 rounded flex justify-center items-center">
          <TweakValuesSlider
            className="py-5 flex-[0_0_90%]"
            isActive={props.isActive}
            SvgElement={ReverbSVG}
            color="#ffffff"
            svgColor="#000000"
            title="Reverb"
            startPercentage={SoundsManager.valueConverter(
              'reverb',
              currentSound?.soundInfoData?.reverbEffectValue || 0,
              false
            )}
            arbitraryValue={arbitraryValue}
            breakpoints={{
              0: 'Normal',
              20: 'A bit wet',
              40: 'A bit more wet',
              60: 'Wet',
              80: 'Very wet',
              100: 'Soaked',
            }}
            percentageCallback={(percentage) => {
              soundsManager
                ?.tweakDataCurrentSound('reverb', percentage)
                .catch((reason) =>
                  setAppData!({
                    error: { type: 'normal', value: reason.message },
                  })
                );
            }}
          />
        </div>
        {!props.isActive && (
          <div className="absolute w-full h-full top-0 left-0 rounded bg-app-player-disabled opacity-50"></div>
        )}
      </div>
      <div className="relative flex-[0_0_120px] box-border p-1 flex flex-col flex-nowrap bg-app-input-bg rounded drop-shadow-md hover:outline-2 hover:outline-app-input-border hover:outline hover:outline-offset-1">
        <h3 className="flex-[0_0_50px] flex justify-center items-center font-extrabold text-xl">
          Distance
        </h3>
        <div className="flex-1 bg-white/5 rounded flex justify-center items-center">
          <TweakValuesSlider
            className="py-5 flex-[0_0_90%]"
            isActive={props.isActive}
            SvgElement={LowpassSVG}
            color="#ffffff"
            svgColor="#000000"
            title="Distance"
            startPercentage={SoundsManager.valueConverter(
              'distance',
              currentSound?.soundInfoData?.lowKeyEffectValue || 50,
              false
            )}
            arbitraryValue={arbitraryValue}
            breakpoints={{
              0: 'Near you',
              50: 'A little bit muffled',
              75: 'Muffled',
              85: 'Under your pillow',
              95: 'Next room',
              100: 'Next flat',
            }}
            percentageCallback={(percentage) => {
              soundsManager
                ?.tweakDataCurrentSound('distance', percentage)
                .catch((reason) =>
                  setAppData!({
                    error: { type: 'normal', value: reason.message },
                  })
                );
            }}
          />
        </div>
        {!props.isActive && (
          <div className="absolute w-full h-full top-0 left-0 rounded bg-app-player-disabled opacity-50"></div>
        )}
      </div>
    </form>
  );
};

export default TweakValues;
