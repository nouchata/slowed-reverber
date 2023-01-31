import { useCallback, useEffect, useState } from 'react';

type ILocalStorageValues = {
  showStaticCanvas: boolean;
  backgroundColor: 'black' | 'slate';
};

const defaultLocalStorageValues: ILocalStorageValues = {
  showStaticCanvas: true,
  backgroundColor: 'slate',
};

const useLocalStorage = (): [
  ILocalStorageValues,
  (newValues: Partial<ILocalStorageValues>) => void
] => {
  const [values, setValues] = useState<ILocalStorageValues>(
    (typeof window !== 'undefined' &&
      JSON.parse(localStorage.getItem('srConfig') || 'null')) ||
      defaultLocalStorageValues
  );
  /* update values and update localStorage */
  const changeValues = useCallback(
    (newValues: Partial<ILocalStorageValues>) => {
      const combinedValues = { ...values };
      Object.assign(combinedValues, newValues);
      if (typeof window !== 'undefined') {
        localStorage.setItem('srConfig', JSON.stringify(combinedValues));
        window.dispatchEvent(new Event('storage'));
      }
    },
    [values]
  );

  useEffect(() => {
    /* event callback */
    const updateValuesStateCallback = () => {
      if (typeof window !== 'undefined')
        setValues(
          JSON.parse(localStorage.getItem('srConfig') || 'null') ||
            defaultLocalStorageValues
        );
    };
    /* event to update other useLocalStorage instances */
    window.addEventListener('storage', updateValuesStateCallback);
    return () =>
      window.removeEventListener('storage', updateValuesStateCallback);
  }, []);

  return [values, changeValues];
};

export default useLocalStorage;
