import type { Particle } from '../Particle';

export type IParticlesContainerProps = {
  particleSize?: number;
  particleColor?: string;
  particleHighlightColor?: string;
  particleSpeedFactor?: number;
  particleGlow?: boolean;
  /* used to expose the onMouseMove & onMouseLeave event elsewhere (needs to be the .current of a ref) */
  externalMousePosCoords?: IParticlesContainerMousePosCoords;
};

export type IParticlesContainerMousePosCoords = {
  x?: number;
  y?: number;
  radius: number;
};

export type IParticlesContainerUnitsManager = {
  particlesArray: Array<Particle>;
  numberOfParticles: number;
};
