import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

const GiphySuggestionBar = (
  props: IStylePropsInterface & {
    searchValue: string;
    setSuggestionCallback: Dispatch<SetStateAction<string>>;
    isActive: boolean;
  }
) => {
  const [suggestions, setSuggestions] = useState<Array<string>>([]);
  const [currentSuggestion, setCurrentSuggestion] = useState('');

  const ulRef = useRef<HTMLUListElement & { currentScrollValue: number }>(null);

  useEffect(() => {
    props.setSuggestionCallback('');
    setSuggestions([]);
    if (ulRef.current) ulRef.current.currentScrollValue = 0;
    /* exits if not active */
    if (!props.isActive) return () => undefined;
    /* used to cancel the fetch if the component exits before it ends */
    let controller: AbortController | undefined = AbortController
      ? new AbortController()
      : undefined;
    /* we're getting either the trending suggestions or the ones related to
     * the searchValue */
    const url = `https://api.giphy.com/v1/${
      props.searchValue
        ? `tags/related/${encodeURI(props.searchValue)}`
        : `trending/searches`
    }?api_key=sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh`;

    fetch(url, { signal: controller?.signal })
      .then((response) => {
        response.blob().then((value) =>
          value.text().then((text) => {
            let data: Array<any> = JSON.parse(text).data || [];
            /* the trending fetch data returns an array of string but the
             * searchValue one returns an array of object so we need to
             * extract the datas we want (the name strings) from it if we're
             * in that case */
            if (props.searchValue) data = data.map((item) => item.name);
            setSuggestions(data);
          })
        );
      })
      .catch(() => undefined)
      .finally(() => {
        controller = undefined;
      });

    return () => controller?.abort();
  }, [props.searchValue, props.isActive]);
  return (
    <div
      id="make-video-modal-suggestion-bar"
      className={`${props.className} relative`}
    >
      <ul
        ref={ulRef}
        className={`w-full h-full overflow-hidden flex flex-nowrap text-sm px-7 rounded${
          !suggestions.length ? ' bg-app-input-bg animate-pulse' : ''
        } brightness-200`}
      >
        {suggestions.map((value, index) => {
          return (
            <li
              key={value + index}
              className={`flex-[0_0_120px] box-content break-keep whitespace-nowrap text-ellipsis overflow-hidden cursor-pointer text-center hover:font-bold${
                value === currentSuggestion ? ' font-bold' : ''
              }`}
              onClick={() => {
                setCurrentSuggestion(value);
                props.setSuggestionCallback(value);
              }}
            >
              {value}
            </li>
          );
        })}
      </ul>
      <button
        title="Scroll left"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='19' y1='12' x2='5' y2='12'%3E%3C/line%3E%3Cpolyline points='12 19 5 12 12 5'%3E%3C/polyline%3E%3C/svg%3E")`,
          visibility: suggestions.length ? 'visible' : 'hidden',
        }}
        className="absolute left-0 top-0 h-full w-7 bg-app-modal-xl-background bg-contain bg-no-repeat bg-center"
        onClick={() => {
          if (!ulRef.current) return;
          /* scroll handling */
          ulRef.current.currentScrollValue -= ulRef.current.offsetWidth * 0.75;
          if (ulRef.current.currentScrollValue < 0)
            ulRef.current.currentScrollValue = 0;
          ulRef.current.scroll({
            top: 0,
            left: ulRef.current.currentScrollValue,
            behavior: 'smooth',
          });
        }}
      ></button>
      <button
        title="Scroll right"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cline x1='5' y1='12' x2='19' y2='12'%3E%3C/line%3E%3Cpolyline points='12 5 19 12 12 19'%3E%3C/polyline%3E%3C/svg%3E")`,
          visibility: suggestions.length ? 'visible' : 'hidden',
        }}
        className="absolute right-0 top-0 h-full w-7 bg-app-modal-xl-background bg-contain bg-no-repeat bg-center"
        onClick={() => {
          if (!ulRef.current) return;
          /* scroll handling
           * this one needs to base his calculation with scrollWidth and offsetWidth to
           * prevent scroll overflow */
          ulRef.current.currentScrollValue += ulRef.current.offsetWidth * 0.75;
          if (
            ulRef.current.currentScrollValue >
            ulRef.current.scrollWidth - ulRef.current.offsetWidth
          )
            ulRef.current.currentScrollValue =
              ulRef.current.scrollWidth - ulRef.current.offsetWidth;
          ulRef.current?.scroll({
            top: 0,
            left: ulRef.current.currentScrollValue,
            behavior: 'smooth',
          });
        }}
      ></button>
    </div>
  );
};

export default GiphySuggestionBar;
