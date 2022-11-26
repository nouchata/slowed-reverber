import Reverb from '@logue/reverb';
import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import SparkMD5 from 'spark-md5';

import type {
  ISoundsBlobStoreValue,
  ISoundsManagerCallbacks,
  ISoundsManagerConstructorArgs,
  ISoundsManagerCurrentSound,
  ISoundsManagerDB,
} from '../interfaces/SoundsManagerInterfaces';

export default class SoundsManager {
  /* state related */
  private isFullyInit = false;

  /* since some of the logic is made asynchronously, this state will
   * be verified at the end of asyncInit to check if the newly opened
   * assets needs to be flushed */
  private needsToBeDestructed = false;

  public currentSound: ISoundsManagerCurrentSound = {};

  /* audiocontext related */
  public audioContext: AudioContext | undefined = undefined;

  private audioSourceInput: AudioBufferSourceNode | undefined = undefined;

  private audioBufferInput: AudioBuffer | undefined = undefined;

  private phaseVocoderProcessor: AudioWorkletNode | undefined = undefined;

  private reverbProcessor: Reverb | undefined = undefined;

  private muffledProcessor: BiquadFilterNode | undefined = undefined;

  /* player related */
  private audioPosition = 0;

  private audioStartTime = 0;

  private audioIsPlaying = false;

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
      setCurrentSoundCallback: args.setCurrentSoundCallback || (() => {}),
      setSoundReadyCallback: args.setSoundReadyCallback || (() => {}),
      setPlayStateCallback: args.setPlayStateCallback || (() => {}),
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
            const soundsInfoStore = db.createObjectStore('sounds-info', {
              autoIncrement: true,
            });
            soundsInfoStore.createIndex('by-date', 'creationDate');
            soundsInfoStore.createIndex('by-audio-blob-key', 'blobAudioHash');
            soundsInfoStore.createIndex('by-visual-blob-key', 'blobVisualHash');
            const soundsTempInfoStore = db.createObjectStore(
              'sounds-temp-info',
              {
                autoIncrement: true,
              }
            );
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

  /* reset to cut the audio when leaving the player component */
  public cutAudio(externalCall?: boolean) {
    try {
      this.audioSourceInput?.disconnect();
      this.audioIsPlaying = false;
      this.afterInitData.setPlayStateCallback(this.audioIsPlaying);
      /* the muffled should be disconnected but it gives a eery mood to
       * just hear the reverb alone when the source input disconnects
       * i love it haha */
      // this.muffledProcessor?.disconnect();
      this.audioSourceInput = undefined;
      if (externalCall) this.afterInitData.setSoundReadyCallback(false);
    } catch (e: any) { console.log(e.message); } //eslint-disable-line
  }

  /* destructor utils */
  private freeData() {
    this.songsDb?.close();
    this.audioContext?.close();
    this.afterInitData.setSoundReadyCallback(false);
    this.afterInitData.setPlayStateCallback(false);
    this.afterInitData.setCurrentSoundCallback({});
  }

  public destructor() {
    this.needsToBeDestructed = true;
    if (this.isFullyInit) this.freeData();
  }

  public play(position?: number) {
    if (this.audioContext?.state !== 'running') this.audioContext?.resume();
    this.setAudioSourceInput();
    this.linkingProcesses();
    /* seeking update for resuming */
    this.audioPosition = position || this.audioPosition;
    this.audioStartTime =
      this.audioContext!.currentTime - (this.audioPosition || 0);
    this.audioSourceInput!.start(
      this.audioContext!.currentTime,
      this.audioPosition
    );
    this.audioIsPlaying = true;
    this.afterInitData.setPlayStateCallback(this.audioIsPlaying);
  }

  public pause() {
    /* position memorization for resuming */
    this.audioSourceInput!.stop(0);
    this.audioIsPlaying = false;
    this.afterInitData.setPlayStateCallback(this.audioIsPlaying);
    this.audioPosition = this.audioContext!.currentTime - this.audioStartTime;
  }

