import type { Dispatch, SetStateAction } from 'react';

export enum EAppModalState {
  LOADING,
  ERROR,
  SUCCESS,
}

export type IAppModalPaneProps = {
  setNextCallback?: Dispatch<
    SetStateAction<(() => Promise<boolean>) | undefined>
  >;
  setPreviousCallback?: Dispatch<
    SetStateAction<(() => Promise<boolean>) | undefined>
  >;
  isActive: boolean;
};
