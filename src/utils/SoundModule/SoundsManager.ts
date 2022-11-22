import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';

import type {
  ISoundsManagerCallbacks,
  ISoundsManagerConstructorArgs,
  ISoundsManagerDB,
} from '../interfaces/SoundsManagerInterfaces';

export default class SoundsManager {
  private isFullyInit: boolean = false;

  private audioContextObject: any = undefined;

  private afterInitData: ISoundsManagerCallbacks;

  private songsDb: IDBPDatabase<ISoundsManagerDB> | undefined;

  private dbVersion: number | undefined;

  constructor(args: ISoundsManagerConstructorArgs) {
    this.afterInitData = {
      successCallback: args.successCallback || (() => {}),
      errorCallback: args.errorCallback || (() => {}),
      successCallbackArgs: args.successCallbackArgs || [],
      errorCallbackArgs: args.errorCallbackArgs || [],
    };

    this.dbVersion = args.dbVersion;

    ((osef) => osef)(this.isFullyInit && this.songsDb);

    try {
      this.asyncInit();
    } catch (e: any) {
      this.afterInitData.errorCallback!(
        e.message,
        ...this.afterInitData.errorCallbackArgs!
      );
    }
  }

  private async asyncInit() {
    if (!('indexedDB' in window))
      throw new Error("This browser doesn't support IndexedDB");

    this.audioContextObject =
      window.AudioContext ||
      (window as Window & any).webkitAudioContext ||
      (window as Window & any).mozAudioContext ||
      (window as Window & any).oAudioContext ||
      (window as Window & any).msAudioContext ||
      undefined;

    if (!this.audioContextObject)
      throw new Error("This browser doesn't support Web Audio API");

    /* upgrade the db if it doesn't exists */
    this.songsDb = await openDB<ISoundsManagerDB>(
      'sounds-manager-db',
      this.dbVersion || 1,
      {
        upgrade(db) {
          const soundsInfoStore = db.createObjectStore('sounds-info');
          soundsInfoStore.createIndex('by-date', 'creationDate');
          soundsInfoStore.createIndex('by-audio-blob-key', 'blobAudioHash');
          soundsInfoStore.createIndex('by-visual-blob-key', 'blobVisualHash');
          const soundsTempInfoStore = db.createObjectStore('sounds-temp-info');
          soundsTempInfoStore.createIndex('by-date', 'creationDate');
          soundsTempInfoStore.createIndex('by-audio-blob-key', 'blobAudioHash');
          soundsTempInfoStore.createIndex(
            'by-visual-blob-key',
            'blobVisualHash'
          );

          /* key index based on the hash code of the data */
          db.createObjectStore('sounds-source-blob', { keyPath: 'hash' });
          db.createObjectStore('sounds-visual-blob', { keyPath: 'hash' });
        },
      }
    );

    this.isFullyInit = true;
    this.afterInitData.successCallback!(
      ...this.afterInitData.successCallbackArgs!
    );
  }
}
