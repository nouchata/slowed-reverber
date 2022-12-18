import { useContext, useEffect } from 'react';

import AppLayout from '@/layouts/AppLayout';
import { Meta } from '@/layouts/Meta';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import type { NextPageLayoutInterface } from '@/utils/interfaces/NextPageLayoutInterface';

const AppIndex: NextPageLayoutInterface = () => {
  const { router } = useContext(AppDataContext).appData!;
  useEffect(() => {
    router.push('/app/songs');
  }, []);
  return (
    <>
      <Meta
        title={'App - Slowed Reverb'}
        description={
          'Edit your sound and make videos to match Slowed & Reverb aesthetic!' ||
          router.asPath
        }
      ></Meta>
    </>
  );
};

AppIndex.getLayout = (page) => {
  return <AppLayout tabName={''}>{page}</AppLayout>;
};

export default AppIndex;
