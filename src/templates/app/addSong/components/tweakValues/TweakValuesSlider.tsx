import type { MutableRefObject, Reducer, RefObject } from 'react';
import { createRef, useEffect, useReducer, useRef, useState } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import type { ITweakValuesSliderSVGProps } from '@/utils/interfaces/TweakValuesSliderSVGInterface';
import useWindowSize from '@/utils/useWindowSize';

type ITweakValuesSliderProps = {
  title: string;
  color: string;
  svgColor?: string;
  innerHeight?: string;
  breakpoints: { [percentage: number]: string };
  arbitraryValue?: boolean;
  SvgElement: (props: ITweakValuesSliderSVGProps) => any;
  percentageCallback: (percentage: number) => any;
};

type ITweakValuesSliderState = {
  /* debounced to prevent useless calls */
  containerBoundingClientRect: DOMRect;
  /* key list */
  breakpointKeys: Array<number>;
  isDragBtnDown: boolean;
  arbitraryValue: boolean;
  dragBtnRef: RefObject<HTMLDivElement>;
  stateRef: MutableRefObject<Partial<ITweakValuesSliderState>>;
  bgLineRef: RefObject<SVGLineElement>;
  /* callbacks */
  computeMouseData: (e: { pageX: number }) => [number, number];
  btnOnMouseMoveCallback: Function;
  btnOnMouseUpCallback: Function;
};

