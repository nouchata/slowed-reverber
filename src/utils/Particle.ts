import type { IParticlesContainerMousePosCoords } from './interfaces/ParticleManagerInterfaces';

/* https://www.youtube.com/watch?v=d620nV6bp0A
 * this resource was used to made the particle canvas system 🙌
 */
export class Particle {
  /* needs to access the context to draw so it's referenced inside */
  ctx: CanvasRenderingContext2D;

  /* reference to the value of mousePosRef setup in the ref located in ParticlesContainer */
  mouseData: IParticlesContainerMousePosCoords;

  /* x and y positions */
  x: number;

  y: number;

  /* direction vector x and y */
  directionX: number;

  directionY: number;

  /* particles are circled so it's the radius */
  size = 1;

  highlight: boolean = false;

  /* used for the draw call */
  color = '#FFFFFF';

  /* size and color are optionals */
  constructor(
    ctx: CanvasRenderingContext2D,
    mouseData: IParticlesContainerMousePosCoords,
    x: number,
    y: number,
    directionX: number,
    directionY: number,
    size?: number,
    color?: string
  ) {
    this.ctx = ctx;
    this.mouseData = mouseData;
    [this.x, this.y] = [x, y];
    [this.directionX, this.directionY] = [directionX, directionY];
    this.size = size || this.size;
    this.color = color || this.color;
  }

  /* after some optimisation tests, draw wont call fill so it just put the particle for it to be drawn later */
  private draw(): void {
    this.ctx.moveTo(this.x, this.y);
    this.ctx.arc(
      this.x,
      this.y,
      this.highlight ? this.size * 1.5 : this.size,
      0,
      Math.PI * 2,
      false
    );
  }

  public update(): void {
    /* collision check, the ctx refers his parent canvas ; check if collides on border and then invert it for x and y */
    if (this.x > this.ctx.canvas.width || this.x < 0) this.directionX *= -1;
    if (this.y > this.ctx.canvas.height || this.y < 0) this.directionY *= -1;
    const [dx, dy] = [
      this.mouseData.x ? this.mouseData.x - this.x : undefined,
      this.mouseData.y ? this.mouseData.y - this.y : undefined,
    ];
    this.highlight = false;
    /* since the mouseData is set to undefined if the mouse isn't inside the container, we're checking that here by evaluating dx & dy */
    /* + we have the formula to check if there's a collision (https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection#circle_collision) */
    if (
      dx &&
      dy &&
      Math.sqrt(dx * dx + dy * dy) < this.size + this.mouseData.radius
    ) {
      /* here we have a collision so we're switching to highlight mode */
      this.highlight = true;
    }
    /* updating the particle position */
    this.x += this.directionX;
    this.y += this.directionY;

    this.draw();
  }
}
