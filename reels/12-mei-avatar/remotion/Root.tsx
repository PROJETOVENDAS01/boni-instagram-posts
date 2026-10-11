import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './Reel';
import {Pro} from './Pro';
export const FPS = 25;
export const DUR = 485;
export const Root: React.FC = () => (
  <>
    {(['A', 'B', 'C'] as const).map((v) => (
      <Composition key={v} id={v} component={Reel} durationInFrames={DUR} fps={FPS} width={1080} height={1920} defaultProps={{variant: v}} />
    ))}
    <Composition id="PRO" component={Pro} durationInFrames={DUR} fps={FPS} width={1080} height={1920} />
  </>
);
