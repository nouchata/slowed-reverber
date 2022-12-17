import type { ITweakValuesSliderSVGProps } from '@/utils/interfaces/TweakValuesSliderSVGInterface';

const LowpassSVG = (props: ITweakValuesSliderSVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      className={props.className}
      style={props.style}
    >
      <g
        id="lowpass-svg-low"
        style={{
          visibility: props.percentage < 50 ? 'visible' : 'hidden',
        }}
      >
        <polygon
          fill="currentColor"
          points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
        ></polygon>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </g>
      <g
        id="lowpasss-svg-medium"
        style={{
          visibility:
            props.percentage >= 50 && props.percentage <= 90
              ? 'visible'
              : 'hidden',
        }}
      >
        <polygon
          fill="currentColor"
          points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
        ></polygon>
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
      </g>
      <g
        id="lowpass-svg-full"
        style={{
          visibility: props.percentage > 90 ? 'visible' : 'hidden',
        }}
      >
        <polygon
          fill="currentColor"
          points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"
        ></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
      </g>
    </svg>
  );
};

export default LowpassSVG;
