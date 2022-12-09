import type { MouseEvent } from 'react';
import { useContext, useEffect, useRef } from 'react';

import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

import useWindowSize from '../../../utils/useWindowSize';

type IProgressBarProps = {
  setNewPercentage: any;
  onMouseMoveCallback: any;
  onMouseUpCallback: any;
  isDragging: boolean;
  /* this will be debounced since i don't know if it's "perf-eating" */
  boundingClientRect: DOMRect;
  underlineRef: SVGLineElement;
  circleRef: SVGCircleElement;
};

/* could easily have been an input range but i wanted to try to
 * make it from scratch */
const PlayerProgressState = (props: IStylePropsInterface) => {
  const windowSize = useWindowSize();
  const underlineRef = useRef<SVGLineElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const playerProgressRef = useRef<SVGSVGElement & IProgressBarProps>(null);
  const { soundsManager, isCurrentSoundReady } =
    useContext(SoundsManagerContext);
  useEffect(() => {
    /* extra ref values assignations */
    playerProgressRef.current!.isDragging = false;

    /* mouse logic to have some ux */
    playerProgressRef.current!.onMouseUpCallback = function onMouseUpCallback(
      this: SVGSVGElement & IProgressBarProps,
      e: MouseEvent
    ) {
      if (!this.isDragging) return;
      this.setNewPercentage(e.clientX, false, true);
      this.isDragging = false;
    }.bind(playerProgressRef.current!);

    playerProgressRef.current!.onMouseMoveCallback =
      function onMouseMoveCallback(
        this: SVGSVGElement & IProgressBarProps,
        e: MouseEvent
      ) {
        if (!this.isDragging) return;
        this.setNewPercentage(e.clientX, false, false);
      }.bind(playerProgressRef.current!);

    /* useRef seems to unload before the cleanup callback of useEffect so I
     * keep references of the registered callbacks outside */
    const playerProgressOnMouseUpCallback =
      playerProgressRef.current!.onMouseUpCallback;
    const playerProgressOnMouseMoveCallback =
      playerProgressRef.current!.onMouseMoveCallback;
    /* refs references */
    playerProgressRef.current!.underlineRef = underlineRef.current!;
    playerProgressRef.current!.circleRef = circleRef.current!;

    /* event assignations */
    window.addEventListener(
      'mouseup',
      playerProgressRef.current!.onMouseUpCallback
    );
    window.addEventListener(
      'mousemove',
      playerProgressRef.current!.onMouseMoveCallback
    );

    return () => {
      window.removeEventListener('mouseup', playerProgressOnMouseUpCallback);
      window.removeEventListener(
        'mousemove',
        playerProgressOnMouseMoveCallback
      );
    };
  }, []);
  useEffect(() => {
    playerProgressRef.current!.boundingClientRect =
      playerProgressRef.current!.getBoundingClientRect();
  }, [windowSize.width]);
  /* running the idle updating bar loop and defining the setNewPercentage here since they're
   * state linked */
  useEffect(() => {
    let runtime = true;
    const updateProgressBar = async () => {
      if (runtime && isCurrentSoundReady) {
        if (playerProgressRef.current && !playerProgressRef.current.isDragging)
          playerProgressRef.current.setNewPercentage(
            soundsManager!.getCurrentPercentage() * 100,
            true,
            false
          );
        /* requestAnimationFrame cpu usage is crazy, setInterval messes w/ gsap so here's the fix */
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(1);
          }, 1000 / 2);
        });
        // requestAnimationFrame(animate);
        updateProgressBar();
      }
    };
    updateProgressBar();

    /* extra ref values assignations */
    playerProgressRef.current!.setNewPercentage = function setNewPercentage(
      this: SVGSVGElement & IProgressBarProps,
      value: number,
      isAlreadyAPercentage?: boolean,
      triggersPlaybackUpdate?: boolean
    ) {
      /* we need to work relatively based on the x offset of the svg, the
       * percentage is then capped between 0 and 100 */
      const newPercentage = isAlreadyAPercentage
        ? Math.min(Math.max(0, value), 100)
        : Math.min(
            Math.max(
              0,
              ((value - playerProgressRef.current!.boundingClientRect.x) *
                100) /
                (playerProgressRef.current!.boundingClientRect.x +
                  playerProgressRef.current!.boundingClientRect.width -
                  playerProgressRef.current!.boundingClientRect.x)
            ),
            100
          );
      playerProgressRef.current!.circleRef.setAttribute(
        'cx',
        `${newPercentage}%`
      );
      playerProgressRef.current!.underlineRef.setAttribute(
        'x2',
        `${newPercentage}%`
      );
      if (isCurrentSoundReady && triggersPlaybackUpdate)
        soundsManager!.updateAudioPosition(newPercentage);
    };
    return () => {
      runtime = false;
    };
  }, [isCurrentSoundReady]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer overflow-visible ${props.className}`}
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-labelledby="title"
      ref={playerProgressRef}
      /* triggers the dragging event ; the onClick logic is set to the
       * mouseUp event */
      onMouseDown={() => {
        playerProgressRef.current!.isDragging = true;
      }}
      /* touch logic is butter compared as the mouse one */
      onTouchStartCapture={() => {
        playerProgressRef.current!.isDragging = true;
      }}
      onTouchMoveCapture={(e) => {
        playerProgressRef.current?.setNewPercentage(
          e.targetTouches.item(0)!.clientX,
          false,
          false
        );
      }}
      onTouchEndCapture={(e) => {
        playerProgressRef.current?.setNewPercentage(
          e.changedTouches.item(0)!.clientX,
          false,
          true
        );
        playerProgressRef.current!.isDragging = false;
      }}
    >
      <title>Current progress of the playback</title>
      <line x1="0%" x2="100%" y1="50%" y2="50%" fill="none" />
      <line
        ref={underlineRef}
        x1="0%"
        x2="0%"
        y1="50%"
        y2="50%"
        fill="none"
        strokeWidth="3"
      />
      <circle ref={circleRef} cy="50%" cx="0%" r="7" fill="currentColor" />
    </svg>
  );
};

export default PlayerProgressState;
