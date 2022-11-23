import gsap from 'gsap';
import Draggable from 'gsap/dist/Draggable';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const AppModals = (props: IBasicPropsInterface) => {
  const router = useRouter();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  /* this tl is used to fade in/out the background of the modal container */
  const modalContainerTl = useRef<gsap.core.Timeline>(
    gsap.timeline({ paused: true })
  );
  const modalXlRef = useRef<HTMLDivElement>(null);
  /*  this tl is used to slide in the xl modal and to slide it out when the draggable is not used */
  const modalXlTl = useRef<gsap.core.Timeline>(gsap.timeline({ paused: true }));
  const modalXlDragDownRef = useRef<HTMLDivElement>(null);
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
    if (router.query.md) {
      modalContainerTl.current.play();
      /* ensures that the invalidates in the draggable event doesn't break the
       * animation flow */
      gsap
        .set(modalXlRef.current, { y: 0 })
        .then(() => modalXlTl.current.invalidate().play());
    } else {
      modalContainerTl.current.reverse();
      modalXlTl.current.reverse();
    }
  }, [router.query.md]);
  return (
    <div
      id="app-display-modal-container"
      className={`absolute hidden w-full h-full bg-[rgba(0,0,0,0)] ${props.className}`}
      ref={modalContainerRef}
    >
      <div
        id="app-display-xl-modal"
        className="absolute hidden opacity-0 bottom-0 w-full h-[90%] rounded-t-lg bg-[#22252A] overflow-visible"
        ref={modalXlRef}
      >
        <div
          className="absolute w-full h-16 top-[-40px] flex justify-center items-end z-10"
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
      </div>
      <div></div>
    </div>
  );
};

export default AppModals;
