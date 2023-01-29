import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import type { ITweakValuesSliderSVGProps } from '@/utils/interfaces/TweakValuesSliderSVGInterface';

const ValueDisplayer = (
  props: IStylePropsInterface & {
    Svg: (props: ITweakValuesSliderSVGProps) => JSX.Element;
    name: string;
    percentage: number;
    basePercentage?: number;
  }
) => {
  return (
    <div className={`${props.className} flex flex-col items-center`}>
      <h5
        className={`text-base ${
          props.percentage !== (props.basePercentage || 0) ? 'font-bold' : ''
        }`}
      >
        {props.name}
      </h5>
      <props.Svg className="flex-1" percentage={props.percentage} />
      <p className={`text-xs`}>Unedited</p>
    </div>
  );
};

export default ValueDisplayer;
