import gsap from 'gsap';
import { useRef } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const ExtractFromDatabaseSVG = (
  props: IStylePropsInterface & { fillColor: string }
) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const databaseSvgRef = useRef<SVGImageElement>(null);
  const boxSvgRef = useRef<SVGImageElement>(null);
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      /* database jiggling */
      gsap.fromTo(
        databaseSvgRef.current,
        {
          rotate: '-5deg',
          transformOrigin: 'center',
        },
        {
          rotate: '5deg',
          duration: '0.1',
          ease: 'none',
          repeat: -1,
          yoyo: true,
        }
      );
      /* small binary numbers creation */
      gsap.to(svgRef.current, {
        onRepeat() {
          if (svgRef.current) {
            const newElem = document.createElementNS(
              'http://www.w3.org/2000/svg',
              'text'
            );
            newElem.style.color = 'white';
            newElem.style.fill = 'white';
            newElem.style.fontSize = '1rem';
            newElem.setAttribute('x', '15%');
            newElem.setAttribute('y', `${Math.random() * (65 - 35) + 35}%`);
            newElem.textContent = String(Math.round(Math.random()));
            svgRef.current?.prepend(newElem);
            gsap.to(newElem, {
              attr: { x: '85%' },
              // x: '85%',
              duration: 1,
              ease: 'power2.out',
              onComplete() {
                /* clear from dom */
                svgRef.current?.removeChild(newElem);
                /* box animation */
                if (boxSvgRef.current)
                  gsap.fromTo(
                    boxSvgRef.current,
                    { scaleY: 1, transformOrigin: 'bottom' },
                    { scaleY: 1.2, ease: 'power4.out', repeat: 1, yoyo: true }
                  );
              },
            });
          }
        },
        duration: 0.2,
        repeat: -1,
      });
    });
    return () => ctx.revert();
  }, []);
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      className={`${props.className} text-white`}
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      aria-labelledby="title"
    >
      <title>Extraction</title>
      <image
        ref={databaseSvgRef}
        height="75%"
        width="20%"
        y="12.5%"
        x="5%"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        xlinkHref={`data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath fill='%23${props.fillColor}' d='M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5'%3E%3C/path%3E%3Cpath d='M21 12c0 1.66-4 3-9 3s-9-1.34-9-3'%3E%3C/path%3E%3Cellipse fill='%23${props.fillColor}' cx='12' cy='5' rx='9' ry='3'%3E%3C/ellipse%3E%3C/svg%3E`}
      ></image>
      <image
        ref={boxSvgRef}
        height="75%"
        width="20%"
        y="12.5%"
        x="75%"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        xlinkHref={`data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23${props.fillColor}' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='16.5' y1='9.4' x2='7.5' y2='4.21'%3E%3C/line%3E%3Cpath d='M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z'%3E%3C/path%3E%3Cpolyline points='3.27 6.96 12 12.01 20.73 6.96'%3E%3C/polyline%3E%3Cline x1='12' y1='22.08' x2='12' y2='12'%3E%3C/line%3E%3C/svg%3E`}
      ></image>
    </svg>
  );
};

export default ExtractFromDatabaseSVG;
