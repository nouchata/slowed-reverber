import { useRouter } from 'next/router';
import { useContext } from 'react';

import AppLayout from '@/layouts/AppLayout';
import { Meta } from '@/layouts/Meta';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import type { NextPageLayoutInterface } from '@/utils/interfaces/NextPageLayoutInterface';

const AppSongs: NextPageLayoutInterface = () => {
  const router = useRouter();
  const { appData, setAppData } = useContext(AppDataContext);
  const { soundsManager } = useContext(SoundsManagerContext);
  return (
    <>
      <Meta
        title={'Songs - Slowed Reverb'}
        description={
          'Edit your sound and make videos to match Slowed & Reverb aesthetic!' ||
          router.asPath
        }
      ></Meta>
      <div className="h-full w-full">
        <input
          type="file"
          onChange={(e) => {
            if (!(e.target as HTMLInputElement).files?.length) return;
            (async () => {
              const file = (e.target as HTMLInputElement).files![0]!;
              if (!file.type.includes('audio')) return;
              soundsManager?.addFile(
                await file.arrayBuffer(),
                file.name.replace(/\.[^.]*$/, '')
              );
            })();
          }}
        />
        <button
          className="mt-8 p-4 bg-slate-50 text-black"
          onClick={() => {
            setAppData!({
              ...appData,
              error: `HERE IS AN EAHGZTYDF7U8>JIRHVGFTYURROR ${Math.random()}`,
            });
          }}
        >
          seterror
        </button>
      </div>
      <div
        id="song-tab-add-button-ping"
        className="absolute bottom-5 right-5 h-20 w-20 bg-slate-700 animate-big-elem-ping rounded"
      ></div>
      <button
        id="song-tab-add-button"
        className="absolute bottom-5 right-5 h-20 w-20 text-white bg-app-primary-color rounded flex justify-center items-center box-border p-2"
        onClick={() =>
          router.push(
            { pathname: '/app/songs/', query: { md: 'addSong', step: '1' } },
            undefined,
            { shallow: true }
          )
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
          aria-labelledby="title"
        >
          <title>Add a new song</title>
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
      </button>
    </>
  );
};

AppSongs.getLayout = (page) => {
  return <AppLayout tabName={'Songs'}>{page}</AppLayout>;
};

export default AppSongs;
