import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

const AppModalsCriticalError = (
  props: IStylePropsInterface & { error: string; freshSongEdit?: boolean }
) => {
  return (
    <div
      className={`h-full w-full flex flex-col justify-center gap-4 items-center text-white ${props?.className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-[0_0_40%] w-full"
      >
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <strong>{props.error}</strong>
    </div>
  );
};

export default AppModalsCriticalError;
