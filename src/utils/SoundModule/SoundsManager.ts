import Reverb from '@logue/reverb';
import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import SparkMD5 from 'spark-md5';

import type {
  ISoundsBlobStore,
  ISoundsInfoStore,
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

  public currentSound: {
    soundInfoData: Partial<ISoundsInfoStore>;
    soundSourceData: Partial<ISoundsBlobStore>;
    visualSourceData: Partial<ISoundsBlobStore>;
  } = { soundInfoData: {}, soundSourceData: {}, visualSourceData: {} };

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
    /* AVAILABILITY CHECKS */
    if (!('indexedDB' in window))
      throw new Error("This browser doesn't support IndexedDB");

    const AudioContextObject =
      window.AudioContext ||
      (window as Window & any).webkitAudioContext ||
      (window as Window & any).mozAudioContext ||
      (window as Window & any).oAudioContext ||
      (window as Window & any).msAudioContext ||
      undefined;

    if (!AudioContextObject)
      throw new Error("This browser doesn't support Web Audio API");

    /* DB CREATION / UPGRADE */
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

    /* audiocontext setup */
    this.audioContext = new AudioContextObject();
    /* processors init */
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
      22050,
      this.audioContext.currentTime,
      0
    );
    /* linking everything to the audiocontext */
    // this.muffledProcessor.connect(this.audioContext.destination);
    // this.reverbProcessor.connect(this.muffledProcessor);
    // this.phaseVocoderProcessor.connect(this.audioContext.destination);
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
  public async addFile(arrayBuffer: ArrayBuffer) {
    this.checkIfAudioContextIsRunning();
    this.currentSound.soundSourceData.value = {
      data: arrayBuffer,
      hash: SparkMD5.ArrayBuffer.hash(arrayBuffer),
    };
    // console.log(this.currentSound.soundSourceData.value.hash);

    this.audioBufferInput = await this.audioContext!.decodeAudioData(
      arrayBuffer
    );
    this.audioSourceInput = this.audioContext!.createBufferSource();
    this.audioSourceInput.buffer = this.audioBufferInput;

    this.audioSourceInput.disconnect();
    // this.audioSourceInput.connect(this.phaseVocoderProcessor!);
    this.reverbProcessor!.connect(this.audioSourceInput)
      .connect(this.phaseVocoderProcessor!)
      .connect(this.muffledProcessor!);
    this.muffledProcessor!.connect(this.audioContext!.destination);
    // this.audioSourceInput.connect(this.audioContext!.destination);
    this.audioSourceInput.start();

    let value = 1;
    setInterval(() => {
      // console.log('switch', value);
      // console.log(this.reverbProcessor);
      this.reverbProcessor!.mix(value);
      value = value === 1 ? 0 : 1;
    }, 10000);
  }

  /* misc utils */
  private checkIfAudioContextIsRunning() {
    if (this.audioContext?.state !== 'running') this.audioContext?.resume();
  }
}
