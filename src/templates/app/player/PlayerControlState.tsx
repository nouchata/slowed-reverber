import gsap from 'gsap';
import { useEffect, useRef } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const PlayerControlState = (
  props: IStylePropsInterface & { isPaused: boolean }
) => {
  const playRef = useRef<SVGGElement>(null);
  const pauseRef = useRef<SVGGElement>(null);
  const switchTl = useRef<gsap.core.Timeline>(gsap.timeline({ paused: true }));
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      switchTl.current
        .to(
          playRef.current,
          {
            opacity: 0,
            duration: 0.2,
          },
          0
        )
        .to(
          pauseRef.current,
          {
            opacity: 1,
            duration: 0.2,
          },
          0
        );
    });

    return () => ctx.revert();
  }, []);
  useEffect(() => {
    if (props.isPaused) switchTl.current.reverse();
    else switchTl.current.play();
  }, [props.isPaused]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <title>{`Press to ${props.isPaused ? 'play' : 'pause'} the audio`}</title>
      <g ref={playRef}>
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
      </g>
      <g ref={pauseRef} className="opacity-0">
        <rect x="6" y="4" width="4" height="16"></rect>
        <rect x="14" y="4" width="4" height="16"></rect>
      </g>
    </svg>
  );
};

export default PlayerControlState;
