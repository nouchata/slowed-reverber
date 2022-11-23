import type { DBSchema } from 'idb';

export type ISoundsManagerCallbacks = {
  successCallback?: Function;
  successCallbackArgs?: Array<any>;
  errorCallback?: Function;
  errorCallbackArgs?: Array<any>;
};

export type ISoundsManagerConstructorArgs = {
  /* if upgrade db is needed (i.e. the schema has changed) */
  dbVersion?: number;
} & ISoundsManagerCallbacks;

export enum ESoundsManagerState {
  UNINITIALIZE,
  INITIALIZE,
  ENDED,
}

/* DB INTERFACES */

/* sounds-info store elements' content */
export type ISoundsInfoStoreValue = {
  creationDate: Date;
  /* the blob hashes identifie the assets in the other stores since multiple edit instances can share it */
  blobAudioHash: string;
  blobVisualHash: string;
  name: string;
  author: string;
  speedValue: number;
  pitchValue: number;
  reverbEffectValue: number;
  /* stands for the muffled effect */
  lowKeyEffectValue: number;
};

/* sounds-info store design */
export type ISoundsInfoStoreAssets = {
  /* key is generated and used by indexedDB as an ID */
  key: string;
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
  data: Blob | ArrayBuffer;
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
