import gsap from 'gsap';
import type { Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useState } from 'react';

import type { IBasicPropsInterface } from '../interfaces/BasicPropsInterface';
import useIsomorphicLayoutEffect from '../useIsomorphicLayoutEffect';

/* transition manager code by John Polacek
 * (https://github.com/johnpolacek/TweenPages) 🙌
 */

type ITransitionContextValues = {
  timeline?: gsap.core.Timeline;
  setTimeline?: Dispatch<SetStateAction<gsap.core.Timeline>>;
};

/* the context used to get the timeline for setup the outro */
const TransitionContext = createContext<ITransitionContextValues>({});

/* the provider used with the context */
const TransitionProvider = (props: { children: any }) => {
  const [timeline, setTimeline] = useState<gsap.core.Timeline>(
    gsap.timeline({ paused: true })
  );

  return (
    <TransitionContext.Provider
      value={{
        timeline,
        setTimeline,
      }}
    >
      {props.children}
    </TransitionContext.Provider>
  );
};

/* the transition layout serves the new page by executing the outro transition stacked in the context timeline if there is */
const TransitionLayout = (props: IBasicPropsInterface) => {
  const [displayChildren, setDisplayChildren] = useState(props.children);
  const timeline = useContext(TransitionContext).timeline as gsap.core.Timeline;

  useIsomorphicLayoutEffect(() => {
    if (props.children !== displayChildren) {
      if (timeline.duration() === 0) {
        // there are no outro animations, so immediately transition
        setDisplayChildren(props.children);
      } else {
        timeline.play().then(() => {
          // outro complete so reset to an empty paused timeline
          timeline.clear(true).pause(0);
          setDisplayChildren(props.children);
        });
      }
    }
  }, [props.children]);

  return (
    <div className={'bg-slate-900'} id={'main-display-div'}>
      {displayChildren}
    </div>
  );
};

export { TransitionContext, TransitionLayout, TransitionProvider };
