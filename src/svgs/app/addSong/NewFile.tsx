import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

type NewFileSVGProps = {
  animatePlusSign: boolean;
  valideFile: boolean;
} & IStylePropsInterface;

const NewFileSVG = (props: Partial<NewFileSVGProps>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      {props.valideFile ? (
        <polyline points="17.239 10.812 9.11 18.948 6.672 16.51"></polyline>
      ) : (
        <g
          id="inject-new-file-plus"
          style={{ transformOrigin: '50% 62.5%' }}
          className={`${
            props.animatePlusSign ? 'animate-inject-new-file-rotate' : ''
          }`}
        >
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </g>
      )}
    </svg>
  );
};

export default NewFileSVG;
