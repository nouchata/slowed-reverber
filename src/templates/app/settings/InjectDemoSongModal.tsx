import { useContext, useEffect, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';

const InjectDemoSongModal = () => {
  const { appData, setAppData } = useContext(AppDataContext);
  const { soundsManager } = useContext(SoundsManagerContext);
  const { router } = appData!;
  const [injectState, setInjectState] = useState<'downloading' | 'injecting'>(
    'downloading'
  );
  useEffect(() => {
    /* should have done that in an async fn ikr 🥴 */
    fetch(`${router.basePath}/assets/demo-song/blue-dream.mp3`)
      .then((response) => {
        setInjectState('injecting');
        response
          .blob()
          .then((blob) => {
            blob
              .arrayBuffer()
              .then((arrayBuffer) => {
                soundsManager
                  ?.addFile(arrayBuffer, 'Cheel - Blue Dream', blob.type)
                  .then(() => {
                    setAppData!({
                      customModal: null,
                      mediumModalText: 'The demo song has been injected',
                    });
                  })
                  .catch((reason) => {
                    setAppData!({
                      customModal: null,
                      error: { type: 'normal', value: reason.message },
                    });
                  });
              })
              .catch((reason) => {
                setAppData!({
                  customModal: null,
                  error: { type: 'normal', value: reason.message },
                });
              });
          })
          .catch((reason) => {
            setAppData!({
              customModal: null,
              error: { type: 'normal', value: reason.message },
            });
          });
      })
      .catch((reason) => {
        setAppData!({
          customModal: null,
          error: { type: 'normal', value: reason.message },
        });
      });
  }, []);
  return (
    <div className="box-border bg-slate-800 p-5 max-w-lg w-5/6 flex flex-col gap-5 rounded shadow text-white">
      <img
        className="h-8 animate-spin"
        alt="Loading..."
        src={`data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='2' x2='12' y2='6'%3E%3C/line%3E%3Cline x1='12' y1='18' x2='12' y2='22'%3E%3C/line%3E%3Cline x1='4.93' y1='4.93' x2='7.76' y2='7.76'%3E%3C/line%3E%3Cline x1='16.24' y1='16.24' x2='19.07' y2='19.07'%3E%3C/line%3E%3Cline x1='2' y1='12' x2='6' y2='12'%3E%3C/line%3E%3Cline x1='18' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cline x1='4.93' y1='19.07' x2='7.76' y2='16.24'%3E%3C/line%3E%3Cline x1='16.24' y1='7.76' x2='19.07' y2='4.93'%3E%3C/line%3E%3C/svg%3E`}
      />
      <p className="text-center italic">
        {injectState === 'downloading'
          ? 'Reaching out the demo song...'
          : 'Injecting the demo song...'}
      </p>
    </div>
  );
};

export default InjectDemoSongModal;
