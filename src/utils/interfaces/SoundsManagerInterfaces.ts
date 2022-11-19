import type { DBSchema } from 'idb';

export type ISoundsManagerConstructorArgs = {
  afterInitCallback?: Function;
  afterInitArgs?: Array<any>;
  /* if upgrade db is needed (i.e. the schema has changed) */
  dbVersion?: number;
};

/* sounds-info store elements' content */
export type ISoundsInfoStoreValue = {
  creationDate: Date;
  /* the blob hashes identifie the assets in the other stores since multiple edit instances can share it */
  blobAudioHash: string | undefined;
  blobVisualHash: string | undefined;
  name: string | undefined;
  speedValue: number | undefined;
  pitchValue: number | undefined;
  reverbEffectValue: number | undefined;
  /* stands for the muffled effect */
  lowKeyEffectValue: number | undefined;
};

/* sounds-info store design */
export type ISoundsInfoStore = {
  /* key is generated and used by indexedDB as an ID */
  key: string;
  value: ISoundsInfoStoreValue;
  indexes: {
    'by-date': Date;
    'by-audio-blob-key': string;
    'by-visual-blob-key': string;
  };
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
  'sounds-temp-info': ISoundsInfoStore;
  /* inputed audio store */
  'sounds-source-blob': ISoundsBlobStore;
  /* visual-asset-used-to-make-video store */
  'sounds-visual-blob': ISoundsBlobStore;
}
