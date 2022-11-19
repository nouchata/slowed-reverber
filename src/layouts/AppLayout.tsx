import gsap from 'gsap';
import { useEffect } from 'react';

import MenuSongsSVG from '@/svgs/app/menu/MenuSongs';
import AppHeader from '@/templates/app/AppHeader';
import AppMenu from '@/templates/app/AppMenu';
import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';

const menuItems = {
  Songs: MenuSongsSVG,
  Settings: MenuSongsSVG,
};

const AppLayout = (props: IBasicPropsInterface & { tabName: string }) => {
  useEffect(() => {
    gsap.set('#main-display-div', { className: 'bg-slate-700' });
  }, []);
  return (
    <>
      <div id="app-container" className="flex w-full h-full justify-center">
        <div
          id="app-display"
          className="relative overflow-hidden h-full flex-[0_1_600px] bg-black drop-shadow-2xl flex flex-col flex-nowrap"
        >
          <AppHeader
            title={props.tabName}
            className="backdrop-blur-sm h-[70px] block fixed top-0 w-full drop-shadow z-50"
          ></AppHeader>
          <div className="flex-1 pt-[70px]">
            {props.children && props.children}
          </div>
          <AppMenu
            className="border-t border-t-[rgba(255,255,255,0.1)] flex-[0_0_50px] drop-shadow z-50 shadow-inner"
            selectedItem={props.tabName}
            menuItems={menuItems}
          ></AppMenu>
        </div>
      </div>
    </>
  );
};

export default AppLayout;