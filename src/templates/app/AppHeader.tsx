import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';

type IAppHeaderProps = {
  title: string;
  description?: string;
};

const AppHeader = (
  props: IAppHeaderProps & IBasicPropsInterface
): JSX.Element => {
  return (
    <div
      className={`${props.className} flex flex-row h-full box-border select-none`}
    >
      <div className="flex-[0_1_100%] flex flex-col flex-nowrap justify-center box-border p-4 overflow-hidden">
        <h1 className="text-2xl font-bold m-0 p-0 text-ellipsis overflow-hidden flex-[0_0_auto] text-white opacity-90">
          {props.title}
        </h1>
        {props.description && (
          <h3 className="text-xs italic text-ellipsis overflow-hidden flex-[0_0_auto]">
            {props.description}
          </h3>
        )}
      </div>
      {props.children && props.children}
    </div>
  );
};

export default AppHeader;
