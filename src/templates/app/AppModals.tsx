import gsap from 'gsap';
import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const AppModals = (props: IBasicPropsInterface) => {
  const router = useRouter();
  const modalContainerRef = useRef<HTMLDivElement>(null);
  const modalContainerTl = useRef<gsap.core.Timeline>(
    gsap.timeline({ paused: true })
  );
  const modalXlRef = useRef<HTMLDivElement>(null);
  const modalXlTl = useRef<gsap.core.Timeline>(gsap.timeline({ paused: true }));
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* using display instead of dom removal allows to control the animation when the user is navigating */
      modalContainerTl.current
        .set(modalContainerRef.current, { css: { display: 'block' } })
        .to(modalContainerRef.current, {
          backgroundColor: 'rgba(0,0,0,0.5)',
          duration: 0.5,
        });
      modalXlTl.current
        .set(modalXlRef.current, { css: { display: 'block' } })
        .from(modalXlRef.current, { translateY: '+=100%', duration: 0.3 }, 0)
        .to(modalXlRef.current, { opacity: 1, duration: 0.3 }, 0);
    });

    return () => {
      ctx.revert();
    };
  }, []);

  useEffect(() => {
    if (router.query.md) {
      modalContainerTl.current.play();
      modalXlTl.current.play();
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
        className="absolute hidden opacity-0 bottom-0 w-full h-[90%] rounded-t bg-slate-600"
        ref={modalXlRef}
      ></div>
      <div></div>
    </div>
  );
};

export default AppModals;
