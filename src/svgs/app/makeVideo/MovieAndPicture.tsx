import gsap from 'gsap';
import { useEffect, useRef } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const MovieAndPictureSVG = (
  props: IStylePropsInterface & { runAnimation: boolean }
) => {
  const pictureRef = useRef<SVGSVGElement>(null);
  const movieRef = useRef<SVGSVGElement>(null);
  const movieAndPictureTlRef = useRef<gsap.core.Timeline>(
    gsap.timeline({ paused: true, repeat: -1, repeatDelay: 2.5, yoyo: true })
  );

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      movieAndPictureTlRef.current
        .fromTo(
          movieRef.current,
          { opacity: 1, translateX: '0px', translateY: '0px', rotate: 0 },
          {
            duration: 0.3,
            translateX: '-3px',
            translateY: '3px',
            rotate: -3,
            opacity: 0.5,
          },
          0
        )
        .to(
          movieRef.current,
          {
            duration: 0.3,
            translateX: '12px',
            translateY: '-12px',
            rotate: 0,
            opacity: 0.1,
          },
          0.3
        )
        .fromTo(
          pictureRef.current,
          { translateX: '12px', translateY: '-12px', opacity: 0.1, rotate: 0 },
          {
            duration: 0.3,
            translateX: '15px',
            translateY: '-15px',
            opacity: 0.5,
            rotate: 3,
          },
          0
        )
        .to(
          pictureRef.current,
          {
            duration: 0.3,
            translateX: '0px',
            translateY: '0px',
            rotate: 0,
            opacity: 1,
          },
          0.3
        );
    });

    return () => ctx.revert();
  }, []);
  useEffect(() => {
    if (props.runAnimation) movieAndPictureTlRef.current.play(0);
    else movieAndPictureTlRef.current.pause(0);
  }, [props.runAnimation]);

  return (
    <div className={`${props.className} relative flex justify-center`}>
      <svg
        ref={pictureRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute h-full origin-center translate-x-3 -translate-y-3 opacity-10"
        style={{
          opacity: '10%',
          transform: 'translate(12px, -12px)',
        }}
      >
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
        <circle cx="8.113" cy="8.099" r="1.666"></circle>
        <polyline points="21.994 15.317 16.442 9.765 4.227 21.98"></polyline>
      </svg>

      <svg
        ref={movieRef}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="absolute h-full origin-center"
      >
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
        <line x1="7" y1="2" x2="7" y2="22"></line>
        <line x1="17" y1="2" x2="17" y2="22"></line>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <line x1="2" y1="7" x2="7" y2="7"></line>
        <line x1="2" y1="17" x2="7" y2="17"></line>
        <line x1="17" y1="17" x2="22" y2="17"></line>
        <line x1="17" y1="7" x2="22" y2="7"></line>
      </svg>
    </div>
  );
};

export default MovieAndPictureSVG;
