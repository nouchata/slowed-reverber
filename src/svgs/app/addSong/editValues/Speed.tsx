import type { ITweakValuesSliderSVGProps } from '@/utils/interfaces/TweakValuesSliderSVGInterface';

const SpeedSVG = (props: ITweakValuesSliderSVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      style={props.style}
    >
      <g
        id="speed-svg-none"
        style={{
          visibility: props.percentage === 50 ? 'visible' : 'hidden',
        }}
      >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </g>
      <g
        id="speed-svg-medium"
        style={{
          visibility:
            props.percentage !== 50 &&
            props.percentage <= 75 &&
            props.percentage >= 25
              ? 'visible'
              : 'hidden',
          transform: props.percentage < 50 ? 'scaleX(-1)' : '',
          transformOrigin: '12px 12px',
        }}
      >
        <polygon points="5 4 15 12 5 20 5 4"></polygon>
        <line x1="19" y1="5" x2="19" y2="19"></line>
      </g>
      <g
        id="speed-svg-full"
        style={{
          visibility:
            props.percentage !== 50 &&
            (props.percentage < 25 || props.percentage > 75)
              ? 'visible'
              : 'hidden',
          transform: props.percentage < 50 ? 'scaleX(-1)' : '',
          transformOrigin: '12px 12px',
        }}
      >
        <polygon points="13 19 22 12 13 5 13 19"></polygon>
        <polygon points="2 19 11 12 2 5 2 19"></polygon>
      </g>
    </svg>
  );
};

export default SpeedSVG;
