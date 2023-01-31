import gsap from 'gsap';
import { useEffect, useRef } from 'react';

import type { IAppMenuSvg } from '@/utils/interfaces/AppMenuInterface';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const MenuSettingsSVG = (props: IAppMenuSvg) => {
  const menuSettingsTlRef = useRef<gsap.core.Timeline>(
    gsap.timeline({ paused: true })
  );
  const menuSettingsRef = useRef<SVGSVGElement>(null);
  const menuSettingsPathRef = useRef<SVGPathElement>(null);
  const menuSettingsCircleRef = useRef<SVGCircleElement>(null);
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      menuSettingsTlRef.current
        .to(
          menuSettingsRef.current,
          { duration: 0.5, ease: 'power4.out', rotation: 180 },
          0
        )
        .to(
          menuSettingsPathRef.current,
          { duration: 0.5, fill: 'white', ease: 'none.none' },
          0
        )
        .to(
          menuSettingsCircleRef.current,
          { duration: 0.5, stroke: 'black', ease: 'none.none' },
          0
        );
    });
    return () => ctx.revert();
  }, []);
  useEffect(() => {
    if (menuSettingsRef.current && props.isSelected)
      menuSettingsTlRef.current.play();
    if (menuSettingsRef.current && !props.isSelected)
      menuSettingsTlRef.current.reverse();
  }, [props.isSelected, menuSettingsRef.current]);
  return (
    <svg
      ref={menuSettingsRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-labelledby="title"
      className={props.className}
    >
      <title>Settings</title>
      <path
        ref={menuSettingsPathRef}
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
      ></path>
      <circle ref={menuSettingsCircleRef} cx="12" cy="12" r="3"></circle>
    </svg>
  );
};

export default MenuSettingsSVG;
