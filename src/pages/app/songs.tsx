import { useRouter } from 'next/router';

import AppLayout from '@/layouts/AppLayout';
import { Meta } from '@/layouts/Meta';
import type { NextPageLayoutInterface } from '@/utils/interfaces/NextPageLayoutInterface';

const AppSongs: NextPageLayoutInterface = () => {
  const router = useRouter();
  return (
    <>
      <Meta
        title={'Songs - Slowed Reverb'}
        description={
          'Edit your sound and make videos to match Slowed & Reverb aesthetic!' ||
          router.asPath
        }
      ></Meta>
      <div className="h-full w-full"></div>
      <div
        id="song-tab-add-button-ping"
        className="absolute bottom-5 right-5 h-20 w-20 bg-blue-700 animate-big-elem-ping rounded"
      ></div>
      <button
        id="song-tab-add-button"
        className="absolute bottom-5 right-5 h-20 w-20 stroke-white bg-blue-700 rounded flex justify-center items-center box-border p-2"
        onClick={() =>
          router.push(
            { pathname: '/app/songs', query: { md: 'addSong' } },
            undefined,
            { shallow: true }
          )
        }
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
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
