import { useEffect, useState } from 'react';

import type { IStylePropsInterface } from '@/utils/interfaces/BasicPropsInterface';

type IStorageData = {
  raw: StorageEstimate;
  totalStorageFormat: string;
  usageFormat: string;
  indexedDbUsageFormat?: string;
};

function formatByteSize(bytes: number) {
  if (bytes < 1000) return `${bytes}B`;
  if (bytes / 1000 < 1000) return `${Math.round((bytes / 1000) * 10) / 10}kB`;
  return `${Math.round(bytes / 1000000)}MB`;
}

const StorageViewer = (props: IStylePropsInterface) => {
  const [data, setData] = useState<IStorageData | null | undefined>(undefined);
  useEffect(() => {
    if (!navigator.storage.estimate) {
      /* null = error */
      setData(null);
      return;
    }
    /* gets storage data */
    navigator.storage
      .estimate()
      .then((raw) => {
        if (!raw.quota || !raw.usage) {
          setData(null);
          return;
        }
        const indexedDbRaw = (raw as any).usageDetails?.indexedDB;
        setData({
          raw,
          totalStorageFormat: formatByteSize(raw.quota),
          usageFormat: formatByteSize(raw.usage),
          indexedDbUsageFormat: indexedDbRaw
            ? formatByteSize(indexedDbRaw)
            : undefined,
        });
      })
      .catch(() => setData(null));
  }, []);
  return (
    <div className={`${props.className} flex flex-col`}>
      <div className="flex flex-nowrap items-end">
        <h5 className="text-gray-400 text-sm w-0 flex-1 overflow-hidden whitespace-nowrap text-ellipsis">
          Storage used:
        </h5>
        {data && (
          <h6 className="shrink-0 text-xs">{`${data.usageFormat}/${data.totalStorageFormat} used`}</h6>
        )}
      </div>
      <div
        title="Storage visualizer"
        className="h-2 bg-gray-600 rounded-full overflow-hidden flex flex-nowrap"
      >
        {data && (
          <>
            {!data.indexedDbUsageFormat && (
              <div
                className="flex items-center bg-zinc-700 shrink-0"
                style={{
                  width: `${Math.round(
                    (data.raw.usage! / data.raw.quota!) * 100
                  )}%`,
                }}
              ></div>
            )}
            {data.indexedDbUsageFormat && (
              <div
                className="flex items-center bg-blue-600 shrink-0"
                style={{
                  width: `${Math.round(
                    ((data.raw as any).usageDetails.indexedDb /
                      data.raw.quota!) *
                      100
                  )}%`,
                }}
              ></div>
            )}
          </>
        )}
      </div>
      {data && (
        <div
          title="Storage visualizer captions"
          className="flex justify-center overflow-hidden px-2 gap-1"
        >
          {!data.indexedDbUsageFormat && (
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 bg-zinc-700 outline outline-1 outline-offset-2 outline-gray-600"></div>
              <span className="text-xs">Used storage ({data.usageFormat})</span>
            </div>
          )}
          {data.indexedDbUsageFormat && (
            <div className="flex items-center">
              <div className="mr-2 h-2 w-2 bg-blue-600 outline outline-1 outline-offset-2 outline-gray-600"></div>
              <span className="text-xs">
                Songs + assets ({data.indexedDbUsageFormat})
              </span>
            </div>
          )}
        </div>
      )}
      {data === null && (
        <p className="text-red-600 text-xs w-full text-center">
          {"The data visualisation isn't available with your configuration"}
        </p>
      )}
    </div>
  );
};

export default StorageViewer;
