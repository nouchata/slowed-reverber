import { useEffect, useLayoutEffect } from 'react';

/* used to prevent warnings on next dev server */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
