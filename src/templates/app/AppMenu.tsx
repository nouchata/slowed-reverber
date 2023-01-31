import { useContext } from 'react';

import MenuSettingsSVG from '@/svgs/app/menu/MenuSettings';
import MenuSongsSVG from '@/svgs/app/menu/MenuSongs';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

type IAppMenuProps = {
  selectedItem: 'Songs' | 'Settings';
};

const AppMenu = (props: IStylePropsInterface & IAppMenuProps): JSX.Element => {
  const { router } = useContext(AppDataContext).appData!;
  return (
    <nav className={`${props.className} flex flex-row h-full box-border`}>
      <button
        className="flex-1 flex flex-col py-2 box-border overflow-hidden items-center h-full w-full"
        onClick={() => {
          if (props.selectedItem !== 'Songs') router.push('/app/songs');
        }}
      >
        <MenuSongsSVG
          isSelected={props.selectedItem === 'Songs'}
          className="flex-[1_0_0] stroke-white antialiased"
        />
      </button>
      <button
        className="flex-1 flex flex-col py-2 box-border overflow-hidden items-center h-full w-full"
        onClick={() => {
          if (props.selectedItem !== 'Settings') router.push('/app/settings');
        }}
      >
        <MenuSettingsSVG
          isSelected={props.selectedItem === 'Settings'}
          className="flex-[1_0_0] stroke-white antialiased"
        />
      </button>
    </nav>
  );
};

export default AppMenu;
