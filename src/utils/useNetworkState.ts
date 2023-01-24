import { useEffect, useState } from 'react';

const useNetworkState = () => {
  const [isInternetAvailable, setIsInternetAvailable] = useState(
    window.navigator.onLine ?? true
  );

  useEffect(() => {
    const onlineCallback = () => setIsInternetAvailable(true);
    const offlineCallback = () => setIsInternetAvailable(false);

    window.addEventListener('online', onlineCallback);
    window.addEventListener('offline', offlineCallback);

    return () => {
      window.removeEventListener('online', onlineCallback);
      window.removeEventListener('offline', offlineCallback);
    };
  }, []);

  return isInternetAvailable;
};

export default useNetworkState;
