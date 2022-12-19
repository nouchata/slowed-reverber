import { useContext, useEffect, useRef, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useWindowSize from '@/utils/useWindowSize';

/* static image generator */
// function createStaticImage(
//   canvas: HTMLCanvasElement,
//   ctx: CanvasRenderingContext2D,
//   pixelSize: number,
//   height: number,
//   width: number
// ) {
//   /* the images are random colored squares sized
//    * using pixelSize */
//   for (let v = 0; v < height; v += pixelSize) {
//     for (let h = 0; h < width; h += pixelSize) {
//       const lum = Math.floor(Math.random() * 4);
//       ctx.fillStyle = `hsl(222, 47.4%,${lum * 11.2}%)`;
//       ctx.fillRect(h, v, pixelSize, pixelSize);
//     }
//   }
//   /* export the image */
//   return canvas.toDataURL();
//   /* heavier than toDataURL but you can export only a portion with it */
//   // return ctx.getImageData(0, 0, width, height);
// }

const StaticContainer = (props: IBasicPropsInterface) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const windowSize = useWindowSize();
  const { appData } = useContext(AppDataContext);
  const [images, setImages] = useState<Array<HTMLImageElement>>([]);

  /* image preloading */
  useEffect(() => {
    (async () => {
      /* using preload images prevents cpu heavy computation that happens
       * while generating the images */
      const staticContainerPreloadImages = (
        await import('../utils/staticContainerPreloadImages')
      ).default;
      setImages(
        staticContainerPreloadImages.map<HTMLImageElement>((value) => {
          const image = new Image();
          image.src = value;
          return image;
        })
      );
    })();
  }, []);

  useEffect(() => {
    /* a more accurate way to do than Math.random would be to generate
     * noise with the web audio api but i'm too lazy */
    let runtime = true;
    const ctx = canvasRef.current?.getContext('2d');
    const imageWidth = images[0]?.width;
    const imageHeight = images[0]?.height;
    let i = 0;

    const animate = async () => {
      if (runtime && ctx && windowSize.width && windowSize.height) {
        /* reset to first image */
        if (i === images.length) i = 0;
        /* drawing the image to fill every pixel of the screen */
        for (let x = 0; x < windowSize.width; x += imageWidth!) {
          for (let y = 0; y < windowSize.height; y += imageHeight!) {
            ctx.drawImage(images[i]!, x, y);
            // ctx.putImageData(images[i]!, x, y);
          }
        }
        /* next image */
        i += 1;

        /* requestAnimationFrame cpu usage is crazy, setInterval messes w/ gsap so here's the fix */
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(1);
          }, 1000 / 10);
        });
        // requestAnimationFrame(animate);
        animate();
      }
    };
    if (images.length) animate();
    return () => {
      runtime = false;
    };
  }, [windowSize, images]);

  /* drag and drop dimmer */
  useEffect(() => {
    if (canvasRef.current) {
      if (!images.length) canvasRef.current.style.opacity = '0';
      else if (appData!.fileDragAndDrop)
        canvasRef.current.style.opacity = '0.5';
      else canvasRef.current.style.opacity = '1';
    }
  }, [appData!.fileDragAndDrop, images]);
  return (
    <canvas
      style={props.style}
      className={`opacity-0 transition-opacity ${props.className}`}
      ref={canvasRef}
      width={windowSize.width}
      height={windowSize.height}
    >
      {props.children}
    </canvas>
  );
};

export default StaticContainer;
