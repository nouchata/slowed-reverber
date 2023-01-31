import dynamic from 'next/dynamic';
import { useContext, useRef } from 'react';

import AppHeader from '@/templates/app/AppHeader';
import AppMenu from '@/templates/app/AppMenu';
import AppModals from '@/templates/app/AppModals';
import StaticContainer from '@/templates/StaticContainer';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import SoundsManagerProvider from '@/utils/contexts/SoundsManagerContext';
import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useLocalStorage from '@/utils/useLocalStorage';
import useWindowSize from '@/utils/useWindowSize';

const dragEventPreventDefaultTriggering = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
};

/* the global of the app (header + menu + modals) */
const AppLayout = (
  props: IBasicPropsInterface & { tabName?: 'Songs' | 'Settings' }
) => {
  const { router } = useContext(AppDataContext).appData!;
  const { setAppData } = useContext(AppDataContext);
  const [storageValues] = useLocalStorage();
  /* used to put the staticcontainer in the dom */
  const windowWidth = useWindowSize().width;
  /* a simple way to know to count the dragenter/leave events since they
   * retrigger each time they're passing on a new child elem */
  const enterAndLeaveEventCount = useRef(0);
  return (
    <SoundsManagerProvider>
      <div
        id="app-container"
        style={{
          backgroundColor:
            storageValues.backgroundColor === 'black'
              ? 'rgb(0,0,0)'
              : 'rgb(15,23,42)',
        }}
        className="relative flex w-full h-full justify-center bg-black"
        onDragEnter={(e) => {
          dragEventPreventDefaultTriggering(e);
          enterAndLeaveEventCount.current += 1;
          /* opens the modal when a file is dragged on the screen */
          if (router.asPath === '/app/songs/')
            router.push({ pathname: '/app/songs', query: { md: 'addSong' } });
          /* state changing for style */
          setAppData!({ fileDragAndDrop: true });
        }}
        onDragLeave={(e) => {
          dragEventPreventDefaultTriggering(e);
          enterAndLeaveEventCount.current -= 1;
          if (!enterAndLeaveEventCount.current)
            setAppData!({ fileDragAndDrop: false });
        }}
        onDrop={(e) => {
          dragEventPreventDefaultTriggering(e);
          setAppData!({ fileDragAndDrop: false });
        }}
        onDragOver={dragEventPreventDefaultTriggering}
        onDrag={dragEventPreventDefaultTriggering}
        onDragEnd={dragEventPreventDefaultTriggering}
        onDragStart={dragEventPreventDefaultTriggering}
      >
        {windowWidth && windowWidth > 600 && storageValues.showStaticCanvas && (
          <StaticContainer className="absolute top-0 left-0 w-full h-full" />
        )}
        <div
          id="app-display"
          className="relative overflow-hidden h-full flex-[0_1_600px] bg-app-display-background drop-shadow-2xl flex flex-col flex-nowrap"
        >
          <AppModals />
          <AppHeader
            title={props.tabName || ''}
            /* backdrop blur (backdrop-blur-sm) seems to give firefox epilepsy, needs to be investigated more */
            className="bg-black h-[70px] block absolute top-0 w-full drop-shadow z-20"
          ></AppHeader>
          <div className="relative h-0 flex-1 pt-[70px] overflow-auto">
            {props.children && props.children}
          </div>
          <AppMenu
            className="bg-black border-t border-t-[rgba(255,255,255,0.1)] flex-[0_0_50px] drop-shadow z-20 shadow-inner"
            selectedItem={props.tabName || 'Songs'}
          ></AppMenu>
        </div>
      </div>
    </SoundsManagerProvider>
  );
};

/* ssr conflicts w/ local storage config so i'm just removing it for the whole app pages */
export default dynamic(() => Promise.resolve(AppLayout), {
  ssr: false,
});
