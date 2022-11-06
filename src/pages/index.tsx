import { useRouter } from 'next/router';
import { useRef } from 'react';

import { Meta } from '@/layouts/Meta';
import IndexFrontData from '@/templates/IndexFrontData';
import ParticlesContainer from '@/templates/ParticlesContainer';
import type { IParticlesContainerMousePosCoords } from '@/utils/interfaces/ParticleManagerInterfaces';

const Index = () => {
  const router = useRouter();
  const mouseDataRef = useRef<IParticlesContainerMousePosCoords>({
    /* since the particle container is an underlayer, the mouse logic event will be done here in the parent div */
    x: undefined,
    y: undefined,
    radius: 0,
  });

  return (
    <div className="w-full">
      <Meta
        title={'Slowed Reverber'}
        description={'Slowed & Reverber Software' || router.asPath}
      ></Meta>
      <div
        className="bg-slate-900 box-border relative"
        style={{ width: '100%', height: '100vh' }}
        onMouseMove={(e) => {
          /* value updating is made this way instead of '= { x: ... }' to keep the reference of the object */
          mouseDataRef.current.x = e.clientX;
          mouseDataRef.current.y = e.clientY;
        }}
        onMouseLeave={() => {
          mouseDataRef.current.x = undefined;
          mouseDataRef.current.y = undefined;
        }}
      >
        <ParticlesContainer
          particleSpeedFactor={1}
          particleSize={1.7}
          particleGlow={false}
          externalMousePosCoords={mouseDataRef.current}
          className={'antialiased'}
          style={{ filter: 'blur(1px)' }}
        />
        <IndexFrontData className="absolute top-0 left-0 w-full h-full flex justify-center items-center" />
      </div>
    </div>
  );
};

export default Index;
