import gsap from 'gsap';
import { useEffect, useRef } from 'react';

import type { IAppMenuSvg } from '@/utils/interfaces/AppMenuInterface';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const MenuSongsSVG = (props: IAppMenuSvg): JSX.Element => {
  const menuSongSvgTl = useRef<gsap.core.Timeline>(
    gsap.timeline({ paused: true })
  );
  const menuSongSvgRef = useRef<SVGSVGElement>(null);
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      menuSongSvgTl.current
        .to(
          menuSongSvgRef.current,
          {
            css: { strokeWidth: '*=2' },
            duration: 0.3,
          },
          0
        )
        .to('circle', { attr: { fill: 'white' }, duration: 0.3 }, 0);
    }, menuSongSvgRef);
    return () => ctx.revert();
  }, []);
  useEffect(() => {
    if (!props.isSelected && menuSongSvgTl.current.progress())
      menuSongSvgTl.current.reverse();
    if (props.isSelected && !menuSongSvgTl.current.progress())
      menuSongSvgTl.current.play();
  }, [props.isSelected]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      style={{ ...props.style, strokeWidth: '1.5' }}
      ref={menuSongSvgRef}
      aria-labelledby="title"
    >
      <title>Musics</title>
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3" fill="none"></circle>
      <circle cx="18" cy="16" r="3" fill="none"></circle>
    </svg>
  );
};

export default MenuSongsSVG;
