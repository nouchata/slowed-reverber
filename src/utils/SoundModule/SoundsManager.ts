import Reverb from '@logue/reverb';
import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import SparkMD5 from 'spark-md5';

import type {
  ISoundsBlobStoreValue,
  ISoundsInfoStoreValue,
  ISoundsManagerCallbacks,
  ISoundsManagerConstructorArgs,
  ISoundsManagerDB,
} from '../interfaces/SoundsManagerInterfaces';

export default class SoundsManager {
  /* state related */
  private isFullyInit = false;

  /* since some of the logic is made asynchronously, this state will
   * be verified at the end of asyncInit to check if the newly opened
   * assets needs to be flushed */
  private needsToBeDestructed = false;

  public currentSound: Partial<{
    soundInfoKey?: string;
    soundInfoData: Partial<ISoundsInfoStoreValue>;
    soundSourceData: Partial<ISoundsBlobStoreValue>;
    visualSourceData: Partial<ISoundsBlobStoreValue>;
  }> = {};

  /* audiocontext related */
  public audioContext: AudioContext | undefined = undefined;

  private audioSourceInput: AudioBufferSourceNode | undefined = undefined;

  private audioBufferInput: AudioBuffer | undefined = undefined;

  private phaseVocoderProcessor: AudioWorkletNode | undefined = undefined;

  private reverbProcessor: Reverb | undefined = undefined;

  private muffledProcessor: BiquadFilterNode | undefined = undefined;

  /* callbacks */
  private afterInitData: ISoundsManagerCallbacks;

  /* db related */
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

    /* catch any critical error in the error callback */
    this.asyncInit().catch((reason) =>
      this.afterInitData.errorCallback!(
        reason.message,
        ...this.afterInitData.errorCallbackArgs!
      )
    );
  }

  private async asyncInit() {
    /* AVAILABILITY CHECKS */
    if (!('indexedDB' in window))
      throw new Error(
        "Your browser doesn't seem to handle the database software, try to update it"
      );

    const AudioContextObject =
      window.AudioContext ||
      (window as Window & any).webkitAudioContext ||
      (window as Window & any).mozAudioContext ||
      (window as Window & any).oAudioContext ||
      (window as Window & any).msAudioContext ||
      undefined;

    if (!AudioContextObject)
      throw new Error(
        "Your browser doesn't seem to handle the audio processing software, try to update it"
      );

    /* DB CREATION / UPGRADE */
    try {
      this.songsDb = await openDB<ISoundsManagerDB>(
        'sounds-manager-db',
        this.dbVersion || 1,
        {
          upgrade(db) {
            const soundsInfoStore = db.createObjectStore('sounds-info');
            soundsInfoStore.createIndex('by-date', 'creationDate');
            soundsInfoStore.createIndex('by-audio-blob-key', 'blobAudioHash');
            soundsInfoStore.createIndex('by-visual-blob-key', 'blobVisualHash');
            const soundsTempInfoStore =
              db.createObjectStore('sounds-temp-info');
            soundsTempInfoStore.createIndex('by-date', 'creationDate');
            soundsTempInfoStore.createIndex(
              'by-audio-blob-key',
              'blobAudioHash'
            );
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
    } catch {
      throw new Error(
        `An error occured while setting up the sounds database, it may be because you're in private navigation or because your browser is too old`
      );
    }

    /* AUDIO CONTEXT SETUP */
    this.audioContext = new AudioContextObject();
    this.audioContext.suspend();
    /* Safari iOS audioContext waker */
    const initAudioContext = function initAudioContext(this: SoundsManager) {
      document.removeEventListener('touchstart', initAudioContext);
      // wake up AudioContext
      if (this.audioContext && this.audioContext.state !== 'closed') {
        const emptySource = this.audioContext.createBufferSource();
        emptySource.start();
        emptySource.stop();
      }
    }.bind(this);
    document.addEventListener('touchstart', initAudioContext);

    /* processors init */
    try {
      await this.audioContext.audioWorklet.addModule(
        '/assets/js/phase-vocoder.min.js'
      );

      this.phaseVocoderProcessor = new AudioWorkletNode(
        this.audioContext,
        'phase-vocoder-processor'
      );
      this.reverbProcessor = new Reverb(this.audioContext);
      this.muffledProcessor = this.audioContext.createBiquadFilter();
      this.muffledProcessor.type = 'lowpass';
      this.muffledProcessor.frequency.setTargetAtTime(
        22050, // basically disable it
        this.audioContext.currentTime,
        0
      );
    } catch {
      throw new Error(
        `An error occured while setting up the audio processors, it may be because you're not on a secure connection (HTTPS) or because your browser is too old`
      );
    }

    /* init done ! */
    this.isFullyInit = true;
    this.afterInitData.successCallback!(
      ...this.afterInitData.successCallbackArgs!
    );
    /* since this init func is asynchronous, we check the flag to see if
     * something asked the manager to be ended while it was executed */
    if (this.needsToBeDestructed) this.freeData();
  }

  /* destructor utils */
  private freeData() {
    this.songsDb?.close();
    this.audioContext?.close();
  }

  public destructor() {
    this.needsToBeDestructed = true;
    if (this.isFullyInit) this.freeData();
  }

  /* file creation utils */
  public async addFile(arrayBuffer: ArrayBuffer, name: string) {
    this.currentSound = {};
    this.currentSound.soundSourceData = {
      data: arrayBuffer,
      hash: SparkMD5.ArrayBuffer.hash(arrayBuffer),
    };
    this.currentSound.soundInfoData = { name };

    /* from array buffer to audio buffer */
    this.audioBufferInput = await this.audioContext!.decodeAudioData(
      arrayBuffer
    );
    /* then we make a buffer source to use with the api and we link the
     * processes */
    this.setAudioSourceInput();
    this.linkingProcesses();
  }

  /* misc utils */
  // private checkIfAudioContextIsRunning() {
  //   if (this.audioContext?.state !== 'running') this.audioContext?.resume();
  // }

  private setAudioSourceInput() {
    if (this.audioSourceInput)
      try {
        this.audioSourceInput.disconnect();
      } catch (e: any) { console.log(e.message); } //eslint-disable-line
    this.audioSourceInput = this.audioContext!.createBufferSource();
    this.audioSourceInput.buffer = this.audioBufferInput!;
  }

  private linkingProcesses() {
    /* the reverb process struggles if the source input is connected while
     * linking the processes */
    this.audioSourceInput!.disconnect();
    /* process connection link */
    this.reverbProcessor!.connect(this.audioSourceInput!)
      .connect(this.phaseVocoderProcessor!)
      .connect(this.muffledProcessor!)
      .connect(this.audioContext!.destination);

    // this.audioSourceInput.start();
  }
}
