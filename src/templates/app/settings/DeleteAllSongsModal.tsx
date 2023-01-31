import { deleteDB } from 'idb';
import { useContext, useEffect, useState } from 'react';

import { AppDataContext } from '@/utils/contexts/AppDataContext';
import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';

const DeleteAllSongsModal = () => {
  const { appData, setAppData } = useContext(AppDataContext);
  const { soundsManager } = useContext(SoundsManagerContext);
  const { router } = appData!;
  const [runDelete, setRunDelete] = useState(false);
  useEffect(() => {
    if (runDelete) {
      deleteDB('sounds-manager-db', {
        blocked() {
          soundsManager?.closeDatabase();
        },
      })
        .then(() => {
          /* back to the index if the db is deleted */
          setAppData!({
            customModal: null,
          });
          router.push('/');
        })
        .catch((reason) => {
          setAppData!({
            customModal: null,
            error: { type: 'normal', value: reason.message },
          });
        });
    }
  }, [runDelete, soundsManager]);
  if (runDelete)
    return (
      <div className="bg-slate-800 rounded shadow p-3">
        <img
          className="h-8 animate-spin"
          alt="Loading..."
          src={`data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='2' x2='12' y2='6'%3E%3C/line%3E%3Cline x1='12' y1='18' x2='12' y2='22'%3E%3C/line%3E%3Cline x1='4.93' y1='4.93' x2='7.76' y2='7.76'%3E%3C/line%3E%3Cline x1='16.24' y1='16.24' x2='19.07' y2='19.07'%3E%3C/line%3E%3Cline x1='2' y1='12' x2='6' y2='12'%3E%3C/line%3E%3Cline x1='18' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cline x1='4.93' y1='19.07' x2='7.76' y2='16.24'%3E%3C/line%3E%3Cline x1='16.24' y1='7.76' x2='19.07' y2='4.93'%3E%3C/line%3E%3C/svg%3E`}
        />
      </div>
    );
  return (
    <div className="bg-slate-800 max-w-lg w-5/6 rounded shadow text-white">
      <h6 className="py-4 px-2 text-center text-sm italic w-full">
        All of the songs, drafts and assets will be deleted, are you sure you
        want to continue?
      </h6>
      <div className="h-10">
        <button
          className="h-full w-1/2 text-red-900 font-bold"
          onClick={() => {
            setRunDelete(true);
          }}
        >
          Delete
        </button>
        <button
          className="h-full w-1/2 font-bold"
          onClick={() => {
            setAppData!({ customModal: null });
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default DeleteAllSongsModal;
