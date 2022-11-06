import IndexArrowSVG from '@/svgs/IndexArrow';
import IndexLogoSVG from '@/svgs/IndexLogo';
import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

const IndexFrontData = (props: IStylePropsInterface): JSX.Element => {
  /* MOVE THE ANIMATION DATA HERE */
  return (
    <div style={props.style} className={props.className}>
      <IndexLogoSVG className="w-4/5 md:w-full h-[50vh] box-border p-10" />
      <button className="absolute w-full bottom-0 h-[20vh] box-border flex justify-center items-end pb-5 bg-transparent border-none">
        <IndexArrowSVG direction="down" />
      </button>
    </div>
  );
};

export default IndexFrontData;
