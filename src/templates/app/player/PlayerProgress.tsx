import gsap from 'gsap';
import type { MouseEvent } from 'react';
import { useEffect, useRef } from 'react';

import useIsomorphicLayoutEffect from '../../../utils/useIsomorphicLayoutEffect';
import useWindowSize from '../../../utils/useWindowSize';

type IProgressBarProps = {
  setNewPercentage: any;
  onMouseMoveCallback: any;
  onMouseUpCallback: any;
  isDragging: boolean;
  /* this will be debounced since i don't know if it's "perf-eating" */
  boundingClientRect: DOMRect;
  /* on desktop the app container is surrounded by "blank" space
   * and the percentage computation needs this information */
  appDisplayXOffset: number;
  underlineRef: SVGLineElement;
  circleRef: SVGCircleElement;
};

const PlayerProgress = () => {
  const windowSize = useWindowSize();
  const underlineRef = useRef<SVGLineElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const playerProgressRef = useRef<SVGSVGElement & IProgressBarProps>(null);
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {});

    playerProgressRef.current!.setNewPercentage = function setNewPercentage(
      this: SVGSVGElement & IProgressBarProps,
      clientX: number
    ) {
      /* the new percentage considers only the app-display plane, it is then
       * capped between 5 and 95 */
      const newPercentage = Math.min(
        Math.max(
          5,
          ((clientX - playerProgressRef.current!.appDisplayXOffset) * 100) /
            (playerProgressRef.current!.boundingClientRect.x +
              playerProgressRef.current!.boundingClientRect.width -
              playerProgressRef.current!.appDisplayXOffset)
        ),
        95
      );
      playerProgressRef.current!.circleRef.setAttribute(
        'cx',
        `${newPercentage}%`
      );
      playerProgressRef.current!.underlineRef.setAttribute(
        'x2',
        `${newPercentage}%`
      );
    };
    /* mouse logic to have some ux */
    playerProgressRef.current!.onMouseUpCallback = function onMouseUpCallback(
      this: SVGSVGElement & IProgressBarProps
    ) {
      this.isDragging = false;
    }.bind(playerProgressRef.current!);
    playerProgressRef.current!.onMouseMoveCallback =
      function onMouseMoveCallback(
        this: SVGSVGElement & IProgressBarProps,
        e: MouseEvent
      ) {
        if (!this.isDragging) return;
        this.setNewPercentage(e.clientX);
      }.bind(playerProgressRef.current!);
    playerProgressRef.current!.underlineRef = underlineRef.current!;
    playerProgressRef.current!.circleRef = circleRef.current!;

    window.addEventListener(
      'mouseup',
      playerProgressRef.current!.onMouseUpCallback
    );
    window.addEventListener(
      'mousemove',
      playerProgressRef.current!.onMouseMoveCallback
    );

    return () => {
      window.removeEventListener(
        'mouseup',
        playerProgressRef.current!.onMouseUpCallback
      );
      window.removeEventListener(
        'mousemove',
        playerProgressRef.current!.onMouseMoveCallback
      );
      ctx.revert();
    };
  }, []);
  useEffect(() => {
    playerProgressRef.current!.boundingClientRect =
      playerProgressRef.current!.getBoundingClientRect();
    playerProgressRef.current!.appDisplayXOffset = document
      .querySelector('#app-display')!
      .getBoundingClientRect().x;
  }, [windowSize.width]);
  return (
    <div className="border-2 w-full h-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="stroke-white border-red-700 border-2 w-full h-full overflow-visible cursor-pointer"
        strokeWidth="1"
        strokeLinecap="round"
        aria-labelledby="title"
        ref={playerProgressRef}
        /* triggers the dragging event & also acts as onClick */
        onMouseDown={(e) => {
          playerProgressRef.current!.isDragging = true;
          playerProgressRef.current?.setNewPercentage(e.clientX);
        }}
        /* touch logic is butter compared as the mouse one */
        onTouchMoveCapture={(e) => {
          playerProgressRef.current?.setNewPercentage(
            e.targetTouches.item(0)!.clientX
          );
        }}
      >
        <title>Current progress of the playback</title>
        <line x1="5%" x2="95%" y1="50%" y2="50%" fill="none" />
        <line
          ref={underlineRef}
          y2="50%"
          x2="45%"
          y1="50%"
          x1="5%"
          fill="none"
          strokeWidth="3"
        />
        <circle ref={circleRef} cy="50%" cx="45%" r="10" />
      </svg>
    </div>
  );
};

export default PlayerProgress;
