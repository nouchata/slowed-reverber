import gsap from 'gsap';
import Link from 'next/link';
import { useContext, useEffect, useRef, useState } from 'react';

import { SoundsManagerContext } from '@/utils/contexts/SoundsManagerContext';
import { EAppModalState } from '@/utils/interfaces/AppModalState';
import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

import getPercentagesData from './songsListUtils';

const SongsList = (
  props: IStylePropsInterface & {
    store: 'sounds-info' | 'sounds-temp-info';
  }
) => {
  /* should probably name the state type another way but 🤷 */
  const [listState, setListState] = useState<{
    state: EAppModalState;
    error?: string;
  }>({ state: EAppModalState.LOADING });
  const { soundsManager, isSoundsManagerInit } =
    useContext(SoundsManagerContext);
  /* li entries container */
  const [songs, setSongs] = useState<Array<JSX.Element> | undefined>(undefined);
  /* content container ref */
  const contentContainerRef = useRef<HTMLDivElement>(null);
  /* fold flag */
  const [isFolded, setIsFolded] = useState(false);
  useEffect(() => {
    (async () => {
      /* database init check */
      if (!isSoundsManagerInit) return;
      /* show the spinner */
      setListState({ state: EAppModalState.LOADING });
      let errorFlag = false;
      /* gets songs data */
      const raw = await soundsManager
        ?.getAllFromIndex(props.store, 'by-date', true)
        .catch((reason) => {
          errorFlag = true;
          setListState({ state: EAppModalState.ERROR, error: reason.message });
        });
      /* exits if error */
      if (errorFlag) return;
      const [data, keys] = raw!;
      /* creates li entries */
      setSongs(
        data.map((value, index) => {
          const percentages = getPercentagesData(value);
          return (
            <Link
              key={index}
              href={{
                pathname: '/app/songs',
                query:
                  props.store === 'sounds-info'
                    ? {
                        md: 'viewSong',
                        s: keys[index],
                      }
                    : {
                        md: 'editSong',
                        t: keys[index],
                      },
              }}
            >
              <li className="relative overflow-hidden box-border bg-app-modal-xl-lighter/70 w-full h-24 rounded shadow-inner select-none cursor-pointer my-1">
                <h6
                  className="absolute top-1 px-3 text-2xl w-full font-extrabold overflow-hidden whitespace-nowrap text-ellipsis"
                  title="Song name"
                >
                  {value.name !== undefined
                    ? value.name || '「 」'
                    : 'Unknown name'}
                </h6>
                <span
                  className="absolute block top-8 px-3 text-sm font-serif italic w-full overflow-hidden whitespace-nowrap text-ellipsis"
                  title="Author"
                >
                  {value.author || 'Unknown author'}
                </span>
                <p
                  className="absolute bg-white/10 px-3 bottom-1 w-full shadow text-xs text-center overflow-hidden whitespace-nowrap text-ellipsis"
                  title="Data description"
                >
                  <span
                    style={{
                      opacity: Math.max(10, percentages.speed.value) / 100,
                    }}
                  >
                    {percentages.speed.type === 'normal' && 'Normal speed'}
                    {percentages.speed.type === 'slowed' && 'Slowed down'}
                    {percentages.speed.type === 'sped up' && 'Sped up'}
                  </span>{' '}
                  •{' '}
                  <span
                    style={{
                      opacity: Math.max(10, percentages.reverb) / 100,
                    }}
                  >
                    Reverbed
                  </span>{' '}
                  •{' '}
                  <span
                    style={{
                      opacity: Math.max(10, percentages.distance) / 100,
                    }}
                  >
                    Muffled
                  </span>
                </p>
              </li>
            </Link>
          );
        })
      );
      setListState({ state: EAppModalState.SUCCESS });
    })();
  }, [isSoundsManagerInit, soundsManager]);
  return (
    <div
      className={`${props.className} px-1 ${
        listState.state === EAppModalState.LOADING ? 'animate-pulse' : ''
      }`}
    >
      <div
        className="overflow-hidden h-8 flex flex-nowrap items-center gap-2 cursor-pointer"
        onClick={() => {
          if (
            contentContainerRef.current &&
            listState.state !== EAppModalState.LOADING
          ) {
            gsap.to(contentContainerRef.current, {
              height: isFolded ? 'auto' : '0',
              duration: 0.5,
              ease: 'none.none',
            });
            setIsFolded(!isFolded);
          }
        }}
      >
        <h5 className="shrink-0 font-bold">
          {props.store === 'sounds-info' ? 'Songs' : 'Drafts'}
        </h5>
        {listState.state === EAppModalState.SUCCESS && (
          <span
            className="shrink-0 bg-white overflow-hidden box-border flex justify-center items-center h-4/6 px-1 mr-1 font-bold text-xs rounded-xl text-black"
            title={`Number of ${
              props.store === 'sounds-info' ? 'songs' : 'drafts'
            }`}
          >
            {songs?.length || 0}
          </span>
        )}
        <svg
          className="flex-1 h-full overflow-visible opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
          width="0"
          strokeWidth="3"
          strokeLinecap="round"
          aria-labelledby="title"
        >
          <title>Filler</title>
          <line x1="0%" y1="50%" x2="100%" y2="50%" />
        </svg>
        <svg
          className={`shrink-0 h-5/6 ${isFolded ? '' : 'rotate-180'}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-labelledby="title"
        >
          <title>Spreader</title>
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
      <div ref={contentContainerRef} className="overflow-hidden transition-all">
        {listState.state === EAppModalState.LOADING && (
          <div className="w-full flex justify-center items-center overflow-hidden">
            <img
              className="h-8 animate-spin"
              alt="Loading..."
              src={`data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='2' x2='12' y2='6'%3E%3C/line%3E%3Cline x1='12' y1='18' x2='12' y2='22'%3E%3C/line%3E%3Cline x1='4.93' y1='4.93' x2='7.76' y2='7.76'%3E%3C/line%3E%3Cline x1='16.24' y1='16.24' x2='19.07' y2='19.07'%3E%3C/line%3E%3Cline x1='2' y1='12' x2='6' y2='12'%3E%3C/line%3E%3Cline x1='18' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cline x1='4.93' y1='19.07' x2='7.76' y2='16.24'%3E%3C/line%3E%3Cline x1='16.24' y1='7.76' x2='19.07' y2='4.93'%3E%3C/line%3E%3C/svg%3E`}
            />
          </div>
        )}
        {listState.state === EAppModalState.ERROR && (
          <div className="w-full flex flex-col justify-center items-center overflow-hidden">
            <img
              className="h-8"
              alt="Error"
              src={`data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolygon points='7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2'%3E%3C/polygon%3E%3Cline x1='12' y1='8' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='16' x2='12.01' y2='16'%3E%3C/line%3E%3C/svg%3E`}
            />
            <p className="text-white text-xs text-center">
              Error while fetching the songs data
              {listState.error ? (
                <>
                  :<br />
                  {listState.error}
                </>
              ) : (
                <></>
              )}
            </p>
          </div>
        )}
        {listState.state === EAppModalState.SUCCESS && !songs?.length && (
          <div className="w-full flex flex-col justify-center items-center overflow-hidden">
            <img
              className="h-8"
              alt="No songs"
              src={
                props.store === 'sounds-info'
                  ? `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='5' x2='12' y2='19'%3E%3C/line%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3C/svg%3E`
                  : `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='21 8 21 21 3 21 3 8'%3E%3C/polyline%3E%3Crect x='1' y='3' width='22' height='5'%3E%3C/rect%3E%3Cline x1='10' y1='12' x2='14' y2='12'%3E%3C/line%3E%3C/svg%3E`
              }
            />
            <p className="text-white text-xs text-center px-2">
              {props.store === 'sounds-info'
                ? 'No songs to show. Click on the blue button to add one !'
                : 'No drafts to show'}
            </p>
          </div>
        )}
        {listState.state === EAppModalState.SUCCESS && !!songs?.length && (
          <ul className="list-none overflow-hidden px-1 w-full py-2">
            {songs}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SongsList;
