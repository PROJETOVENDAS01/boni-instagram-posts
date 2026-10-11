import React from 'react';
import {Composition} from 'remotion';
import {Reel} from './Reel';
import {Pro} from './Pro';
import {Prev} from './Prev';
import {Apres} from './Apres';
export const FPS = 25;
export const DUR = 485;
export const Root: React.FC = () => (
  <>
    {(['A', 'B', 'C'] as const).map((v) => (
      <Composition key={v} id={v} component={Reel} durationInFrames={DUR} fps={FPS} width={1080} height={1920} defaultProps={{variant: v}} />
    ))}
    <Composition id="PRO" component={Pro} durationInFrames={DUR} fps={FPS} width={1080} height={1920} />
    <Composition id="PREV" component={Prev} durationInFrames={525} fps={FPS} width={1080} height={1920} />
    <Composition id="APRES" component={Apres} durationInFrames={725} fps={FPS} width={1080} height={1920} />
  </>
);
