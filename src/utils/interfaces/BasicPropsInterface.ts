import type { CSSProperties } from 'react';

export type IStylePropsInterface = {
  style?: CSSProperties;
  className?: string;
};

export type IBasicPropsInterface = {
  children?: any;
} & IStylePropsInterface;
