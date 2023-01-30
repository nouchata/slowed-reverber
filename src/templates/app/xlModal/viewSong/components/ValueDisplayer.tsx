import { useMemo } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import type { ITweakValuesSliderSVGProps } from '@/utils/interfaces/TweakValuesSliderSVGInterface';

const ValueDisplayer = (
  props: IStylePropsInterface & {
    Svg: (props: ITweakValuesSliderSVGProps) => JSX.Element;
    name: 'Speed' | 'Reverb' | 'Distance';
    percentage: number;
    basePercentage?: number;
    breakpoints: { [percentage: number]: string };
  }
) => {
  const percentageDescription = useMemo(() => {
    const breakpointsKeys = Object.keys(props.breakpoints).map((value) =>
      Number(value)
    );
    const closestPercentage = breakpointsKeys.reduce((prev, curr) =>
      Math.abs(curr - props.percentage) < Math.abs(prev - props.percentage)
        ? curr
        : prev
    );
    return props.breakpoints[closestPercentage];
  }, [props.percentage]);
  return (
    <div
      className={`${props.className} flex flex-col items-center ${
        props.percentage === (props.basePercentage || 0) ? 'opacity-50' : ''
      }`}
    >
      <h5
        className={`text-base ${
          props.percentage !== (props.basePercentage || 0) ? 'font-bold' : ''
        }`}
      >
        {props.name}
      </h5>
      <props.Svg
        className={`flex-1 ${props.name === 'Reverb' ? 'p-1' : ''}`}
        percentage={props.percentage}
        color="FFFFFF"
      />
      <p
        className={`text-xs text-ellipsis overflow-hidden whitespace-nowrap w-full text-center`}
      >
        {props.percentage === (props.basePercentage || 0)
          ? 'Unedited'
          : `${percentageDescription} (${props.percentage}%)`}
      </p>
    </div>
  );
};

export default ValueDisplayer;
