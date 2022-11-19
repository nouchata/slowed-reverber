import type { IAppMenuSvg } from '@/utils/interfaces/AppMenuInterface';
import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

type IAppMenuProps = {
  menuItems: { [value: string]: (props: IAppMenuSvg) => JSX.Element };
  selectedItem: string;
};

const AppMenu = (props: IStylePropsInterface & IAppMenuProps): JSX.Element => {
  /* the figurecaption was a bit too much but is working if uncommented */
  return (
    <div className={`${props.className} flex flex-row h-full box-border`}>
      {Object.entries(props.menuItems).map(([entryString, EntryImage]) => {
        return (
          <button
            key={entryString}
            className="flex-1 flex flex-col py-2 box-border overflow-hidden items-center h-full w-full"
          >
            {/* <figure className="flex flex-col pt-[2px] box-border overflow-hidden items-center h-full w-full"> */}
            <EntryImage
              isSelected={props.selectedItem === entryString}
              className="flex-[1_0_0] stroke-white antialiased"
            />
            {/* <figcaption
                  className={`text-xs text-white ${
                    props.selectedItem === entryString ? 'font-bold' : ''
                  }`}
                >
                  {entryString}
                </figcaption>
              </figure> */}
          </button>
        );
      })}
    </div>
  );
};

export default AppMenu;
