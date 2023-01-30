import type { DBSchema } from 'idb';
import type { Dispatch, SetStateAction } from 'react';

import type { IAppData } from '../contexts/AppDataContext';

export type ISoundsManagerCallbacks = {
  setSoundsManagerStateCallback: Dispatch<SetStateAction<boolean>>;
  setCurrentSoundCallback: Dispatch<SetStateAction<ISoundsManagerCurrentSound>>;
  setSoundReadyCallback: Dispatch<SetStateAction<boolean>>;
  setPlayStateCallback: Dispatch<SetStateAction<boolean>>;
  setAppDataCallback: Dispatch<Partial<IAppData>>;
  setEncoderStateCallback: Dispatch<SetStateAction<EEncoderState>>;
};

export type ISoundsManagerConstructorArgs = Partial<
  {
    /* if upgrade db is needed (i.e. the schema has changed) */
    dbVersion: number;
    /* i may need to evaluate appData (for config) so i'm
     * passing it to the sm (may be removed) */
    appData: Partial<IAppData>;
  } & ISoundsManagerCallbacks
>;

export type ISoundsManagerCurrentSound = Partial<{
  soundInfoKey: number;
  soundInfoStore: 'sounds-info' | 'sounds-temp-info';
  soundBufferDuration: number;
  soundInfoData: Partial<ISoundsInfoStoreValue>;
  soundSourceData: Partial<ISoundsBlobStoreValue>;
  visualSourceData: Partial<ISoundsBlobStoreValue>;
}>;

export enum ESoundsManagerState {
  UNINITIALIZE,
  INITIALIZE,
  ENDED,
}

export enum EEncoderState {
  LOADING,
  LOADED,
  ERROR,
}

/* DB INTERFACES */

/* sounds-info store elements' content */
export type ISoundsInfoStoreValue = {
  creationDate: number;
  /* the blob hashes identifie the assets in the other stores since multiple edit instances can share it */
  blobAudioHash: string;
  blobVisualHash: string;
  name: string;
  author: string;
  speedValue: number;
  dontChangePitch: boolean;
  reverbEffectValue: number;
  /* stands for the muffled effect */
  lowKeyEffectValue: number;
};

/* sounds-info store design */
export type ISoundsInfoStoreAssets = {
  /* key is generated and used by indexedDB as an ID */
  key: number;
  indexes: {
    'by-date': Date;
    'by-audio-blob-key': string;
    'by-visual-blob-key': string;
  };
};

export type ISoundsInfoStore = ISoundsInfoStoreAssets & {
  value: ISoundsInfoStoreValue;
};

export type ISoundsTempInfoStore = ISoundsInfoStoreAssets & {
  value: Partial<ISoundsInfoStoreValue>;
};

/* blobs store elements' content */
export type ISoundsBlobStoreValue = {
  data: ArrayBuffer;
  type: string;
  /* the blob stores use hash to prevent copy of the same inputs */
  hash: string;
};

export type ISoundsBlobStore = {
  key: string;
  value: ISoundsBlobStoreValue;
};

export interface ISoundsManagerDB extends DBSchema {
  /* the sounds' informations */
  'sounds-info': ISoundsInfoStore;
  /* same as sounds-info but for still-in-setup songs */
  'sounds-temp-info': ISoundsTempInfoStore;
  /* inputed audio store */
  'sounds-source-blob': ISoundsBlobStore;
  /* visual-asset-used-to-make-video store */
  'sounds-visual-blob': ISoundsBlobStore;
}
