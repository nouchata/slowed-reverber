import gsap from 'gsap';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef } from 'react';

import MenuSongsSVG from '@/svgs/app/menu/MenuSongs';
import AppHeader from '@/templates/app/AppHeader';
import AppMenu from '@/templates/app/AppMenu';
import AppModals from '@/templates/app/AppModals';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import SoundsManagerProvider from '@/utils/contexts/SoundsManagerContext';
import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';

const menuItems = {
  Songs: MenuSongsSVG,
  Settings: MenuSongsSVG,
};

const dragEventPreventDefaultTriggering = (e: any) => {
  e.preventDefault();
  e.stopPropagation();
};

/* the global of the app (header + menu + modals) */
const AppLayout = (props: IBasicPropsInterface & { tabName: string }) => {
  const router = useRouter();
  const { appData, setAppData } = useContext(AppDataContext);
  /* a simple way to know to count the dragenter/leave events since they
   * retrigger each time they're passing on a new child elem */
  const enterAndLeaveEventCount = useRef(0);
  useEffect(() => {
    gsap.set('#main-display-div', { className: 'bg-slate-700' });
  }, []);
  return (
    <SoundsManagerProvider>
      <div
        id="app-container"
        className="flex w-full h-full justify-center"
        onDragEnter={(e) => {
          dragEventPreventDefaultTriggering(e);
          enterAndLeaveEventCount.current += 1;
          /* opens the modal when a file is dragged on the screen */
          if (router.asPath === '/app/songs/')
            router.push(
              { pathname: '/app/songs', query: { md: 'addSong', step: '1' } },
              undefined,
              { shallow: true }
            );
          /* state changing for style */
          setAppData!({ ...appData, fileDragAndDrop: true });
        }}
        onDragLeave={(e) => {
          dragEventPreventDefaultTriggering(e);
          enterAndLeaveEventCount.current -= 1;
          if (!enterAndLeaveEventCount.current)
            setAppData!({ ...appData, fileDragAndDrop: false });
        }}
        onDrop={(e) => {
          dragEventPreventDefaultTriggering(e);
          setAppData!({ ...appData, fileDragAndDrop: false });
          // if (ev.dataTransfer.items) {
          //   // Use DataTransferItemList interface to access the file(s)
          //   [...ev.dataTransfer.items].forEach((item, i) => {
          //     // If dropped items aren't files, reject them
          //     if (item.kind === 'file') {
          //       const file = item.getAsFile();
          //       console.log(`… file[${i}].name = ${file.name}`);
          //     }
          //   });
          // }
        }}
        onDragOver={dragEventPreventDefaultTriggering}
        onDrag={dragEventPreventDefaultTriggering}
        onDragEnd={dragEventPreventDefaultTriggering}
        onDragStart={dragEventPreventDefaultTriggering}
      >
        <div
          id="app-display"
          className="relative overflow-hidden h-full flex-[0_1_600px] bg-app-display-background drop-shadow-2xl flex flex-col flex-nowrap"
        >
          <AppModals />
          <AppHeader
            title={props.tabName}
            /* backdrop blur (backdrop-blur-sm) seems to give firefox epilepsy, needs to be investigated more */
            className="h-[70px] block absolute top-0 w-full drop-shadow z-30"
          ></AppHeader>
          <div className="relative flex-1 pt-[70px]">
            {props.children && props.children}
          </div>
          <AppMenu
            className="border-t border-t-[rgba(255,255,255,0.1)] flex-[0_0_50px] drop-shadow z-30 shadow-inner"
            selectedItem={props.tabName}
            menuItems={menuItems}
          ></AppMenu>
        </div>
      </div>
    </SoundsManagerProvider>
  );
};

export default AppLayout;
