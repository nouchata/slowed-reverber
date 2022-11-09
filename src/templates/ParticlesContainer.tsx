import gsap from 'gsap';
import { useEffect, useRef } from 'react';

import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import type {
  IParticlesContainerMousePosCoords,
  IParticlesContainerProps,
  IParticlesContainerUnitsManager,
} from '@/utils/interfaces/ParticleManagerInterfaces';
import { Particle } from '@/utils/Particle';
import useWindowSize from '@/utils/useWindowSize';

const ParticlesContainer = (
  props: IParticlesContainerProps & IBasicPropsInterface
): JSX.Element => {
  /* used to redefining canvas size according to the window size resizing */
  const windowSize = useWindowSize();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseDataRef = useRef<IParticlesContainerMousePosCoords>({
    /* mouse part */
    x: undefined,
    y: undefined,
    radius: 0,
  });
  const containerDataRef = useRef<IParticlesContainerUnitsManager>({
    /* units manager part */
    particlesArray: [],
    numberOfParticles: 0,
    color: '',
  });

  /* using windowSize as a watcher to run and update the canvas size */
  useEffect(() => {
    /* makes it in a way that there's only one execution of the loop at a time */
    let runtime: boolean = true;
    if (
      windowSize.width &&
      canvasRef.current &&
      canvasRef.current.parentElement
    ) {
      /* check if the mouseDataRef needs to be impersonated or not */
      if (props.externalMousePosCoords)
        mouseDataRef.current = props.externalMousePosCoords;
      /* linking the parent element dimensions & particles number with the canvas' ones ; array reset */
      [canvasRef.current.width, canvasRef.current.height] = [
        canvasRef.current.parentElement.getBoundingClientRect().width,
        canvasRef.current.parentElement.getBoundingClientRect().height,
      ];
      containerDataRef.current.numberOfParticles =
        (canvasRef.current.height * canvasRef.current.width) / 3000; // 9000
      containerDataRef.current.particlesArray = [];
      /* the definition of the mouse radius for collision */
      mouseDataRef.current.radius =
        (canvasRef.current.height / 80) * (canvasRef.current.width / 80);
      /* particles runtime */
      (async () => {
        if (canvasRef.current) {
          /* check for size and particleSpeed to be defined + extract context to limit calls */
          const size = props.particleSize || 1;
          const particleSpeed = props.particleSpeedFactor || 1;
          const ctx = canvasRef.current.getContext(
            '2d'
          ) as CanvasRenderingContext2D;
          /* glowing effect on the canvas if allowed */
          /* WARNING CPU PERFORMANCE ISSUES WITH IT / prefer css blur (basically the same effect but cheaper in both senses) */
          if (props.particleGlow !== false) {
            ctx.shadowColor = containerDataRef.current.color || '#FFFFFF';
            ctx.shadowBlur = 10;
          }
          /* loop to fill the array */
          for (
            let i = 0;
            i < containerDataRef.current.numberOfParticles;
            i += 1
          ) {
            /* defining x, y, dX, dY based on variables */
            const [x, y] = [
              Math.random() * (canvasRef.current.width - size * 2 - size * 2) +
                size * 2,
              Math.random() * (canvasRef.current.height - size * 2 - size * 2) +
                size * 2,
            ];
            const [directionX, directionY] = [
              Math.random() * particleSpeed - particleSpeed / 2,
              Math.random() * particleSpeed - particleSpeed / 2,
            ];
            containerDataRef.current.particlesArray.push(
              new Particle(
                ctx,
                mouseDataRef.current,
                x,
                y,
                directionX,
                directionY,
                size
              )
            );
          }
          /* animation loop */
          const animate = async () => {
            if (runtime && canvasRef.current) {
              /* clear the canvas */
              ctx.clearRect(
                0,
                0,
                canvasRef.current.width,
                canvasRef.current.height
              );
              /* some optimisations to limit fill calls */
              ctx.beginPath();
              ctx.fillStyle = containerDataRef.current.color || '#FFFFFF';
              // eslint-disable-next-line no-restricted-syntax
              for (const particle of containerDataRef.current.particlesArray)
                particle.update();
              ctx.fill();
              ctx.closePath();
              /* requestAnimationFrame cpu usage is crazy, setInterval messes w/ gsap so here's the fix */
              await new Promise((resolve) => {
                setTimeout(() => {
                  resolve(1);
                }, 1000 / 25);
              });
              animate();
            }
          };
          animate();
          /* reveals the canvas */
          gsap.to(canvasRef.current, { opacity: 1, duration: 0.5 });
        }
      })();
    }

    /* cleanup by turning down the runtime var */
    return () => {
      runtime = false;
    };
    /* speedFactor and particleSize could be updated as for particleColor by adding them in containerDataRef
     * and giving the object to the Particle object when created to instant update them when React revamp but i'm lazy */
  }, [windowSize, props.particleSpeedFactor, props.particleSize]);

  useEffect(() => {
    containerDataRef.current.color = props.particleColor || '';
  }, [props.particleColor]);

  return (
    <canvas
      style={props.style}
      className={`${props.className} w-full h-full opacity-0`}
      ref={canvasRef}
      onMouseMove={
        /* if this exists it will be done elsewhere */
        props.externalMousePosCoords
          ? (e) => {
              /* value updating is made this way instead of '= { x: ... }' to keep the reference of the object for the Particle object reference */
              mouseDataRef.current.x = e.clientX;
              mouseDataRef.current.y = e.clientY;
            }
          : () => {}
      }
      onMouseLeave={
        props.externalMousePosCoords
          ? () => {
              mouseDataRef.current.x = undefined;
              mouseDataRef.current.y = undefined;
            }
          : () => {}
      }
    >
      {props.children}
    </canvas>
  );
};

export default ParticlesContainer;
