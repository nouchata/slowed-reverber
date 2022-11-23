import gsap from 'gsap';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

import useIsomorphicLayoutEffect from '@/utils/useIsomorphicLayoutEffect';

const About = () => {
  const debounceRef = useRef<any>();
  const preserveRatioProcessor = useRef<any>();
  const audioSource = useRef<any>();
  const values = useRef({ speed: 1.0, pitch: 1.0 });

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {});
    gsap.to('#test-svg', {
      css: {
        backgroundPositionX: '+=5',
      },
      duration: 1,
      repeat: -1,
      ease: 'none',
      repeatRefresh: true,
    });

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    gsap.set('#main-display-div', { className: 'bg-orange-500' });
  }, []);
  return (
    <>
      <div
        id="test-svg"
        style={{
          backgroundImage: 'url("/assets/images/sound-waves.svg")',
          backgroundSize: 'contain',
        }}
        className="w-full h-[200px] bg-orange-500"
      ></div>
      <svg
        className="border-black border-2"
        width="512px"
        viewBox="10 105 476 302"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="#000"
          d="M468.53 236.03H486v39.94h-17.47v-39.94zm-34.426 51.634h17.47v-63.328h-17.47v63.328zm-33.848 32.756h17.47V191.58h-17.47v128.84zm-32.177 25.276h17.47V167.483h-17.47v178.17zm-34.448-43.521h17.47v-92.35h-17.47v92.35zm-34.994 69.879h17.47v-236.06h-17.525v236.06zM264.2 405.9h17.47V106.1H264.2V405.9zm-33.848-46.284h17.47V152.383h-17.47v207.234zm-35.016-58.85h17.47v-87.35h-17.47v87.35zm-33.847-20.823h17.47V231.98h-17.47v48.042zm-33.848 25.66h17.47v-99.24h-17.47v99.272zm-33.302 48.04h17.47V152.678H94.34v201zm-33.847-30.702h17.47V187.333h-17.47v135.642zM26 287.664h17.47v-63.328H26v63.328z"
        />
      </svg>
      <Link href="/app">
        <button className="bg-white p-5 box-border">app</button>
      </Link>
      <input
        type="file"
        accept="audio"
        onChange={(e) => {
          if (!(e.target as HTMLInputElement).files?.length) return;
          (async () => {
            const audioContext = new AudioContext();
            await audioContext.audioWorklet.addModule(
              '/assets/js/phase-vocoder.min.js'
            );
            const arrayBuffer = await (
              e.target as HTMLInputElement
            ).files![0]!.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            // console.log(JSON.stringify(audioBuffer));
            preserveRatioProcessor.current = new AudioWorkletNode(
              audioContext,
              'phase-vocoder-processor'
            );
            preserveRatioProcessor.current.connect(audioContext.destination);
            audioSource.current = audioContext.createBufferSource();
            audioSource.current.playbackRate.value = 0.8;
            audioSource.current.buffer = audioBuffer;
            audioSource.current.connect(preserveRatioProcessor.current);
            audioSource.current.start();
            //   const offlineAudioContext = new OfflineAudioContext({
            //     numberOfChannels: 2,
            //     length: 44100 * (audioBuffer.duration / speed),
            //     sampleRate: 44100,
            //   });
            //   const source = offlineAudioContext.createBufferSource();
            //   source.buffer = audioBuffer;
            //   source.playbackRate.value = speed;
            //   // PROCESSING GO HERE
            //   source.connect(offlineAudioContext.destination);
            //   source.start();
            //   const renderedBuffer = await offlineAudioContext.startRendering();
            //   this.make_download(renderedBuffer, offlineAudioContext.length);
            //   (this.$refs.inputFile as HTMLInputElement).disabled = false;
          })();
        }}
      />
      <input
        type="number"
        placeholder="speed factor"
        onChange={(e) => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            audioSource.current.playbackRate.value =
              Number(e.target.value) || audioSource.current.playbackRate.value;
          }, 500);
        }}
      />
      <input
        type="number"
        placeholder="pitch factor"
        onChange={(e) => {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          debounceRef.current = setTimeout(() => {
            values.current.pitch =
              Number(e.target.value) || values.current.pitch;
            preserveRatioProcessor.current.parameters.get('pitchFactor').value =
              values.current.pitch * (1 / values.current.speed);
          }, 500);
        }}
      />
      <button
        className="bg-white p-5 box-border"
        onClick={() => {
          const audioContext = new AudioContext();
          audioContext.audioWorklet
            .addModule('/assets/js/PreserveRatioProcessor.js')
            .then(
              () => {
                const whiteNoiseNode = new AudioWorkletNode(
                  audioContext,
                  'preserve-ratio-processor'
                );
                whiteNoiseNode.port.postMessage({ pitch: 0.7 });
                whiteNoiseNode.connect(audioContext.destination);
              }
              // (reason) => console.log(reason)
            );
        }}
      >
        webaudioapi
      </button>
    </>
  );
};

export default About;
