import gsap from 'gsap';
import { useEffect, useRef } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const GiphySVG = (
  props: IStylePropsInterface & { color?: string; runAnimation: boolean }
) => {
  const giphyTextTlRef = useRef<gsap.core.Timeline>(
    gsap.timeline({ paused: true, repeat: -1 })
  );

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const targets = document.querySelectorAll('#giphy-svg-text > path');
      giphyTextTlRef.current
        .fromTo(
          targets,
          { opacity: 0.9 },
          {
            stagger: 0.3,
            transformOrigin: 'center',
            ease: 'expo.in',
            scale: 1.1,
            opacity: 1,
            duration: 0.3,
            fill: gsap.utils.wrap([
              '#ff5b5b',
              '#fff152',
              '#04ff8e',
              '#00c5ff',
              '#8e2eff',
            ]),
          },
          0
        )
        .to(
          targets,
          {
            stagger: 0.3,
            transformOrigin: 'center',
            ease: 'expo.out',
            scale: 1,
            opacity: 0.9,
            duration: 0.3,
          },
          0.3
        )
        .to(targets, { fill: props.color || '#ffffff', duration: '0.2' }, '>');
    });

    return () => ctx.revert();
  }, []);
  useEffect(() => {
    if (props.runAnimation) giphyTextTlRef.current.play(0);
    else giphyTextTlRef.current.pause(0);
  }, [props.runAnimation]);
  return (
    <svg
      className={props.className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 163.79999999999998 35"
    >
      <g fill="none" fillRule="evenodd">
        <path d="M4 4h20v27H4z" fill="#000" />
        <g fillRule="nonzero">
          <path d="M0 3h4v29H0z" fill="#04ff8e" />
          <path d="M24 11h4v21h-4z" fill="#8e2eff" />
          <path d="M0 31h28v4H0z" fill="#00c5ff" />
          <path d="M0 0h16v4H0z" fill="#fff152" />
          <path d="M24 8V4h-4V0h-4v12h12V8" fill="#ff5b5b" />
          <path d="M24 16v-4h4" fill="#551c99" />
        </g>
        <path d="M16 0v4h-4" fill="#999131" />
        <g id="giphy-svg-text" fill="currentColor" fillRule="nonzero">
          <path d="M 59.1 12 C 57.1 10.1 54.7 9.6 52.9 9.6 C 48.5 9.6 45.6 12.2 45.6 17.6 C 45.6 21.1 47.4 25.400000000000002 52.9 25.400000000000002 C 54.3 25.400000000000002 56.6 25.1 58.1 24.000000000000004 L 58.1 20.500000000000004 L 51.2 20.500000000000004 L 51.2 14.500000000000004 L 64.5 14.500000000000004 L 64.5 26.6 C 62.8 30.1 58.1 31.900000000000002 52.8 31.900000000000002 C 42.099999999999994 31.900000000000002 38 24.700000000000003 38 17.6 C 38 10.5 42.7 3.2 52.9 3.2 C 56.699999999999996 3.2 60 4 63.599999999999994 7.6000000000000005 L 59.1 12 Z"></path>
          <path d="M 68.2 31.2 L 68.2 4 L 75.8 4 L 75.8 31.2 L 68.2 31.2 Z"></path>
          <path d="M 88.3 23.8 L 88.3 31.1 L 80.6 31.1 L 80.6 4 L 93.8 4 C 101.1 4 104.7 8.6 104.7 13.9 C 104.7 19.5 101.1 23.8 93.8 23.8 L 88.3 23.8 Z M 88.3 17.3 L 93.8 17.3 C 95.9 17.3 97 15.7 97 14 C 97 12.2 95.9 10.6 93.8 10.6 L 88.3 10.6 L 88.3 17.3 Z"></path>
          <path d="M 125 31.2 L 125 20.9 L 115.2 20.9 L 115.2 31.2 L 107.5 31.2 L 107.5 4 L 115.2 4 L 115.2 14.3 L 125 14.3 L 125 4 L 132.6 4 L 132.6 31.2 L 125 31.2 Z"></path>
          <path d="M 149.2 13.3 L 155.1 4 L 163.79999999999998 4 L 163.79999999999998 4.3 L 152.99999999999997 20.3 L 152.99999999999997 31.1 L 145.29999999999998 31.1 L 145.29999999999998 20.3 L 135 4.3 L 135 4 L 143.7 4 L 149.2 13.3 Z"></path>
        </g>
      </g>
    </svg>
  );
};

export default GiphySVG;