const TweakValuesSlider = (
  props: IStylePropsInterface & ITweakValuesSliderProps
) => {
  const containerRef = useRef<HTMLDivElement & ITweakValuesSliderState>(null);
  const bgLineRef = useRef<SVGLineElement>(null);
  const dragBtnRef = useRef<HTMLDivElement>(null);
  const breakpointDescRef = useRef<HTMLDivElement>(null);

  /* breakpoint lines references */
  const breakpointsRefs = useRef<{
    [value: number]: RefObject<SVGLineElement>;
  }>({});
  /* breakpoint elements */
  const [breakpointsJSX, setBreakpointsJSX] = useState<Array<JSX.Element>>([]);

  /* it's no use to put state values in useState since they're
   * "DOM-related" so let's save some renders by doing it in a ref */
  const stateRef = useRef<Partial<ITweakValuesSliderState>>({});
  const windowSize = useWindowSize();
  const [percentage, setPercentage] = useState(0);

  /* better to export currentBreakpoint style logic in a reducer to
   * prevent callbacks recreation each time currentBreakpoint is
   * edited which happens a lot */
  const [currentBreakpoint, setCurrentBreakpoint] = useReducer<
    Reducer<number | undefined, number | undefined>
  >((state, update) => {
    /* check + prevent useless reassignation */
    if (
      update !== undefined &&
      state !== update &&
      breakpointsRefs.current[update]?.current
    ) {
      /* styling */
      breakpointsRefs.current[update]!.current!.style.strokeWidth = '6';
    }
    if (
      state !== undefined &&
      state !== update &&
      breakpointsRefs.current[state]?.current
    ) {
      /* reset the last one if there was one */
      breakpointsRefs.current[state]!.current!.style.strokeWidth = '';
    }
    return update;
  }, undefined);

  useEffect(() => {
    containerRef.current!.isDragBtnDown = false;
    containerRef.current!.dragBtnRef = dragBtnRef;
    containerRef.current!.stateRef = stateRef;
    containerRef.current!.bgLineRef = bgLineRef;

    /* compute mousedata callback */
    containerRef.current!.computeMouseData = function computeMouseData(
      this: HTMLDivElement & ITweakValuesSliderState,
      e: { pageX: number }
    ) {
      const values: [number, number] = [-1, -1];
      if (
        !this.stateRef.current.containerBoundingClientRect ||
        !this.stateRef.current.breakpointKeys
      )
        return values;
      /* compute the percentage on the div and cap it between 0 and 100 */
      values[0] = Math.min(
        Math.max(
          0,
          (-100 *
            (this.stateRef.current.containerBoundingClientRect.x - e.pageX)) /
            this.stateRef.current.containerBoundingClientRect.width
        ),
        100
      );
      /* get the closest value based on the previously computed value */
      values[1] = this.stateRef.current.breakpointKeys.reduce((prev, curr) =>
        Math.abs(curr - values[0]) < Math.abs(prev - values[0]) ? curr : prev
      );
      return values;
    }.bind(containerRef.current!);

    /* event listeners callbacks */
    const btnOnMouseMoveCallback = function btnOnMouseMoveCallback(
      this: HTMLDivElement & ITweakValuesSliderState,
      e: { pageX: number }
    ) {
      if (!this.isDragBtnDown) return;
      const [mousePercentage, closestValue] = this.computeMouseData(e);
      setPercentage(mousePercentage);
      setCurrentBreakpoint(closestValue);
    }.bind(containerRef.current!);

    const btnOnMouseUpCallback = function btnOnMouseUpCallback(
      this: HTMLDivElement & ITweakValuesSliderState,
      e: { pageX: number }
    ) {
      if (!this.isDragBtnDown) return;
      this.dragBtnRef.current!.classList.add('transition-all');
      const [mousePercentage, closestValue] = this.computeMouseData(e);
      const value = this.stateRef.current!.arbitraryValue
        ? mousePercentage
        : closestValue;
      setPercentage(value);
      this.bgLineRef.current!.style.strokeWidth = '';
      setCurrentBreakpoint(undefined);
      this.isDragBtnDown = false;
      /* the percentage callback won't be updated after first affectation
       * since it isn't in any useEffect (wanted) */
      props.percentageCallback(value);
    }.bind(containerRef.current!);

    /* keep refs for touch logic */
    containerRef.current!.btnOnMouseMoveCallback = btnOnMouseMoveCallback;
    containerRef.current!.btnOnMouseUpCallback = btnOnMouseUpCallback;

    document.addEventListener('mousemove', btnOnMouseMoveCallback);
    document.addEventListener('mouseup', btnOnMouseUpCallback);

    return () => {
      document.removeEventListener('mousemove', btnOnMouseMoveCallback);
      document.removeEventListener('mouseup', btnOnMouseUpCallback);
    };
  }, []);

  useEffect(() => {
    /* window size listener */
    if (!stateRef.current) return;
    stateRef.current.containerBoundingClientRect =
      containerRef.current?.getBoundingClientRect();
  }, [windowSize.width]);

  useEffect(() => {
    /* arbitrary value flag update inside a ref */
    if (stateRef.current)
      stateRef.current.arbitraryValue = !!props.arbitraryValue;
  }, [props.arbitraryValue]);

  useEffect(() => {
    /* breakpoints creation when the prop is edited */
    const keys = Object.keys(props.breakpoints).map((value) => Number(value));
    breakpointsRefs.current = {};
    setBreakpointsJSX(
      keys.map((value) => {
        /* can't directly use useRef since it's inside a callback so
         * i'm doing the process by step */
        breakpointsRefs.current[value] = createRef();
        return (
          <line
            ref={breakpointsRefs.current[value]}
            className="transition-all"
            key={value}
            strokeWidth={2}
            x1={`${value}%`}
            x2={`${value}%`}
            y1="30%"
            y2="70%"
          />
        );
      })
    );
    if (stateRef.current) stateRef.current.breakpointKeys = keys;
    return () => {
      if (stateRef.current) stateRef.current.breakpointKeys = undefined;
    };
  }, [props.breakpoints]);

  /* breakpoint style after-logic */
  useEffect(() => {
    /* checks ref integrity */
    if (
      !breakpointDescRef.current ||
      (currentBreakpoint &&
        !breakpointsRefs.current[currentBreakpoint]?.current)
    )
      return;
    /* undefined (reset) case */
    if (currentBreakpoint === undefined) {
      breakpointDescRef.current.style.visibility = '';
      return;
    }
    /* filling the breakpoint description and position it */
    breakpointDescRef.current.innerText =
      props.breakpoints[currentBreakpoint] || '';
    breakpointDescRef.current.style.left = `calc(${currentBreakpoint}% - ${
      breakpointDescRef.current.offsetWidth / 2
    }px)`;
    /* showing it if it's not yet the case */
    if (!breakpointDescRef.current.style.visibility)
      breakpointDescRef.current.style.visibility = 'visible';
  }, [currentBreakpoint]);

  /* the component should not receive padding on the x-axis since the computation
   * is based on the container instead of the svg, it would be simple to add but
   * i have no need for that */
  return (
    <div
      ref={containerRef}
      style={{ color: props.color }}
      className={`relative ${props.className}`}
      onMouseEnter={() => {
        /* update the background line */
        if (bgLineRef.current) bgLineRef.current!.style.strokeWidth = '3';
      }}
      onMouseMove={(e) => {
        /* ref integrity bc events assignations spawn before useEffect
         * + check that the btn isn't drag to avoid logic duplication */
        if (
          !containerRef.current ||
          !containerRef.current.computeMouseData ||
          containerRef.current.isDragBtnDown
        )
          return;
        const [, closestValue] = containerRef.current.computeMouseData(e);
        if (closestValue === -1) return;
        setCurrentBreakpoint(closestValue);
      }}
      onMouseLeave={() => {
        /* avoid logic duplication */
        if (!containerRef.current || containerRef.current.isDragBtnDown) return;
        /* reset the background line */
        if (bgLineRef.current) bgLineRef.current!.style.strokeWidth = '';
        setCurrentBreakpoint(undefined);
      }}
      onMouseDown={() => {
        if (containerRef.current) containerRef.current.isDragBtnDown = true;
        /* disable transition while dragging */
        if (dragBtnRef.current)
          dragBtnRef.current.classList.remove('transition-all');
      }}
      /* touch logic is the same as mouse */
      onTouchStartCapture={() => {
        /* update the background line */
        if (bgLineRef.current) bgLineRef.current!.style.strokeWidth = '3';
        if (containerRef.current) containerRef.current.isDragBtnDown = true;
        if (dragBtnRef.current)
          dragBtnRef.current.classList.remove('transition-all');
      }}
      onTouchMoveCapture={(e) => {
        if (
          !containerRef.current ||
          !containerRef.current.btnOnMouseMoveCallback
        )
          return;
        containerRef.current.btnOnMouseMoveCallback(e.targetTouches.item(0)!);
      }}
      onTouchEndCapture={(e) => {
        if (!containerRef.current || !containerRef.current.btnOnMouseUpCallback)
          return;
        containerRef.current.btnOnMouseUpCallback(e.changedTouches.item(0)!);
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby="title"
        className="w-full overflow-visible"
        style={{ height: props.innerHeight || '20px' }}
        strokeLinejoin="round"
        strokeLinecap="round"
        stroke="currentColor"
      >
        <title>
          {props.title} - Current value: {percentage}%
        </title>
        <line
          ref={bgLineRef}
          className="transition-all"
          strokeWidth={2.5}
          x1="0.1%"
          x2="99.9%"
          y1="50%"
          y2="50%"
        />
        <g id="tweak-breakpoints">{breakpointsJSX}</g>
      </svg>
      <div
        ref={dragBtnRef}
        id="drag-button"
        className="cursor-pointer box-border p-1 absolute top-[calc(50%-10px)] rounded-full origin-center -translate-x-1/2 scale-100"
        style={{
          height: props.innerHeight || '20px',
          width: props.innerHeight || '20px',
          backgroundColor: props.color,
          left: `${percentage}%`,
        }}
      >
        <props.SvgElement
          percentage={percentage}
          className="w-full h-full"
          style={{ color: props.svgColor || '#ffffff' }}
        />
      </div>
      <div
        ref={breakpointDescRef}
        className="absolute select-none top-[calc(50%-30px)] text-xs border-current border-[1px] px-1 rounded transition invisible"
      ></div>
    </div>
  );
};

export default TweakValuesSlider;
