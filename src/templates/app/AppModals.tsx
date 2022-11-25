import gsap from 'gsap';
import Draggable from 'gsap/dist/Draggable';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { Suspense, useContext, useEffect, useRef, useState } from 'react';

import LoadingLogoSVG from '@/svgs/LoadingLogo';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const AppModals = () => {
  const router = useRouter();
  /* used to get app-related error messages */
  const { appData, setAppData } = useContext(AppDataContext);
  /* used to get soundsmanager-related error messages */
  const { soundsManagerError } = useContext(SoundsManagerContext);

  const modalContainerRef = useRef<HTMLDivElement>(null);
  /* this tl is used to fade in/out the background of the modal container */
  const modalContainerTl = useRef<gsap.core.Timeline>(
    gsap.timeline({ paused: true })
  );

  const modalXlRef = useRef<HTMLDivElement>(null);
  /*  this tl is used to slide in the xl modal and to slide it out when the draggable is not used */
  const modalXlTl = useRef<gsap.core.Timeline>(gsap.timeline({ paused: true }));
  const modalXlDragDownRef = useRef<HTMLDivElement>(null);

  /* async loading for the xl modal content w/ next/dynamic */
  const [XLDynamicImport, setXLDynamicImport] = useState<any>(undefined);

  /* used to shut down automatically the error modal after a second if the user hasn't */
  const timeoutErrorModal = useRef<any>(undefined);

  useIsomorphicLayoutEffect(() => {
    /* draggable ref */
    let draggable: Draggable | undefined;

    const ctx = gsap.context(() => {
      gsap.registerPlugin(Draggable);
      /* using display instead of dom removal allows to control the animation when the user is navigating */

      modalContainerTl.current
        .set(modalContainerRef.current, { css: { display: 'block' } })
        .to(modalContainerRef.current, {
          backgroundColor: 'rgba(0,0,0,0.5)',
          duration: 0.3,
        });

      modalXlTl.current
        .set(modalXlRef.current, { css: { display: 'block' } })
        .from(modalXlRef.current, { y: '100%', duration: 0.3 }, 0)
        .to(
          modalXlRef.current,
          {
            opacity: 1,
            duration: 0.3,
            onComplete() {
              [draggable] = Draggable.create(modalXlRef.current, {
                cursor: 'grab',
                activeCursor: 'grabbing',
                trigger: modalXlDragDownRef.current,
                type: 'y',
                dragResistance: 0.05,
                /* prevents from pulling the modal on top */
                liveSnap: (value) => (value > 0 ? value : 0),
                onRelease(event) {
                  /* launch the close event by recomputing the animation at the
                   * current point if the modal is pulled enough, else it puts
                   * it back where it was */
                  if (event.pageY >= 300) {
                    // responsive calculation for the value could be better for some devices
                    draggable?.kill();
                    draggable = undefined;
                    modalXlTl.current.invalidate();
                    router.push('/app/songs');
                  } else {
                    draggable?.disable();
                    gsap
                      .to(modalXlRef.current, { y: '0', duration: 0.2 })
                      .then(() => draggable?.enable());
                  }
                },
              });
            },
            /* cleaning the draggable when the animation triggers w/out it */
            onReverseComplete() {
              draggable?.kill();
              draggable = undefined;
            },
          },
          0
        );
    });

    return () => {
      draggable?.kill();
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    /* query parameter to set a xl modal */
    if (router.query.md) {
      modalContainerTl.current.play();
      /* ensures that the invalidates in the draggable event doesn't break the
       * animation flow */
      gsap
        .set(modalXlRef.current, { y: 0 })
        .then(() => modalXlTl.current.invalidate().play());
      /* this part handles the dynamic import of the modal files and the extra logic
       * needed by them */
      if (router.query.md === 'addSong') {
        /* switch to the step 1 (or the correct one) if there's none given */
        if (!router.query.step)
          router.push(
            { pathname: '/app/songs/', query: { md: 'addSong', step: '1' } },
            undefined,
            { shallow: true }
          );
        setXLDynamicImport(
          dynamic(() => import('./addSong/AddSongModal'), { suspense: true })
        );
      }
    } else {
      modalContainerTl.current.reverse();
      modalXlTl.current.reverse();
      setXLDynamicImport(undefined);
    }
  }, [router.query.md]);

  useEffect(() => {
    if (appData?.error) {
      if (timeoutErrorModal.current) clearTimeout(timeoutErrorModal.current);
      timeoutErrorModal.current = setTimeout(
        () => setAppData!({ ...appData, error: undefined }),
        4000
      );
    } else {
      timeoutErrorModal.current = undefined;
    }
  }, [appData?.error]);

  return (
    <>
      <div
        id="app-display-error-modal"
        className="absolute w-4/5 top-6 left-[10%] text-white bg-red-600 cursor-pointer select-none break-words box-border p-3 rounded drop-shadow-md transition-all -translate-y-20 z-40"
        style={
          appData?.error && !appData.criticalError ? { transform: 'none' } : {}
        }
        onClick={() => {
          /* a click on the error modal hides it */
          clearTimeout(timeoutErrorModal.current);
          timeoutErrorModal.current = undefined;
          setAppData!({ ...appData, error: undefined });
        }}
      >
        {appData?.error && !appData.criticalError ? (
          <>
            <strong>Error:</strong> {appData.error}
          </>
        ) : (
          <></>
        )}
      </div>
      {/* the medium modal is also used for critical error, in the case of critical error, it can't be closed and will be showed
       * with a slightly different style */}
      {(appData?.mediumModalText || soundsManagerError) && (
        <div
          id="app-display-medium-modal"
          className="absolute w-full h-full bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center"
        >
          <div
            className={`${
              soundsManagerError
                ? 'bg-app-primary-color'
                : 'bg-app-modal-xl-lighter'
            } flex-[0_0_320px] text-white box-border px-2 drop-shadow-lg rounded flex flex-col`}
          >
            {soundsManagerError && (
              <h1 className="w-full text-center pt-4 font-bold select-none">
                Critical error
              </h1>
            )}
            <p className="w-full text-center py-4 break-words">
              {soundsManagerError || appData?.mediumModalText}
            </p>
            {appData?.mediumModalText && !soundsManagerError && (
              <button
                className="w-full py-2 border-t-2 border-t-app-modal-xl-background"
                onClick={() => {
                  setAppData!({ ...appData, mediumModalText: '' });
                }}
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
      <div
        id="app-display-xl-container"
        className={`absolute hidden w-full h-full bg-[rgba(0,0,0,0)] z-30`}
        ref={modalContainerRef}
      >
        <div
          id="app-display-xl-modal"
          className="absolute hidden opacity-0 bottom-0 w-full h-[90%] rounded-t-lg bg-app-modal-xl-background overflow-visible"
          ref={modalXlRef}
        >
          <div
            className="absolute w-full h-16 top-[-40px] flex justify-center items-end z-10"
            id="app-display-xl-modal-drag-down"
            ref={modalXlDragDownRef}
          >
            <svg
              viewBox="0 0 50 15"
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-white overflow-visible h-6"
              fill="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              aria-labelledby="title"
            >
              <title>Drag down to close the modal</title>
              <line y2="7.5" x2="45" y1="7.5" x1="5" fill="none" />
            </svg>
          </div>
          <div
            id="add-display-xl-modal-container"
            className="w-full h-full box-border pt-[20px] overflow-hidden"
          >
            {/* modal pages are loaded aside w/ suspense & next/dynamic for bundle size reduction */}
            {XLDynamicImport && (
              <Suspense
                fallback={
                  <div className="w-full h-full flex justify-center items-center overflow-hidden animate-pulse">
                    <LoadingLogoSVG className="text-white flex-[0_0_50%]" />
                  </div>
                }
              >
                <XLDynamicImport />
              </Suspense>
            )}
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
};

export default AppModals;
