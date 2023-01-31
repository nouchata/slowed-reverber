import { useContext } from 'react';

import AppLayout from '@/layouts/AppLayout';
import { Meta } from '@/layouts/Meta';
import CheckboxSVG from '@/svgs/app/settings/Checkbox';
import DeleteAllSongsModal from '@/templates/app/settings/DeleteAllSongsModal';
import InjectDemoSongModal from '@/templates/app/settings/InjectDemoSongModal';
import StorageViewer from '@/templates/app/settings/StorageViewer';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import type { NextPageLayoutInterface } from '@/utils/interfaces/NextPageLayoutInterface';
import useLocalStorage from '@/utils/useLocalStorage';

const AppSettings: NextPageLayoutInterface = () => {
  const { appData, setAppData } = useContext(AppDataContext);
  const { router } = appData!;
  const [localStorageValues, setLocalStorageValues] = useLocalStorage();
  return (
    <>
      <Meta
        title={'Settings - Slowed Reverber'}
        description={'Application settings' || router.asPath}
      ></Meta>
      <div className="w-full text-white select-none">
        <div className="flex flex-col gap-2 mb-5">
          <h3 className="text-lg font-bold px-3 overflow-hidden whitespace-nowrap text-ellipsis">
            Storage
          </h3>
          <StorageViewer className="mx-10" />
          <button
            className="h-16 flex flex-row flex-nowrap px-3 overflow-hidden"
            onClick={() => {
              setAppData!({ customModal: <InjectDemoSongModal /> });
            }}
          >
            <div className="w-0 flex-1 flex flex-col flex-nowrap justify-center h-full text-left">
              <h5 className="font-normal text-base shrink-0 overflow-hidden whitespace-nowrap text-ellipsis">
                Inject demo song
              </h5>
              <p className="font-thin text-xs overflow-hidden text-ellipsis">
                Try out with a royalty-free demo song !
              </p>
            </div>
          </button>
          <button
            className="h-16 flex flex-row flex-nowrap px-3 overflow-hidden"
            onClick={() => {
              setAppData!({ customModal: <DeleteAllSongsModal /> });
            }}
          >
            <div className="w-0 flex-1 flex flex-col flex-nowrap justify-center h-full text-left">
              <h5 className="font-normal text-base shrink-0 overflow-hidden whitespace-nowrap text-ellipsis">
                Delete songs
              </h5>
              <p className="font-thin text-xs overflow-hidden text-ellipsis">
                Will delete all of the songs, drafts (+ saved audio and visual
                assets)
              </p>
            </div>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-bold px-3 overflow-hidden whitespace-nowrap text-ellipsis">
            Theme
          </h3>
          <button
            className="h-16 flex flex-row flex-nowrap px-3 overflow-hidden"
            onClick={() => {
              setLocalStorageValues({
                showStaticCanvas: !localStorageValues.showStaticCanvas,
              });
            }}
          >
            <div className="w-0 flex-1 flex flex-col flex-nowrap justify-center h-full text-left">
              <h5 className="font-normal text-base shrink-0 overflow-hidden whitespace-nowrap text-ellipsis">
                Static background
              </h5>
              <p className="font-thin text-xs overflow-hidden text-ellipsis">
                On wide display, a static background is displayed outside the
                borders of the app
              </p>
            </div>
            <CheckboxSVG
              className="box-border flex-[0_0_50px] h-full p-3"
              checked={localStorageValues.showStaticCanvas}
            />
          </button>
          <button
            className="h-16 flex flex-row flex-nowrap px-3 overflow-hidden"
            onClick={() => {
              setLocalStorageValues({
                backgroundColor:
                  localStorageValues.backgroundColor === 'black'
                    ? 'slate'
                    : 'black',
              });
            }}
          >
            <div className="w-0 flex-1 flex flex-col flex-nowrap justify-center h-full text-left">
              <h5 className="font-normal text-base shrink-0 overflow-hidden whitespace-nowrap text-ellipsis">
                Background color
              </h5>
              <p className="font-thin text-xs overflow-hidden text-ellipsis">
                On wide display, if there is no static background
              </p>
            </div>
            <div
              className="box-border flex-[0_0_50px] h-full flex justify-center items-center"
              title="Black background"
            >
              <div
                className={`bg-black rounded-full w-4 h-4 ${
                  localStorageValues.backgroundColor === 'black'
                    ? 'outline outline-2 outline-offset-4 outline-white'
                    : 'outline-dashed outline-2 outline-offset-4 outline-gray-600'
                }`}
                title="Color display"
              ></div>
            </div>
            <div
              className="box-border flex-[0_0_50px] h-full flex justify-center items-center"
              title="Purple background"
            >
              <div
                className={`bg-slate-900 rounded-full w-4 h-4 ${
                  localStorageValues.backgroundColor === 'slate'
                    ? 'outline outline-2 outline-offset-4 outline-white'
                    : 'outline-dashed outline-2 outline-offset-4 outline-gray-600'
                }`}
                title="Color display"
              ></div>
            </div>
          </button>
        </div>
        <footer className="flex flex-col mx-auto mt-12 py-2 w-4/5 border-t-2 border-white text-center text-xs opacity-40">
          <h6 className="italic">Slowed Reverber</h6>
          <p>
            made by{' '}
            <a
              className="underline"
              href="https://github.com/nouchata"
              target="_blank"
              rel="noreferrer"
            >
              @nouchata
            </a>
          </p>
        </footer>
      </div>
    </>
  );
};

AppSettings.getLayout = (page) => {
  return <AppLayout tabName={'Settings'}>{page}</AppLayout>;
};

export default AppSettings;
