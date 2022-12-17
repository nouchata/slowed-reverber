import type Reverb from '@logue/reverb';
import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import SparkMD5 from 'spark-md5';

import type { IAppData } from '../contexts/AppDataContext';
import type {
  ISoundsBlobStoreValue,
  ISoundsInfoStoreValue,
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

  public currentAppData: Partial<IAppData> | undefined = {};

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

  private ellipsedTime = 0;

  /* callbacks */
  private afterInitData: ISoundsManagerCallbacks;

  /* db related */
  private songsDb: IDBPDatabase<ISoundsManagerDB> | undefined;

  private dbVersion: number | undefined;

  constructor(args: ISoundsManagerConstructorArgs) {
    this.afterInitData = {
      successCallback: args.successCallback || (() => {}),
      successCallbackArgs: args.successCallbackArgs || [],
      setCurrentSoundCallback: args.setCurrentSoundCallback || (() => {}),
      setSoundReadyCallback: args.setSoundReadyCallback || (() => {}),
      setPlayStateCallback: args.setPlayStateCallback || (() => {}),
      setAppDataCallback: args.setAppDataCallback || (() => {}),
    };

    this.dbVersion = args.dbVersion;

    this.currentAppData = args.appData;

    /* catch any critical error in the error callback */
    this.asyncInit().catch((reason) =>
      this.afterInitData.setAppDataCallback({
        error: { type: 'critical', value: reason.message },
      })
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

      const Reverb = (await import('@logue/reverb')).default;
      this.reverbProcessor = new Reverb(this.audioContext);

      this.muffledProcessor = this.audioContext.createBiquadFilter();
      this.muffledProcessor.type = 'lowpass';
      this.muffledProcessor.frequency.setTargetAtTime(
        22050, // basically disable it
        0,
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
    this.isFullyInit = false;
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

  public play() {
    if (this.audioContext?.state !== 'running') this.audioContext?.resume();
    this.setAudioSourceInput();
    this.linkingProcesses();
    /* seeking update for resuming */
    this.audioStartTime = this.audioContext!.currentTime;
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
    const notIncludedInEllipsed =
      (this.audioContext!.currentTime - this.audioStartTime) *
      (this.currentSound.soundInfoData?.speedValue || 1);
    this.audioPosition = notIncludedInEllipsed + this.ellipsedTime;
    this.ellipsedTime = this.audioPosition;
  }

  /* progressbar interaction */
  public updateAudioPosition(percentage: number) {
    if (percentage === 100) this.audioSourceInput!.onended!({} as any);
    else {
      /* the received percentage is divided by 100 bc it needs to be a factor */
      const newPosition = (percentage / 100) * this.audioBufferInput!.duration;
      this.ellipsedTime = newPosition;
      this.audioPosition = newPosition;
      if (this.audioIsPlaying) this.play();
    }
  }

  /* file creation utils */
  public async addFile(arrayBuffer: ArrayBuffer, name: string) {
    /* exits if the constructor threw an error */
    if (!this.isFullyInit) return;
    const tempCurrentSound: ISoundsManagerCurrentSound = {};
    tempCurrentSound.soundInfoStore = 'sounds-temp-info';
    tempCurrentSound.soundSourceData = {
      data: arrayBuffer,
      hash: SparkMD5.ArrayBuffer.hash(arrayBuffer),
    };
    tempCurrentSound.soundInfoData = {
      name: name || 'Unknown title',
      blobAudioHash: tempCurrentSound.soundSourceData.hash,
      creationDate: Date.now(),
      /* default tweak values */
      dontChangePitch: false,
      speedValue: 1,
      reverbEffectValue: 0,
      lowKeyEffectValue: 50,
    };

    /* injects the arraybuffer in the database if it doesn't exists */
    if (
      !(await this.songsDb!.get(
        'sounds-source-blob',
        tempCurrentSound.soundSourceData.hash!
      ))
    )
      await this.songsDb!.add(
        'sounds-source-blob',
        tempCurrentSound.soundSourceData as ISoundsBlobStoreValue
      );
    /* creates a new entry for the sound infos in the temporary store
     * then assigns the returned index in the local object for further
     * edits */
    tempCurrentSound.soundInfoKey = await this.songsDb!.add(
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
      /* various resets */
      this.audioIsPlaying = false;
      this.afterInitData.setPlayStateCallback(this.audioIsPlaying);
      this.audioPosition = 0;
      this.audioStartTime = 0;
      this.ellipsedTime = 0;
    };
    this.audioSourceInput.buffer = this.audioBufferInput!;
    this.audioSourceInput.playbackRate.value =
      this.currentSound.soundInfoData?.speedValue || 1;
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

  public contextUpdateCurrentAppData(currentAppData: Partial<IAppData>) {
    this.currentAppData = currentAppData;
  }

  public resetCurrentSound() {
    this.afterInitData.setCurrentSoundCallback({});
    /* reset other values */
    this.ellipsedTime = 0;
    this.reverbProcessor?.mix(0);
    this.muffledProcessor?.frequency.setTargetAtTime(22050, 0, 0);
    if (this.audioContext?.state === 'running') this.audioContext?.suspend();
  }

  public async updateCurrentSound(values: Partial<ISoundsInfoStoreValue>) {
    /* basic check to prevent bad database assignation */
    if (
      !this.isFullyInit ||
      !this.currentSound.soundInfoStore ||
      !this.currentSound.soundInfoKey
    )
      return;
    /* reassignation */
    const soundInfoDataUpdated = this.currentSound.soundInfoData || {};
    Object.assign(soundInfoDataUpdated, values);
    /* update entry */
    await this.songsDb!.put(
      this.currentSound.soundInfoStore,
      soundInfoDataUpdated,
      this.currentSound.soundInfoKey
    );
    /* then update current state if it went well */
    this.afterInitData.setCurrentSoundCallback({
      ...this.currentSound,
      soundInfoData: soundInfoDataUpdated,
    });
    /* direct updates */
    if (this.phaseVocoderProcessor && values.dontChangePitch !== undefined)
      this.phaseVocoderProcessor.parameters.get('pitchFactor')!.value =
        values.dontChangePitch && soundInfoDataUpdated.speedValue
          ? 1 / soundInfoDataUpdated.speedValue
          : 1;
  }

  public async tweakDataCurrentSound(
    type: 'speed' | 'reverb' | 'distance',
    value: number,
    alreadyFormatted?: boolean
  ) {
    const updatedValues: any = {};
    const oldSpeed = this.currentSound.soundInfoData?.speedValue || 1;
    switch (type) {
      case 'speed':
        /* the percentage divided by 50 makes the speed of the playback
         * ranged between 0 and 2, the pitch, if setted to be preserved,
         * is a factor made using the speed value */
        updatedValues.speedValue = value / 50;
        /* bare speed-up value is good but the slowed down one needs to be
         * capped btw 0.25 and 1 bc the sound is too distorted under 0.25 */
        if (updatedValues.speedValue < 1 && !alreadyFormatted)
          updatedValues.speedValue = updatedValues.speedValue * 0.75 + 0.25;
        await this.updateCurrentSound({ speedValue: updatedValues.speedValue });
        /* the audiocontext isn't conceived to be used for playback so there
         * are no easy way to directly track the progress of the buffer source
         * albeit the audiocontext time tracking (currentTime) can be used since
         * it increases every seconds while the audiocontext is running though we
         * need to consider the fact that the buffer source speed can be tweaked
         * so ellipsedTime is used to track the real progress of the song based
         * on the speed and is updated each time the speed is updated to allow
         * a good tracking on the front-end regarding the progressbar */
        if (this.audioIsPlaying) {
          this.ellipsedTime +=
            (this.audioContext!.currentTime - this.audioStartTime) * oldSpeed;
          this.audioStartTime = this.audioContext!.currentTime;
        }
        /* real time updates using the processors */
        if (this.audioSourceInput)
          this.audioSourceInput.playbackRate.value = updatedValues.speedValue;
        if (this.phaseVocoderProcessor)
          this.phaseVocoderProcessor.parameters.get('pitchFactor')!.value = this
            .currentSound.soundInfoData?.dontChangePitch
            ? 1 / updatedValues.speedValue
            : 1;
        break;
      case 'reverb':
        updatedValues.reverb = value / 100;
        await this.updateCurrentSound({
          reverbEffectValue: updatedValues.reverb,
        });
        this.reverbProcessor?.mix(updatedValues.reverb);
        break;
      case 'distance':
        /* there's no real effect on a "1-50" range so we're focusing the "50-100"
         * range only */
        updatedValues.muffled = 50 + Math.min(value, 99) / 2;
        await this.updateCurrentSound({
          lowKeyEffectValue: updatedValues.muffled,
        });
        this.muffledProcessor?.frequency.setTargetAtTime(
          22050 - 22050 * (updatedValues.muffled / 100),
          0,
          0
        );
        break;
      default:
        break;
    }
  }

  /* the returned percentage is not /100 but /1 */
  public getCurrentPercentage() {
    const notIncludedInEllipsed =
      (this.audioContext!.currentTime - this.audioStartTime) *
      (this.currentSound.soundInfoData?.speedValue || 1);
    return (
      (this.audioIsPlaying
        ? notIncludedInEllipsed + this.ellipsedTime
        : this.audioPosition) / this.audioBufferInput!.duration
    );
  }
}
