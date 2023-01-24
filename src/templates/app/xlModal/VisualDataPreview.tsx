import { useMemo } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

const VisualDataPreview = (
  props: IStylePropsInterface & { blob?: Blob; isActive: boolean }
) => {
  const blobUrlRef = useMemo(() => {
    if (props.blob) return URL.createObjectURL(props.blob);
    return '';
  }, [props.blob]);
  return (
    <div className={props.className}>
      {props.blob?.type.includes('image') && (
        <img
          alt="Visual source preview"
          className="w-full h-full object-cover rounded"
          src={blobUrlRef}
        />
      )}
      {props.blob?.type.includes('video') && (
        <video
          about="Visual source preview"
          controls={false}
          muted={true}
          autoPlay={true}
          loop={true}
          className="w-full h-full object-cover rounded"
          src={blobUrlRef}
        />
      )}
      {!props.blob && (
        <svg
          /* cross svg */
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-50 w-full h-full"
          aria-labelledby="title"
        >
          <title>No media available</title>
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      )}
    </div>
  );
};

export default VisualDataPreview;
