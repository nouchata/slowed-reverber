import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';

import type {
  ISoundsManagerConstructorArgs,
  ISoundsManagerDB,
} from '../interfaces/SoundsManagerInterfaces';

export default class SoundsManager {
  private isFullyInit: boolean = false;

  private afterInitData: { callback: Function; args: Array<any> };

  private songsDb: IDBPDatabase<ISoundsManagerDB> | undefined;

  constructor(args: ISoundsManagerConstructorArgs) {
    this.afterInitData = {
      callback: args.afterInitCallback || (() => {}),
      args: args.afterInitArgs || [],
    };

    ((osef) => osef)(this.isFullyInit && this.songsDb);

    this.asyncInit();
  }

  private async asyncInit() {
    /* upgrade the db if it doesn't exists */
    this.songsDb = await openDB<ISoundsManagerDB>('sounds-manager-db', 1, {
      upgrade(db) {
        const soundsInfoStore = db.createObjectStore('sounds-info');
        soundsInfoStore.createIndex('by-date', 'creationDate');
        soundsInfoStore.createIndex('by-audio-blob-key', 'blobAudioHash');
        soundsInfoStore.createIndex('by-visual-blob-key', 'blobVisualHash');
        /* useless to register the blob indexes for the temporary sounds store since it won't be used */
        const soundsTempInfoStore = db.createObjectStore('sounds-temp-info');
        soundsTempInfoStore.createIndex('by-date', 'creationDate');

        /* key index based on the hash code of the data */
        db.createObjectStore('sounds-source-blob', { keyPath: 'hash' });
        db.createObjectStore('sounds-visual-blob', { keyPath: 'hash' });
      },
    });

    this.isFullyInit = true;
    this.afterInitData.callback(...this.afterInitData.args);
  }
}
