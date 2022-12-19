import LoadingLogoSVG from '@/svgs/LoadingLogo';

/* loading screen for the xl modal */
const ModalXlLoading = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center overflow-hidden animate-pulse">
      <LoadingLogoSVG className="text-white flex-[0_0_80%]" />
    </div>
  );
};

export default ModalXlLoading;
