import { useContext, useEffect, useRef } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import type { IBasicPropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useWindowSize from '@/utils/useWindowSize';

const StaticContainer = (props: IBasicPropsInterface) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const windowSize = useWindowSize();
  const { appData } = useContext(AppDataContext);
  useEffect(() => {
    /* a more accurate way to do than Math.random would be to generate
     * noise with the web audio api but i'm too lazy */
    let runtime = true;
    const ctx = canvasRef.current?.getContext('2d');
    const pixelSize = 15;
    /* to lighten the charge on the cpu, 5 images will be generated
     * and stocked in this array then be continuously loaded instead
     * of generating new ones w/ fillRect who's cpu-heavy */
    const imageStock: Array<HTMLImageElement> = [];
    // const imageStock: Array<ImageData> = [];
    let imageStockIndex = 0;

    const animate = async () => {
      if (
        runtime &&
        canvasRef.current &&
        ctx &&
        windowSize.width &&
        windowSize.height
      ) {
        if (imageStock.length < 5) {
          /* the images are b&w random colored squares sized
           * using pixelSize */
          for (let v = 0; v < windowSize.height; v += pixelSize) {
            for (let h = 0; h < windowSize.width; h += pixelSize) {
              const lum = Math.floor(Math.random() * 4);
              ctx.fillStyle = `hsl(222, 47.4%,${lum * 11.2}%)`;
              ctx.fillRect(h, v, pixelSize, pixelSize);
            }
          }
          /* we save the image for later usage in the array */
          imageStock.push(new Image());
          imageStock[imageStock.length - 1]!.src =
            canvasRef.current.toDataURL();
          // imageStock.push(
          //   ctx.getImageData(0, 0, windowSize.width, windowSize.height)
          // );
          if (imageStock.length === 1) canvasRef.current!.style.opacity = '1';
        } else {
          /* when we have enough images saved to have the illusion of static,
           * we just flip them on the canvas */
          ctx.drawImage(imageStock[imageStockIndex]!, 0, 0);
          imageStockIndex += 1;
          if (imageStockIndex > 4) imageStockIndex = 0;
          // ctx.putImageData(imageStock[imageStockIndex]!, 0, 0);
        }
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
    animate();
    return () => {
      runtime = false;
    };
  }, [windowSize]);

  /* drag and drop dimmer */
  useEffect(() => {
    canvasRef.current!.style.opacity = appData!.fileDragAndDrop ? '0.5' : '1';
  }, [appData!.fileDragAndDrop]);
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
