import gsap from 'gsap';
import { useRef } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

type IIndexArrowProps = {
  direction: 'up' | 'down';
  noticeMeAnimation?: boolean;
};

const IndexArrowSVG = (
  props: IStylePropsInterface & IIndexArrowProps
): JSX.Element => {
  /* gsap stuff */
  const showingTlRef = useRef<gsap.core.Timeline>(gsap.timeline());
  const indexArrowSvgRef = useRef<SVGSVGElement>(null);
  useIsomorphicLayoutEffect(() => {
    const arrowForm = props.direction === 'up' ? 25 : 5;
    const arrowMovement = props.direction === 'up' ? -10 : 10;
    const ctx = gsap.context(() => {
      showingTlRef.current
        .to('line', {
          // this animation runs the initial form of the arrow
          attr: {
            y1: (i) => (i === 1 ? 15 : arrowForm),
            y2: (i) => (i === 1 ? arrowForm : 15),
          },
          duration: 1,
        })
        .addLabel('idleAnimation')
        .to('g', {
          // this one runs the idle state where it's fading while pointing to the bottom / up
          y: arrowMovement,
          opacity: 1,
          duration: 0.8,
          repeat: -1,
          yoyo: true,
        });
    }, indexArrowSvgRef);
    return () => ctx.revert();
  }, []);
  return (
    <svg
      width="50"
      height="30"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
      style={props.style}
      ref={indexArrowSvgRef}
    >
      <title>{`Scroll ${props.direction}`}</title>
      <g
        id="arrow"
        style={{
          stroke: 'white',
          strokeWidth: '8',
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }}
        className="opacity-50"
      >
        <line id="left_side" y2="15" x2="24.75" y1="15" x1="5" fill="none" />
        <line id="right_side" y2="15" x2="45" y1="15" x1="24.75" fill="none" />
      </g>
    </svg>
  );
};

export default IndexArrowSVG;
