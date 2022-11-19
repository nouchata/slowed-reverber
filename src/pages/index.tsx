import gsap from 'gsap';
import { Observer } from 'gsap/dist/Observer';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useRef } from 'react';

import { Meta } from '@/layouts/Meta';
import IndexArrowSVG from '@/svgs/IndexArrow';
import IndexLogoSVG from '@/svgs/IndexLogo';
import ParticlesContainer from '@/templates/ParticlesContainer';
import { TransitionContext } from '@/utils/contexts/TransitionContext';
import type { IParticlesContainerMousePosCoords } from '@/utils/interfaces/ParticleManagerInterfaces';
import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const Index = () => {
  const router = useRouter();
  const mouseDataRef = useRef<IParticlesContainerMousePosCoords>({
    /* since the particle container is an underlayer, the mouse logic event will be done here in the parent div */
    x: undefined,
    y: undefined,
    radius: 0,
  });
  const indexDivRef = useRef<HTMLDivElement>(null);
  const outroTimeline = useContext(TransitionContext).timeline;

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      outroTimeline?.to(
        indexDivRef.current,
        { opacity: 0, y: '-=100%', duration: 0.2 },
        '+=0'
      );
    }, indexDivRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.set('#main-display-div', { className: 'bg-slate-900' });
    gsap.registerPlugin(Observer);
    const scrollObserver = Observer.create({
      // target: indexDivRef.current,
      type: 'wheel,touch,pointer',
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: true,
      onUp() {
        router.push('/about');
      },
    });

    return () => scrollObserver.kill();
  }, []);

  return (
    <>
      <Meta
        title={'Slowed Reverber'}
        description={'Slowed & Reverber Software' || router.asPath}
      ></Meta>
      <div
        className="box-border relative w-full h-full overflow-hidden bg-slate-900"
        onMouseMove={(e) => {
          /* value updating is made this way instead of '= { x: ... }' to keep the reference of the object */
          mouseDataRef.current.x = e.clientX;
          mouseDataRef.current.y = e.clientY;
        }}
        onMouseLeave={() => {
          mouseDataRef.current.x = undefined;
          mouseDataRef.current.y = undefined;
        }}
        ref={indexDivRef}
      >
        <ParticlesContainer
          particleSpeedFactor={1}
          particleSize={1.7}
          particleGlow={false}
          externalMousePosCoords={mouseDataRef.current}
          className={'antialiased'}
          particleColor={'#FFFFFF'}
          style={{ filter: 'blur(1px)' }}
        />
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center">
          <IndexLogoSVG className="w-4/5 md:w-full h-[50vh] box-border p-10" />
          <Link href={'/about'}>
            <button className="absolute w-full bottom-0 h-[20vh] box-border flex justify-center items-end pb-5 bg-transparent border-none">
              <IndexArrowSVG direction="down" />
            </button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default Index;
