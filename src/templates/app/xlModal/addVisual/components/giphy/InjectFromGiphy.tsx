import { GiphyFetch } from '@giphy/js-fetch-api';
import type { IGif } from '@giphy/js-types';
import { Grid } from '@giphy/react-components';
import type { Reducer } from 'react';
import { useContext, useEffect, useReducer, useRef, useState } from 'react';

import AppModalsCriticalError from '@/templates/app/AppModalsCriticalError';
import { AppDataContext } from '@/utils/contexts/AppDataContext';
import type { IAppModalPaneProps } from '@/utils/interfaces/AppModalState';
import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';
import useWindowSize from '@/utils/useWindowSize';

import GiphySuggestionBar from './GiphySuggestionBar';

const giphyFetch = new GiphyFetch('sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh');
const noSearchFetchGifs = (offset: number) =>
  giphyFetch.trending({ offset, limit: 10 });
/* needs currying to get the react state var value */
const searchFetchGifs = (searchQuery: string) => {
  return (offset: number) =>
    giphyFetch.search(searchQuery, { offset, limit: 10 });
};
/* search bar input debouncer */
const debouncer = (() => {
  let timeout: any;
  return (callback: Function) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      callback();
      timeout = undefined;
    }, 500);
  };
})();

const InjectFromGiphy = (
  props: IStylePropsInterface &
    IAppModalPaneProps & {
      processCallback: (file: Blob) => Promise<any>;
      successCallback: Function;
    }
) => {
  const windowSize = useWindowSize();
  const { setAppData } = useContext(AppDataContext);

  /* grid width can't be setted with css since the width props is mandatory and
   * it's setted through html style (which has the priority over class and id)
   * thus it'll be setted directly when the resize event happens using these
   * states */
  const gridContainerRef = useRef<HTMLDivElement>(null);
  const [gridProps, setGridProps] = useState<{
    width: number;
    columns: number;
  }>({ width: 100, columns: 2 });
  const [searchValue, setSearchValue] = useState('');
  const [suggestedValue, setSuggestedValue] = useState('');

  const [isGifCurrentlyFetched, setIsGifCurrentlyFetched] = useState(false);
  /* this reducer is not relevant as it is but i have some ideas that
   * might require it so i'm leaving it for now */
  const [, setCurrentGif] = useReducer<
    Reducer<
      { gifElement: HTMLElement; overlay: Node } | undefined,
      { gifElement: HTMLElement; gifData: IGif } | undefined
    >
  >((state, update) => {
    /* removes the old overlay if it exists */
    if (state && state.gifElement.lastElementChild?.id === 'gif-action-overlay')
      state.gifElement.removeChild(state.gifElement.lastElementChild);
    /* create and append a new one if data is given */
    if (update) {
      /* overlay creation */
      const newOverlay = document.createElement('div');
      newOverlay.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; background-color: rgba(0,0,0,0.5); border-radius: ${update.gifElement.style.borderRadius};`;
      newOverlay.id = `gif-action-overlay`;
      /* overlay content */
      const overlayContent = document.createElement('img');
      overlayContent.style.height = '80px';
      overlayContent.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4'%3E%3C/path%3E%3Cpolyline points='7 10 12 15 17 10'%3E%3C/polyline%3E%3Cline x1='12' y1='15' x2='12' y2='3'%3E%3C/line%3E%3C/svg%3E`;
      overlayContent.className = 'animate-element-scale-emphasis';
      newOverlay.appendChild(overlayContent);
      /* overlay callback */
      newOverlay.onclick = (e) => {
        /* junky giphy grid throws events anyhow so this prevents it from happening */
        e.stopImmediatePropagation();
        (async () => {
          setIsGifCurrentlyFetched(true);
          /* graphic updates for the user */
          const target = (e.currentTarget as HTMLElement)
            .lastElementChild as HTMLImageElement | null;
          if (target) {
            target.src = `data:image/svg+xml,%0A%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='12' y1='2' x2='12' y2='6'%3E%3C/line%3E%3Cline x1='12' y1='18' x2='12' y2='22'%3E%3C/line%3E%3Cline x1='4.93' y1='4.93' x2='7.76' y2='7.76'%3E%3C/line%3E%3Cline x1='16.24' y1='16.24' x2='19.07' y2='19.07'%3E%3C/line%3E%3Cline x1='2' y1='12' x2='6' y2='12'%3E%3C/line%3E%3Cline x1='18' y1='12' x2='22' y2='12'%3E%3C/line%3E%3Cline x1='4.93' y1='19.07' x2='7.76' y2='16.24'%3E%3C/line%3E%3Cline x1='16.24' y1='7.76' x2='19.07' y2='4.93'%3E%3C/line%3E%3C/svg%3E`;
            target.className = 'animate-spin';
          }
          /* fetching stuff */
          const response = await fetch(
            update.gifData.images.original.webp
          ).catch((reason) => {
            setAppData!({ error: { type: 'normal', value: reason.message } });
          });
          if (response) {
            const blob = await response.blob().catch((reason) => {
              setAppData!({ error: { type: 'normal', value: reason.message } });
            });
            if (blob) await props.processCallback(blob);
            props.successCallback();
          }
          setIsGifCurrentlyFetched(false);
        })();
      };
      /* overlay append ; the condition is used to get along w/ the strict mode in dev env and prevent duplication */
      if (update.gifElement.childElementCount === 1)
        update.gifElement.appendChild(newOverlay);
      return {
        gifElement: update.gifElement,
        overlay: newOverlay,
      };
    }
    /* fallback returns undefined */
    return undefined;
  }, undefined);

  useEffect(() => {
    if (!gridContainerRef.current) return;
    const width = gridContainerRef.current.offsetWidth;
    const columns = width < 400 ? 1 : 2;
    setGridProps({ width, columns });
  }, [windowSize.width]);
  return (
    <div className={`text-white ${props?.className}`}>
      <div className="h-full w-full min-h-[300px] p-2 flex flex-col flex-nowrap">
        <div className="flex-[0_0_auto] flex flex-col gap-1 mb-2">
          <input
            className="box-border flex-[0_0_50px] px-4 bg-app-input-bg text-xl font-normal rounded drop-shadow-md focus:outline-2 focus:outline-app-input-border focus:outline focus:outline-offset-1 disabled:bg-app-input-disabled placeholder:italic placeholder:font-thin"
            type="text"
            name="GIPHY searchbar"
            placeholder="Search on GIPHY..."
            onChange={(e) => {
              debouncer(() => setSearchValue(e.target.value));
            }}
            disabled={!props.isActive || isGifCurrentlyFetched}
          />
          <GiphySuggestionBar
            className="flex-[0_0_20px] overflow-hidden text-app-input-bg"
            searchValue={searchValue}
            setSuggestionCallback={setSuggestedValue}
            isActive={props.isActive && !isGifCurrentlyFetched}
          />
        </div>
        <div
          ref={gridContainerRef}
          className="relative flex-1 rounded overflow-x-hidden overflow-y-auto"
        >
          {/* giphy grid is heavy and kinda "meh" but since this page is
           * lazy loaded (and also bc it exists) i'm using it but a hand-made
           * grid would be better for this usage */}
          {props.isActive ? (
            <Grid
              className="h-full"
              key={suggestedValue || searchValue}
              width={gridProps.width}
              columns={gridProps.columns}
              noResultsMessage={
                <AppModalsCriticalError
                  error={`No results for "${suggestedValue || searchValue}"`}
                />
              }
              fetchGifs={
                suggestedValue || searchValue
                  ? searchFetchGifs(suggestedValue || searchValue)
                  : noSearchFetchGifs
              }
              noLink={true}
              hideAttribution={true}
              onGifClick={
                isGifCurrentlyFetched
                  ? () => undefined
                  : (gif, e) =>
                      setCurrentGif({
                        gifData: gif,
                        gifElement: e.currentTarget as HTMLElement,
                      })
              }
            />
          ) : (
            <div className="absolute w-full h-full top-0 left-0 bg-app-input-disabled"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InjectFromGiphy;
