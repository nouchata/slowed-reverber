import gsap from 'gsap';
import Draggable from 'gsap/dist/Draggable';
import dynamic from 'next/dynamic';
import { Suspense, useContext, useEffect, useRef, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

import Player from './player/Player';
import ModalXlLoading from './xlModal/ModalXlLoading';

const AppModals = () => {
  const { router, oldRoutes } = useContext(AppDataContext).appData!;
  /* used to get app-related error messages */
  const { appData, setAppData } = useContext(AppDataContext);
  const { isSoundsManagerInit, isCurrentSoundReady } =
    useContext(SoundsManagerContext);

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
  /* player extra class if needed (to fade it for example) */
  const [playerExtraClasses, setPlayerExtraClasses] = useState('');

  /* used to shut down automatically the error modal after some time if the user hasn't */
  const timeoutErrorModal = useRef<any>(undefined);

  useIsomorphicLayoutEffect(() => {
    /* draggable ref */
    let draggable: Draggable | undefined;

    const ctx = gsap.context(() => {
      gsap.registerPlugin(Draggable);

      /* using display instead of dom removal allows to control the animation when the user is navigating */
      modalContainerTl.current
        .set(modalContainerRef.current, { css: { visibility: 'visible' } })
        .to(modalContainerRef.current, {
          backgroundColor: 'rgba(0,0,0,0.5)',
          duration: 0.3,
        });

      modalXlTl.current
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

  /* modal xl routing */
  useEffect(() => {
    /* query parameter to set a xl modal */
    if (router.query.md) {
      modalContainerTl.current.play();
      /* ensures that the invalidate() in the draggable event doesn't break the
       * animation flow */
      gsap
        .set(modalXlRef.current, { y: 0 })
        .then(() => modalXlTl.current.invalidate().play());

      /* since all xl modal pages needs the sm it waits for it to be init */
      if (!isSoundsManagerInit) return;

      /* this part handles the dynamic import of the modal files */
      if (router.pathname === '/app/songs' && router.query.md === 'addSong') {
        setXLDynamicImport(
          dynamic(() => import('./xlModal/addSong/AddSongModal'), {
            suspense: true,
          })
        );
      } else if (
        router.pathname === '/app/songs' &&
        router.query.md === 'editSong'
      ) {
        setXLDynamicImport(
          dynamic(() => import('./xlModal/addSong/AddSongModal'), {
            suspense: true,
          })
        );
      } else if (
        router.pathname === '/app/songs' &&
        router.query.md === 'viewSong'
      ) {
        setXLDynamicImport(
          dynamic(() => import('./xlModal/viewSong/ViewSongModal'), {
            suspense: true,
          })
        );
      } else if (
        router.pathname === '/app/songs' &&
        router.query.md === 'editVisual'
      ) {
        setXLDynamicImport(
          dynamic(() => import('./xlModal/addVisual/AddVisualModal'), {
            suspense: true,
          })
        );
      } else if (
        router.pathname === '/app/songs' &&
        router.query.md === 'exportMedia'
      ) {
        setXLDynamicImport(
          dynamic(() => import('./xlModal/exportMedia/ExportMediaModal'), {
            suspense: true,
          })
        );
      } else if (oldRoutes.length) router.back();
      else router.push('/app/songs');
    } else {
      modalContainerTl.current.reverse();
      modalXlTl.current.reverse();
      setXLDynamicImport(undefined);
    }
  }, [router.query.md, isSoundsManagerInit]);

  /* error reset debouncing */
  useEffect(() => {
    if (appData?.error.type === 'normal') {
      if (timeoutErrorModal.current) clearTimeout(timeoutErrorModal.current);
      timeoutErrorModal.current = setTimeout(
        () => setAppData!({ error: { type: 'none', value: '' } }),
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
        style={appData?.error.type === 'normal' ? { transform: 'none' } : {}}
        onClick={() => {
          /* a click on the error modal hides it */
          clearTimeout(timeoutErrorModal.current);
          timeoutErrorModal.current = undefined;
          setAppData!({ error: { type: 'none', value: '' } });
        }}
      >
        {appData?.error.type === 'normal' ? (
          <>
            <strong>Error:</strong> {appData.error.value}
          </>
        ) : (
          <></>
        )}
      </div>
      {/* the medium modal is also used for critical error, in the case of critical error, it can't be closed and will be showed
       * with a slightly different style */}
      {(appData?.mediumModalText || appData?.error.type === 'critical') && (
        <div
          id="app-display-medium-modal"
          className="absolute w-full h-full bg-[rgba(0,0,0,0.5)] z-50 flex justify-center items-center"
        >
          <div
            className={`${
              appData.error.type === 'critical'
                ? 'bg-app-primary-color'
                : 'bg-app-modal-xl-lighter'
            } flex-[0_0_320px] text-white box-border px-2 drop-shadow-lg rounded flex flex-col`}
          >
            {appData.error.type === 'critical' && (
              <h1 className="w-full text-center pt-4 font-bold select-none">
                Critical error
              </h1>
            )}
            <p className="w-full text-center py-4 break-words">
              {appData.error.type === 'critical'
                ? appData.error.value
                : appData.mediumModalText}
            </p>
            {appData.mediumModalText && appData.error.type !== 'critical' && (
              <button
                className="w-full py-2 border-t-2 border-t-app-modal-xl-background font-extrabold"
                onClick={() => {
                  setAppData!({ mediumModalText: '' });
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
        className={`absolute invisible w-full h-full bg-[rgba(0,0,0,0)] z-30`}
        ref={modalContainerRef}
      >
        <div
          id="app-display-xl-modal"
          className="absolute opacity-0 bottom-0 w-full h-[90%] rounded-t-lg bg-app-modal-xl-background overflow-visible"
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
            className="relative w-full h-full box-border pt-[20px] overflow-hidden"
          >
            {isSoundsManagerInit && XLDynamicImport ? (
              /* modal pages are loaded aside w/ suspense & next/dynamic for bundle size reduction */
              <Suspense fallback={<ModalXlLoading />}>
                <XLDynamicImport
                  setPlayerExtraClasses={setPlayerExtraClasses}
                />
              </Suspense>
            ) : (
              <ModalXlLoading />
            )}
            <Player
              style={{
                /* used to show the player by disable the transform property */
                transform: isCurrentSoundReady ? 'none' : undefined,
              }}
              className={`absolute bottom-5 w-[90%] left-[5%] h-12 bg-app-modal-xl-lighter drop-shadow-lg translate-y-32 transition-all z-10 ${playerExtraClasses}`}
              cutAudio={!router.query.md}
            />
          </div>
        </div>
        <div></div>
      </div>
    </>
  );
};

export default AppModals;