  /* progressbar interaction */
  public updateAudioPosition(percentage: number) {
    if (percentage === 100) this.audioSourceInput!.onended!({} as any);
    else {
      /* the received percentage is divided by 100 bc it needs to be a factor */
      const newPosition = (percentage / 100) * this.audioBufferInput!.duration;
      if (this.audioIsPlaying) this.play(newPosition);
      else this.audioPosition = newPosition;
    }
  }

  /* file creation utils */
  public async addFile(arrayBuffer: ArrayBuffer, name: string) {
    // this.currentSound = {};
    const tempCurrentSound: ISoundsManagerCurrentSound = {};
    tempCurrentSound.soundInfoStore = 'sounds-source-blob';
    tempCurrentSound.soundSourceData = {
      data: arrayBuffer,
      hash: SparkMD5.ArrayBuffer.hash(arrayBuffer),
    };
    tempCurrentSound.soundInfoData = {
      name,
      blobAudioHash: tempCurrentSound.soundSourceData.hash,
    };

    /* injects the arraybuffer in the database if it doesn't exists */
    if (
      !(await this.songsDb?.get(
        'sounds-source-blob',
        tempCurrentSound.soundSourceData.hash!
      ))
    )
      await this.songsDb?.add(
        'sounds-source-blob',
        tempCurrentSound.soundSourceData as ISoundsBlobStoreValue
      );
    /* creates a new entry for the sound infos in the temporary store
     * then assigns the returned index in the local object for further
     * edits */
    tempCurrentSound.soundInfoKey = await this.songsDb?.add(
      'sounds-temp-info',
      tempCurrentSound.soundInfoData
    );

    /* from array buffer to audio buffer */
    this.audioBufferInput = await this.audioContext!.decodeAudioData(
      arrayBuffer
    );
    tempCurrentSound.soundBufferDuration = this.audioBufferInput.duration;
    /* reset player data in case a sound was played before */
    this.audioPosition = 0;
    this.audioStartTime = 0;

    /* updates currentSound w/ the fresh data */
    this.afterInitData.setCurrentSoundCallback(tempCurrentSound);
    /* unlocks the player component */
    this.afterInitData.setSoundReadyCallback(true);
  }

  private setAudioSourceInput() {
    this.cutAudio();
    this.audioSourceInput = this.audioContext!.createBufferSource();
    this.audioSourceInput.onended = () => {
      /* onended triggers when putting pause so this makes sure it doesn't
       * reset in this scenario */
      if (!this.audioIsPlaying) return;
      /* reset to the start when the audio ends */
      try {
        this.audioSourceInput!.stop(0);
      } catch {} //eslint-disable-line
      this.audioIsPlaying = false;
      this.afterInitData.setPlayStateCallback(this.audioIsPlaying);
      this.audioPosition = 0;
      this.audioStartTime = 0;
    };
    this.audioSourceInput.buffer = this.audioBufferInput!;
    this.audioSourceInput.playbackRate.value = 0.8;
  }

  private linkingProcesses() {
    /* the reverb process struggles if the source input is connected while
     * linking the processes */
    // this.audioSourceInput?.disconnect();
    /* process connection link */
    this.reverbProcessor!.connect(this.audioSourceInput!)
      .connect(this.phaseVocoderProcessor!)
      .connect(this.muffledProcessor!)
      .connect(this.audioContext!.destination);

    // this.audioSourceInput.start();
  }

  public contextUpdateCurrentSound(currentSound: ISoundsManagerCurrentSound) {
    this.currentSound = currentSound;
  }

  public getCurrentPercentage() {
    return (
      (this.audioIsPlaying
        ? this.audioContext!.currentTime - this.audioStartTime
        : this.audioPosition) / this.audioBufferInput!.duration
    );
  }
}
