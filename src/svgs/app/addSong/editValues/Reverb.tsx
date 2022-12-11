import type { ITweakValuesSliderSVGProps } from '@/utils/interfaces/TweakValuesSliderSVGInterface';

const ReverbSVG = (props: ITweakValuesSliderSVGProps) => {
  return (
    <svg className={props.className} style={props.style}>
      <mask id="svg-droplet-mask">
        <rect
          fill="#ffffff"
          x="0"
          y={`${100 - props.percentage}%`}
          width="100%"
          height="100%"
        ></rect>
      </mask>
      <image
        className="w-full h-full"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        xlinkHref="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='2.95 1.65 18.2 21.4' fill='currentColor' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'%3E%3C/path%3E%3C/svg%3E"
        mask="url(#svg-droplet-mask)"
      ></image>
      <image
        className="w-full h-full"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        xlinkHref="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='2.95 1.65 18.2 21.4' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z'%3E%3C/path%3E%3C/svg%3E"
      ></image>
    </svg>
  );
};

export default ReverbSVG;
