import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

const CheckboxSVG = (props: IStylePropsInterface & { checked: boolean }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <g
        id="checkbox-not-checked"
        style={{ visibility: props.checked ? 'hidden' : undefined }}
      >
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      </g>
      <g
        id="checkbox-checked"
        style={{ visibility: props.checked ? undefined : 'hidden' }}
      >
        <polyline points="9 11 12 14 22 4"></polyline>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </g>
    </svg>
  );
};

export default CheckboxSVG;
