import router from 'next/router';

import AppLayout from '@/layouts/AppLayout';
import { Meta } from '@/layouts/Meta';
import type { NextPageLayoutInterface } from '@/utils/interfaces/NextPageLayoutInterface';

const AppSongs: NextPageLayoutInterface = () => {
  return (
    <>
      <Meta
        title={'Songs - Slowed Reverb'}
        description={
          'Edit your sound and make videos to match Slowed & Reverb aesthetic!' ||
          router.asPath
        }
      ></Meta>
      <h1>APPPPPPPPPPPP AYAYA</h1>
    </>
  );
};

AppSongs.getLayout = (page) => {
  return <AppLayout tabName={'Songs'}>{page}</AppLayout>;
};

export default AppSongs;
