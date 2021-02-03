import piano1 from "./sound/1 piano/1.mp3"
import piano2 from "./sound/1 piano/2.mp3"
import piano3 from "./sound/1 piano/3.mp3"
import piano4 from "./sound/1 piano/4.mp3"
import piano5 from "./sound/1 piano/5.mp3"
import piano6 from "./sound/1 piano/6.mp3"
import piano7 from "./sound/1 piano/7.mp3"
import piano8 from "./sound/1 piano/8.mp3"
import piano9 from "./sound/1 piano/9.mp3"
import piano10 from "./sound/1 piano/10.mp3"
import piano11 from "./sound/1 piano/11.mp3"
import piano12 from "./sound/1 piano/12.mp3"
import piano13 from "./sound/1 piano/13.mp3"
import piano14 from "./sound/1 piano/14.mp3"
import piano15 from "./sound/1 piano/15.mp3"
import piano16 from "./sound/1 piano/16.mp3"
import piano17 from "./sound/1 piano/17.mp3"
import piano18 from "./sound/1 piano/18.mp3"
import piano19 from "./sound/1 piano/19.mp3"
import piano20 from "./sound/1 piano/20.mp3"

import synthbas1 from "./sound/2 synthbas/1.mp3"
import synthbas2 from "./sound/2 synthbas/2.mp3"
import synthbas3 from "./sound/2 synthbas/3.mp3"
import synthbas4 from "./sound/2 synthbas/4.mp3"
import synthbas5 from "./sound/2 synthbas/5.mp3"

import synthpad1 from "./sound/3 synthpad/1.mp3"
import synthpad2 from "./sound/3 synthpad/2.mp3"
import synthpad3 from "./sound/3 synthpad/3.mp3"
import synthpad4 from "./sound/3 synthpad/4.mp3"

export const soundSources = [
  {
    sampleLoader: [
      { sampleSource: piano1, chords: ['G','E','C'] },
      { sampleSource: piano2, chords: ['B','D','G','E'] },
      { sampleSource: piano3, chords: ['D','G','B'] },
      { sampleSource: piano4, chords: ['A','C','D','G'] },
      { sampleSource: piano5, chords: ['A','C'] },
      { sampleSource: piano6, chords: ['A','D','C'] },
      { sampleSource: piano7, chords: ['C','A'] },
      { sampleSource: piano8, chords: ['A'] },
      { sampleSource: piano9, chords: ['A','C'] },
      { sampleSource: piano10, chords: ['A','C'] },
      { sampleSource: piano11, chords: ['C','G','E'] },
      { sampleSource: piano12, chords: ['B'] },
      { sampleSource: piano13, chords: ['D','B'] },
      { sampleSource: piano14, chords: ['E'] },
      { sampleSource: piano15, chords: ['G'] },
      { sampleSource: piano16, chords: ['A'] },
      { sampleSource: piano17, chords: ['D'] },
      { sampleSource: piano18, chords: ['E'] },
      { sampleSource: piano19, chords: ['G'] },
      { sampleSource: piano20, chords: ['D','A','B'] },
    ],
    sounds: [] as any,
    soundPlaying: 1 as 1 | 2,
    nextSoundTimer: 1,
    fadeOutTime: 40,
    baseVolume: 1,
    currentVolume: 1,
    maxSampleLength: 10000,
    minSampleLength: 300,
    currentSoundIndex : 0,
    nextSoundIndex : 0,
  },
  {
    sampleLoader: [  
      { sampleSource: synthbas1, chords: ["G"] },
      { sampleSource: synthbas2, chords: ["G"] },
      { sampleSource: synthbas3, chords: ["G"] },
      { sampleSource: synthbas4, chords: ["G"] },
      { sampleSource: synthbas5, chords: ["G"] },
    ],
    sounds: [] as any,
    soundPlaying: 1 as 1 | 2,
    nextSoundTimer: 1,
    fadeOutTime: 70,
    baseVolume: 1,
    currentVolume: 1,
    maxSampleLength: 10000,
    minSampleLength: 1000,
    currentSoundIndex : 0,
    nextSoundIndex : 0,
  },
  {
    sampleLoader: [
      { sampleSource: synthpad1, chords: ["G"] },
      { sampleSource: synthpad2, chords: ["G"] },
      { sampleSource: synthpad3, chords: ["G"] },
      { sampleSource: synthpad4, chords: ["G"] },
    ],
    sounds: [] as any,
    soundPlaying: 1 as 1 | 2,
    nextSoundTimer: 1,
    fadeOutTime: 500,
    baseVolume: 1,
    currentVolume: 1,
    maxSampleLength: 10000,
    minSampleLength: 1000,
    currentSoundIndex : 0,
    nextSoundIndex : 0,
  },
];