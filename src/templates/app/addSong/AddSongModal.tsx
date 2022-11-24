import { useRouter } from 'next/router';
import { useEffect } from 'react';

import Player from '../player/Player';

const AddSongModal = () => {
  const router = useRouter();
  useEffect(() => {}, [router.query]);
  return (
    <div
      id="add-song-modal-container"
      className="relative w-full h-full box-border border-2 rounded-t-lg"
    >
      <div id="add-song-modal-container-content">
        <div id="add-song-modal-container-content-header" className=""></div>
      </div>
      <Player
        style={{
          /* used to show the player by disable the transform property */
          transform:
            router.query.step && router.query.step !== '1' ? 'none' : undefined,
        }}
        className="absolute bottom-5 w-[90%] left-[5%] h-12 bg-[#2C2F35] drop-shadow-lg translate-y-32 transition-transform z-10"
      />
    </div>
  );
};

export default AddSongModal;
