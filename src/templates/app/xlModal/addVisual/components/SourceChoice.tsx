import GiphySVG from '@/svgs/app/makeVideo/Giphy';
import MovieAndPictureSVG from '@/svgs/app/makeVideo/MovieAndPicture';
import type { IAppModalPaneProps } from '@/utils/interfaces/AppModalState';
import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';

const SourceChoice = (
  props: IBasicPropsInterface &
    IAppModalPaneProps & {
      choiceSetterCallback: (choice: 'local' | 'giphy') => void;
    }
) => {
  return (
    <div
      className={`${props.className} relative p-2 flex flex-col flex-nowrap phone-landscape:flex-row`}
    >
      <button
        className="text-white flex-1 rounded-t bg-app-modal-xl-lighter hover:bg-white/10 flex justify-center content-center flex-wrap gap-3"
        disabled={!props.isActive}
        onClick={() => props.choiceSetterCallback('giphy')}
      >
        <GiphySVG
          className="flex-[0_0_90%] phone-landscape:flex-[0_0_70%]"
          runAnimation={props.isActive}
        />
        <span className="flex-[0_0_100%] font-bold text-lg">from GIPHY</span>
      </button>
      <button
        className="text-white flex-1 rounded-t bg-app-modal-xl-lighter hover:bg-white/10 flex justify-center content-center flex-wrap gap-3"
        disabled={!props.isActive}
        onClick={() => props.choiceSetterCallback('local')}
      >
        <MovieAndPictureSVG
          className="flex-[0_0_90%] h-3/6 phone-landscape:h-2/6"
          runAnimation={props.isActive}
        />
        <span className="flex-[0_0_100%] font-bold text-lg">from a file</span>
      </button>
      {/* Separators */}
      <div className="absolute bg-white top-[calc(50%-2px)] h-1 w-[calc(100%-16px)] phone-landscape:top-2 phone-landscape:left-[calc(50%-2px)] phone-landscape:h-[calc(100%-16px)] phone-landscape:w-1"></div>
      <div
        className="absolute top-[calc(50%-50px)] left-[calc(50%-60px)] h-[100px] w-[120px] flex justify-center items-center bg-white scale-50 phone-landscape:rotate-90"
        style={{
          clipPath:
            "path('M 119.568 49.82 C 119.568 53.203 112.243 56.9 109.604 59.784 C 106.965 62.668 106.389 66.142 105.149 69.073 C 103.909 72.004 102.392 74.79 100.631 77.396 C 98.87 80.003 96.864 82.432 94.648 84.648 C 92.431 86.865 90.003 88.871 87.396 90.632 C 84.789 92.393 82.004 93.91 79.073 95.149 C 76.142 96.389 73.065 97.352 69.875 98.005 C 66.685 98.657 63.383 99 60 99 C 56.617 99 53.314 98.657 50.125 98.005 C 46.935 97.352 43.858 96.389 40.927 95.149 C 37.996 93.91 35.211 92.393 32.604 90.632 C 29.997 88.871 27.569 86.865 25.352 84.648 C 23.135 82.432 21.13 80.003 19.368 77.396 C 17.607 74.79 16.091 72.004 14.851 69.073 C 13.611 66.142 12.19 62.159 9.964 59.784 C 7.815 57.491 0 53.203 0 49.82 C 0 46.438 7.761 42.405 9.964 39.856 C 12.167 37.307 13.611 33.858 14.851 30.927 C 16.091 27.996 17.608 25.211 19.369 22.604 C 21.13 19.997 23.136 17.569 25.352 15.352 C 27.569 13.136 29.997 11.13 32.604 9.369 C 35.211 7.608 37.996 6.091 40.927 4.851 C 43.858 3.611 46.935 2.648 50.125 1.996 C 53.315 1.343 56.618 1 60 1 C 63.383 1 66.686 1.343 69.876 1.996 C 73.065 2.648 76.142 3.611 79.073 4.851 C 82.004 6.091 84.79 7.608 87.396 9.369 C 90.003 11.13 92.432 13.136 94.648 15.352 C 96.865 17.569 98.871 19.997 100.632 22.604 C 102.393 25.211 103.91 27.996 105.149 30.927 C 106.389 33.858 106.965 36.819 109.604 39.856 C 112.243 42.893 119.568 46.438 119.568 49.82 Z')",
        }}
      >
        <span className="text-app-modal-xl-background font-extrabold text-4xl select-none phone-landscape:-rotate-90">
          OR
        </span>
      </div>
      {!props.isActive && (
        <div className="absolute top-0 left-0 w-full h-full rounded opacity-80 bg-app-element-disabled"></div>
      )}
    </div>
  );
};

export default SourceChoice;
