import type { FFmpeg } from '@ffmpeg/ffmpeg';
import { createFFmpeg } from '@ffmpeg/ffmpeg';
import type Reverb from '@logue/reverb';
import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { Dispatch } from 'react';
import SparkMD5 from 'spark-md5';

import type { IProgressVarsArgs } from '@/templates/app/xlModal/exportMedia/components/ExportExecution';

import bufferToWave from '../bufferToWave';
import type { IAppData } from '../contexts/AppDataContext';
import { EExportChoices } from '../interfaces/ExportChoicesEnum';
import type {
  ISoundsBlobStoreValue,
  ISoundsInfoStoreValue,
  ISoundsManagerCallbacks,
  ISoundsManagerConstructorArgs,
  ISoundsManagerCurrentSound,
  ISoundsManagerDB,
} from '../interfaces/SoundsManagerInterfaces';
import { EEncoderState } from '../interfaces/SoundsManagerInterfaces';
import encoderCommands from './encoderCommands';

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

  /* encoder / processor */

  public encoder?: FFmpeg;

  private ReverbProcessor?: typeof Reverb;

  /* callbacks */
  private afterInitData: ISoundsManagerCallbacks;

  /* db related */
  private songsDb: IDBPDatabase<ISoundsManagerDB> | undefined;

  private dbVersion: number | undefined;

  /* -------------------------------- */
  /* ALLOCATION & DESTRUCTION METHODS */
  /* -------------------------------- */

  constructor(args: ISoundsManagerConstructorArgs) {
    this.afterInitData = {
      setSoundsManagerStateCallback:
        args.setSoundsManagerStateCallback || (() => {}),
      setCurrentSoundCallback: args.setCurrentSoundCallback || (() => {}),
      setSoundReadyCallback: args.setSoundReadyCallback || (() => {}),
      setPlayStateCallback: args.setPlayStateCallback || (() => {}),
      setAppDataCallback: args.setAppDataCallback || (() => {}),
      setEncoderStateCallback: args.setEncoderStateCallback || (() => {}),
    };

    this.dbVersion = args.dbVersion;

    this.currentAppData = args.appData;

    /* catch any critical error in the error callback */
    this.asyncInit().catch((reason) =>
      this.afterInitData.setAppDataCallback({
        error: { type: 'critical', value: reason.message },
      })
    );

    /* ENCODER INIT */
    try {
      this.encoder = createFFmpeg(
        process.env.NODE_ENV !== 'production'
          ? {
              corePath: new URL(
                'assets/js/ffmpeg-core.js',
                document.location.origin
              ).href,
            }
          : undefined
      );
      this.encoder
        .load()
        .then(() =>
          this.afterInitData.setEncoderStateCallback(EEncoderState.LOADED)
        )
        .catch((reason) => {
          this.afterInitData.setEncoderStateCallback(EEncoderState.ERROR);
          this.afterInitData.setAppDataCallback({
            mediumModalText: `The video/audio encoder stumbled upon a problem during init.
          You can still use the app but export options will be restricted.
          (Error: ${reason.message})`,
          });
        });
    } catch (e: any) {
      this.afterInitData.setEncoderStateCallback(EEncoderState.ERROR);
      this.afterInitData.setAppDataCallback({
        mediumModalText: `The video/audio encoder stumbled upon a problem during init.
        You can still use the app but export options will be restricted.
        (Error: ${e.message})`,
      });
    }
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

      this.ReverbProcessor = (await import('@logue/reverb')).default;
      this.reverbProcessor = new this.ReverbProcessor(this.audioContext);

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
    this.afterInitData.setSoundsManagerStateCallback(true);
    /* since this init func is asynchronous, we check the flag to see if
     * something asked the manager to be ended while it was executed */
    if (this.needsToBeDestructed) this.freeData();
  }

  /* destructor utils */
  private freeData() {
    this.isFullyInit = false;
    this.songsDb?.close();
    this.audioContext?.close();
    /* idk if it's that useful since the sm context is sticked with
     * the app so */
    // if (process.env.NODE_ENV === 'production')
    //   this.afterInitData.setSoundsManagerStateCallback(false);
    this.afterInitData.setSoundReadyCallback(false);
    this.afterInitData.setPlayStateCallback(false);
    this.currentSound = {};
    this.afterInitData.setCurrentSoundCallback({});
  }

  public destructor() {
    this.needsToBeDestructed = true;
    if (this.isFullyInit) this.freeData();
  }

  /* ------------ */
  /* PLAYER UTILS */
  /* ------------ */

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
    if (percentage === 100 && this.audioSourceInput?.onended)
      this.audioSourceInput.onended({} as any);
    else {
      /* the received percentage is divided by 100 bc it needs to be a factor */
      const newPosition = (percentage / 100) * this.audioBufferInput!.duration;
      this.ellipsedTime = newPosition;
      this.audioPosition = newPosition;
      if (this.audioIsPlaying) this.play();
    }
  }

  /* reset to cut the audio when leaving the player component */
  public cutAudio() {
    try {
      this.audioSourceInput?.disconnect();
      this.audioIsPlaying = false;
      this.afterInitData.setPlayStateCallback(this.audioIsPlaying);
      /* the muffled should be disconnected but it gives a eery mood to
       * just hear the reverb alone when the source input disconnects
       * i love it haha */
      // this.muffledProcessor?.disconnect();
      if (this.audioSourceInput) this.audioSourceInput.onended = null;
      this.audioSourceInput = undefined;
      } catch (e: any) { console.log(e.message); } //eslint-disable-line
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

  /* ------------- */
  /* SONG CREATION */
  /* ------------- */

  /* file creation utils */
  public async addFile(arrayBuffer: ArrayBuffer, name: string, type: string) {
    /* exits if the constructor threw an error */
    if (!this.isFullyInit)
      throw new Error('The audio context is not (yet) initialized...');
    const tempCurrentSound: ISoundsManagerCurrentSound = {};
    tempCurrentSound.soundInfoStore = 'sounds-temp-info';
    tempCurrentSound.soundSourceData = {
      data: arrayBuffer,
      type,
      hash: SparkMD5.ArrayBuffer.hash(arrayBuffer),
    };
    tempCurrentSound.soundInfoData = {
      name: name || 'Unknown title',
      author: '',
      blobAudioHash: tempCurrentSound.soundSourceData.hash,
      blobVisualHash: '',
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

    /* updates currentSound w/ the fresh data */
    this.currentSound = tempCurrentSound;
    this.afterInitData.setCurrentSoundCallback(tempCurrentSound);
    /* unlocks the player component */
    this.afterInitData.setSoundReadyCallback(true);
  }

  public async undraftCurrentSong() {
    /* exits if it's not a draft song */
    if (this.currentSound.soundInfoStore !== 'sounds-temp-info') return;
    const oldKey = this.currentSound.soundInfoKey;
    /* setup a new date for the new entry */
    const newEntry: Partial<ISoundsInfoStoreValue> = {};
    Object.assign(newEntry, this.currentSound.soundInfoData || {});
    newEntry.creationDate = Date.now();
    /* assigns and update the key */
    this.currentSound.soundInfoKey = await this.songsDb?.add(
      'sounds-info',
      newEntry as ISoundsInfoStoreValue
    );
    /* change local store reference */
    this.currentSound.soundInfoStore = 'sounds-info';
    /* delete the draft song */
    if (oldKey) await this.songsDb?.delete('sounds-temp-info', oldKey);
  }

  /* ----------------- */
  /* SONG EXPORT UTILS */
  /* ----------------- */

  public async exportSong(statusCallback: Dispatch<IProgressVarsArgs>) {
    if (!this.isFullyInit || !this.encoder?.isLoaded)
      throw new Error(
        'The audio context / encoder is not (yet) initialized...'
      );
    if (!this.audioBufferInput)
      throw new Error('There is no song loaded to process');
    /* creating and offline context to make a static version of the song */
    const offlineAudioContext = new OfflineAudioContext({
      numberOfChannels: 2,
      length:
        44100 *
        (this.audioBufferInput.duration /
          (this.currentSound.soundInfoData?.speedValue || 1)),
      sampleRate: 44100,
    });

    statusCallback({
      progress: 0.1,
      consoleEntry: { type: 'normal', entry: 'Offline audio context created' },
    });

    /* export processors */
    await offlineAudioContext.audioWorklet.addModule(
      '/assets/js/phase-vocoder.min.js'
    );
    const offlinePhaseVocoderProc = new AudioWorkletNode(
      offlineAudioContext,
      'phase-vocoder-processor'
    );
    offlinePhaseVocoderProc.parameters.get('pitchFactor')!.value = this
      .currentSound.soundInfoData?.dontChangePitch
      ? 1 / (this.currentSound.soundInfoData?.speedValue || 1)
      : 1;

    const offlineReverbProc = new this.ReverbProcessor!(
      offlineAudioContext as any
    );
    offlineReverbProc.mix(this.currentSound.soundInfoData?.speedValue || 0);

    const offlineMuffledProc = offlineAudioContext.createBiquadFilter();
    offlineMuffledProc.type = 'lowpass';
    offlineMuffledProc.frequency.setTargetAtTime(
      22050 -
        22050 *
          ((this.currentSound.soundInfoData?.lowKeyEffectValue || 50) / 100),
      0,
      0
    );

    statusCallback({
      progress: 0.2,
      consoleEntry: { type: 'normal', entry: 'Audio processors configured' },
    });

    /* setting up the rendering */
    const source = offlineAudioContext.createBufferSource();
    source.buffer = this.audioBufferInput;
    source.playbackRate.value =
      this.currentSound.soundInfoData?.speedValue || 1;
    // PROCESSING GO HERE
    offlineReverbProc
      .connect(source)
      .connect(offlinePhaseVocoderProc)
      .connect(offlineMuffledProc)
      .connect(offlineAudioContext.destination);
    source.start();

    statusCallback({
      progress: 0.3,
      consoleEntry: {
        type: 'normal',
        entry: 'Starting rendering... It could take some time',
      },
    });

    /* rendering and file making */
    const renderedBuffer = await offlineAudioContext.startRendering();

    statusCallback({
      progress: 0.6,
      consoleEntry: { type: 'success', entry: 'Rendering done' },
    });

    statusCallback({
      progress: 0.7,
      consoleEntry: { type: 'normal', entry: 'Blobification...' },
    });

    const blob = bufferToWave(renderedBuffer, offlineAudioContext.length);

    statusCallback({
      progress: 1,
      consoleEntry: {
        type: 'success',
        entry: 'Raw edited song rendered',
      },
    });

    return blob;
  }

  public async encoderUtils(
    editedSong: ArrayBuffer,
    choice: EExportChoices,
    statusCallback: Dispatch<IProgressVarsArgs>
  ) {
    if (!this.isFullyInit || !this.encoder?.isLoaded)
      throw new Error(
        'The audio context / encoder is not (yet) initialized...'
      );

    /* encoder callbacks */
    this.encoder!.setLogger(({ message }) => {
      statusCallback({
        consoleEntry: {
          type: 'normal',
          entry: message,
        },
      });
    });

    /* file registering */
    this.encoder!.FS('writeFile', 'audio.file', new Uint8Array(editedSong));
    if (choice === EExportChoices.TO_MP4 || choice === EExportChoices.TO_WEBM)
      this.encoder!.FS(
        'writeFile',
        'rawvisual.file',
        new Uint8Array(this.currentSound!.visualSourceData!.data!)
      );
    /* vars */
    let command: Array<string> = [];
    const totalDuration =
      (this.currentSound!.soundBufferDuration || 0) /
      (this.currentSound!.soundInfoData!.speedValue || 1);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor(totalDuration / 60 - hours * 60);
    const seconds = Math.floor(totalDuration - minutes * 60);
    const formatDuration = `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    let blob: Blob = new Blob();

    switch (choice) {
      case EExportChoices.TO_AAC:
        await this.encoder!.run(...encoderCommands.TO_AAC);
        blob = new Blob([this.encoder!.FS('readFile', 'output.m4a').buffer], {
          type: 'audio/m4a',
        });
        this.encoder!.FS('unlink', 'output.m4a');
        break;

      case EExportChoices.TO_MP3:
        await this.encoder!.run(...encoderCommands.TO_MP3);
        blob = new Blob([this.encoder!.FS('readFile', 'output.mp3').buffer], {
          type: 'audio/mpeg',
        });
        this.encoder!.FS('unlink', 'output.mp3');
        break;

      case EExportChoices.TO_MP4:
        await this.encoder!.run(...encoderCommands.TO_MP4);
        statusCallback({ progress: 0.5 });
        /* format the new command */
        command = encoderCommands.TO_COPY_BUFFER;
        command[command.findIndex((value) => value === 'TIME')] =
          formatDuration;
        command[command.findIndex((value) => value === 'VFILE')] = 'visual.mp4';
        command[command.findIndex((value) => value === 'OUTPUT')] =
          'output.mp4';
        /* last command */
        await this.encoder!.run(...command);
        blob = new Blob([this.encoder!.FS('readFile', 'output.mp4').buffer], {
          type: 'video/mp4',
        });
        this.encoder!.FS('unlink', 'output.mp4');
        this.encoder!.FS('unlink', 'visual.mp4');
        break;

      case EExportChoices.TO_WEBM:
        await this.encoder!.run(...encoderCommands.TO_WEBM);
        statusCallback({ progress: 0.5 });
        /* format the new command */
        command = encoderCommands.TO_COPY_BUFFER;
        command[command.findIndex((value) => value === 'TIME')] =
          formatDuration;
        command[command.findIndex((value) => value === 'VFILE')] =
          'visual.webm';
        command[command.findIndex((value) => value === 'OUTPUT')] =
          'output.webm';
        /* last command */
        await this.encoder!.run(...command);
        blob = new Blob([this.encoder!.FS('readFile', 'output.webm').buffer], {
          type: 'video/webm',
        });
        this.encoder!.FS('unlink', 'output.webm');
        this.encoder!.FS('unlink', 'visual.webm');
        break;

      default:
        break;
    }

    statusCallback({ progress: 1 });

    this.encoder!.FS('unlink', 'audio.file');
    if (choice === EExportChoices.TO_MP4 || choice === EExportChoices.TO_WEBM)
      this.encoder!.FS('unlink', 'rawvisual.file');
    return blob;
  }

  /* ------------------------------ */
  /* CURRENT SOUND & DATABASE UTILS */
  /* ------------------------------ */

  public resetCurrentSound() {
    if (!this.isFullyInit) return;
    this.currentSound = {};
    this.afterInitData.setCurrentSoundCallback({});
    this.afterInitData.setSoundReadyCallback(false);
    this.audioBufferInput = undefined;
    /* reset other values */
    this.audioPosition = 0;
    this.audioStartTime = 0;
    this.ellipsedTime = 0;
    this.reverbProcessor?.mix(0);
    this.muffledProcessor?.frequency.setTargetAtTime(22050, 0, 0);
    if (this.audioContext?.state === 'running') this.audioContext?.suspend();
  }

  public async updateCurrentSound(values: Partial<ISoundsInfoStoreValue>) {
    if (!this.isFullyInit)
      throw new Error('The audio context is not (yet) initialized...');
    /* basic check to prevent bad database assignation */
    if (!this.currentSound.soundInfoStore || !this.currentSound.soundInfoKey)
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
    this.currentSound.soundInfoData = soundInfoDataUpdated;
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

  public async updateVisualSource(arrayBuffer: ArrayBuffer, type: string) {
    if (!this.isFullyInit)
      throw new Error('The database is not (yet) initialized...');
    /* basic check to prevent bad database assignation */
    if (!this.currentSound.soundInfoStore || !this.currentSound.soundInfoKey)
      return;
    const hash = SparkMD5.ArrayBuffer.hash(arrayBuffer);
    /* remove the old visual asset if it exists */
    if (
      this.currentSound.soundInfoData?.blobVisualHash &&
      (
        await this.songsDb!.getAllFromIndex(
          'sounds-info',
          'by-visual-blob-key',
          this.currentSound.soundInfoData.blobVisualHash
        )
      ).length < 2
    )
      await this.songsDb!.delete(
        'sounds-visual-blob',
        this.currentSound.soundInfoData.blobVisualHash
      );
    /* data injection */
    if (!(await this.songsDb!.get('sounds-visual-blob', hash))) {
      await this.songsDb!.add('sounds-visual-blob', {
        data: arrayBuffer,
        type,
        hash,
      });
    }
    /* then update current state if it went well */
    this.currentSound.visualSourceData = { data: arrayBuffer, type, hash };
    this.afterInitData.setCurrentSoundCallback({
      ...this.currentSound,
      visualSourceData: { data: arrayBuffer, type, hash },
    });
    /* hash ref update on the current sound in db */
    await this.updateCurrentSound({ blobVisualHash: hash });
  }

  public async deleteCurrentSound() {
    if (!this.isFullyInit)
      throw new Error('The database is not (yet) initialized...');
    /* basic check to prevent bad database assignation */
    if (!this.currentSound.soundInfoData || !this.currentSound.soundInfoKey)
      return;
    /* delete the visual asset if no other songs use it */
    if (
      this.currentSound.soundInfoData?.blobVisualHash &&
      (
        await this.songsDb!.getAllFromIndex(
          'sounds-info',
          'by-visual-blob-key',
          this.currentSound.soundInfoData.blobVisualHash
        )
      ).length < 2
    )
      await this.songsDb!.delete(
        'sounds-visual-blob',
        this.currentSound.soundInfoData.blobVisualHash
      );
    /* same w/ the audio asset */
    if (
      this.currentSound.soundInfoData?.blobAudioHash &&
      (
        await this.songsDb!.getAllFromIndex(
          'sounds-info',
          'by-audio-blob-key',
          this.currentSound.soundInfoData.blobAudioHash
        )
      ).length < 2
    )
      await this.songsDb!.delete(
        'sounds-source-blob',
        this.currentSound.soundInfoData.blobAudioHash
      );
    /* then the song data */
    await this.songsDb!.delete('sounds-info', this.currentSound.soundInfoKey);
    /* finally update the currentsound */
    this.currentSound = {};
    this.afterInitData.setCurrentSoundCallback({});
  }

  public async tweakDataCurrentSound(
    type: 'speed' | 'reverb' | 'distance',
    value: number,
    options?: { noDatabaseUpdate?: boolean; noPlaybackValueUpdate?: boolean }
  ) {
    const factor = SoundsManager.valueConverter(type, value, true);
    const oldSpeed = this.currentSound.soundInfoData?.speedValue || 1;
    switch (type) {
      case 'speed':
        if (!options || !options.noDatabaseUpdate)
          await this.updateCurrentSound({
            speedValue: factor,
          });
        if (options && options.noPlaybackValueUpdate) return;
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
          this.audioSourceInput.playbackRate.value = factor;
        if (this.phaseVocoderProcessor)
          this.phaseVocoderProcessor.parameters.get('pitchFactor')!.value = this
            .currentSound.soundInfoData?.dontChangePitch
            ? 1 / factor
            : 1;
        break;
      case 'reverb':
        if (!options || !options.noDatabaseUpdate)
          await this.updateCurrentSound({
            reverbEffectValue: factor,
          });
        if (!options || !options.noPlaybackValueUpdate)
          this.reverbProcessor?.mix(factor);
        break;
      case 'distance':
        if (!options || !options.noDatabaseUpdate)
          await this.updateCurrentSound({
            lowKeyEffectValue: factor,
          });
        if (!options || !options.noPlaybackValueUpdate)
          this.muffledProcessor?.frequency.setTargetAtTime(
            22050 - 22050 * (factor / 100),
            0,
            0
          );
        break;
      default:
        break;
    }
  }

  public async injectInCurrentSong(
    storeName: 'sounds-info' | 'sounds-temp-info',
    key: number,
    setupBuffer?: boolean,
    notToInject?: {
      soundInfoKey?: boolean;
      soundInfoStore?: boolean;
      soundInfoData?: boolean;
      soundSourceData?: boolean;
      visualSourceData?: boolean;
    }
  ) {
    if (!this.isFullyInit)
      throw new Error('The audio context is not (yet) initialized...');
    /* get data to (over)write */
    const data: ISoundsManagerCurrentSound = {};
    Object.assign(data, this.currentSound);

    /* various assignations / database fetchs */
    if (!notToInject || !notToInject.soundInfoKey) data.soundInfoKey = key;

    if (!notToInject || !notToInject.soundInfoStore)
      data.soundInfoStore = storeName;

    if (!notToInject || !notToInject.soundInfoData) {
      data.soundInfoData = await this.songsDb?.get(storeName, key);
      if (!data.soundInfoData)
        throw new Error('The given song id seems to be incorrect');
    }

    if (!notToInject || !notToInject.soundSourceData) {
      data.soundSourceData = await this.songsDb?.get(
        'sounds-source-blob',
        data.soundInfoData?.blobAudioHash || ''
      );
      if (!data.soundSourceData)
        throw new Error('Error while fetching song blob');
    }

    if (!notToInject || !notToInject.visualSourceData) {
      data.visualSourceData = await this.songsDb?.get(
        'sounds-visual-blob',
        data.soundInfoData?.blobVisualHash || ''
      );
      if (!data.visualSourceData)
        throw new Error('Error while fetching visual blob');
    }

    /* audiobuffer setup */
    if (setupBuffer) {
      /* from array buffer to audio buffer */
      this.audioBufferInput = await this.audioContext!.decodeAudioData(
        data.soundSourceData?.data as ArrayBuffer
      );
      data.soundBufferDuration = this.audioBufferInput.duration;
      /* distance & reverb setup (speed is handled by setAudioSourceInput)
       * when playing the song */
      this.muffledProcessor?.frequency.setTargetAtTime(
        22050 - 22050 * (data.soundInfoData!.lowKeyEffectValue! / 100),
        0,
        0
      );
      this.reverbProcessor?.mix(data.soundInfoData?.reverbEffectValue!);
      /* the sound is ready */
      this.afterInitData.setSoundReadyCallback(true);
    }

    /* state update ... */
    this.afterInitData.setCurrentSoundCallback(data);
    /* ... though if this method is called multiple times in a row it may not
     * be updated soon enough so it's also "locally" updated */
    this.currentSound = data;
  }

  public contextUpdateCurrentSound(currentSound: ISoundsManagerCurrentSound) {
    this.currentSound = currentSound;
  }

  public contextUpdateCurrentAppData(currentAppData: Partial<IAppData>) {
    this.currentAppData = currentAppData;
  }

  public async getAllFromIndex(
    storeName: 'sounds-info' | 'sounds-temp-info',
    index: 'by-date' | 'by-audio-blob-key' | 'by-visual-blob-key',
    reversed?: boolean
  ): Promise<
    [
      Array<ISoundsInfoStoreValue | Partial<ISoundsInfoStoreValue>>,
      Array<number>
    ]
  > {
    if (!this.songsDb)
      throw new Error('The database is still loading or had issues to load');
    const data = await this.songsDb.getAllFromIndex(storeName, index);
    const keys = await this.songsDb.getAllKeysFromIndex(storeName, index);
    if (reversed) {
      data.reverse();
      keys.reverse();
    }
    return [data, keys];
  }

  /* -------------- */
  /* STATIC METHODS */
  /* -------------- */

  public static valueConverter(
    type: 'speed' | 'reverb' | 'distance',
    value: number,
    /* true = percentage -> factor ; false = factor -> percentage */
    toFactor: boolean
  ) {
    let computed = 0;
    switch (type) {
      case 'speed':
        /* the percentage divided by 50 makes the speed of the playback
         * ranged between 0 and 2, the pitch, if setted to be preserved,
         * is a factor made using the speed value */
        computed = toFactor ? value / 50 : value;
        /* bare speed-up value is good but the slowed down one needs to be
         * capped btw 0.25 and 1 bc the sound is too distorted under 0.25 */
        if (computed < 1)
          computed = toFactor
            ? computed * 0.75 + 0.25
            : (computed - 0.25) / 0.75;
        if (!toFactor) computed *= 50;
        break;
      case 'reverb':
        /* just a factor translation */
        computed = toFactor ? value / 100 : value * 100;
        break;
      case 'distance':
        /* there's no real effect on a "1-50" range so we're focusing the "50-100"
         * range only */
        computed = toFactor ? 50 + Math.min(value, 99) / 2 : (value - 50) * 2;
        break;
      default:
        break;
    }
    return computed;
  }
}
