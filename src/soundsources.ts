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
import synthbas6 from "./sound/2 synthbas/6.mp3"
import synthbas7 from "./sound/2 synthbas/7.mp3"
import synthbas8 from "./sound/2 synthbas/8.mp3"
import synthbas9 from "./sound/2 synthbas/9.mp3"
import synthbas10 from "./sound/2 synthbas/10.mp3"
import synthbas11 from "./sound/2 synthbas/11.mp3"
import synthbas12 from "./sound/2 synthbas/12.mp3"
import synthbas13 from "./sound/2 synthbas/13.mp3"
import synthbas14 from "./sound/2 synthbas/14.mp3"


import synthpad1 from "./sound/3 synthpad/1.mp3"
import synthpad2 from "./sound/3 synthpad/2.mp3"
import synthpad3 from "./sound/3 synthpad/3.mp3"
import synthpad4 from "./sound/3 synthpad/4.mp3"
import synthpad5 from "./sound/3 synthpad/5.mp3"
import synthpad6 from "./sound/3 synthpad/6.mp3"
import synthpad7 from "./sound/3 synthpad/7.mp3"
import synthpad8 from "./sound/3 synthpad/8.mp3"
import synthpad9 from "./sound/3 synthpad/9.mp3"
import synthpad10 from "./sound/3 synthpad/10.mp3"
import synthpad11 from "./sound/3 synthpad/11.mp3"
import synthpad12 from "./sound/3 synthpad/12.mp3"
import synthpad13 from "./sound/3 synthpad/13.mp3"
import synthpad14 from "./sound/3 synthpad/14.mp3"

import kalimba1 from "./sound/4 kalimba/1.mp3"
import kalimba2 from "./sound/4 kalimba/2.mp3"
import kalimba3 from "./sound/4 kalimba/3.mp3"
import kalimba4 from "./sound/4 kalimba/4.mp3"
import kalimba5 from "./sound/4 kalimba/5.mp3"
import kalimba6 from "./sound/4 kalimba/6.mp3"
import kalimba7 from "./sound/4 kalimba/7.mp3"
import kalimba8 from "./sound/4 kalimba/8.mp3"
import kalimba9 from "./sound/4 kalimba/9.mp3"
import kalimba10 from "./sound/4 kalimba/10.mp3"
import kalimba11 from "./sound/4 kalimba/11.mp3"
import kalimba12 from "./sound/4 kalimba/12.mp3"
import kalimba13 from "./sound/4 kalimba/13.mp3"
import kalimba14 from "./sound/4 kalimba/14.mp3"
import kalimba15 from "./sound/4 kalimba/15.mp3"
import kalimba16 from "./sound/4 kalimba/16.mp3"


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
      { sampleSource: synthbas3, chords: ["A"] },
      { sampleSource: synthbas4, chords: ["A"] },
      { sampleSource: synthbas5, chords: ["B"] },
      { sampleSource: synthbas6, chords: ["B"] },
      { sampleSource: synthbas7, chords: ["C"] },
      { sampleSource: synthbas8, chords: ["C"] },
      { sampleSource: synthbas9, chords: ["D"] },
      { sampleSource: synthbas10, chords: ["D"] },
      { sampleSource: synthbas11, chords: ["E"] },
      { sampleSource: synthbas12, chords: ["E"] },
      { sampleSource: synthbas13, chords: ["F"] },
      { sampleSource: synthbas14, chords: ["D"] },
    ],
    sounds: [] as any,
    nextSoundTimer: 1,
    fadeOutTime: 70,
    baseVolume: 1,
    currentVolume: 1,
    maxSampleLength: 10000,
    minSampleLength: 300,
    currentSoundIndex : 0,
    nextSoundIndex : 0,
  },
  {
    sampleLoader: [
      { sampleSource: synthpad1, chords: ['G','E','C'] },
      { sampleSource: synthpad2, chords: ['B','D','G','E','C'] },
      { sampleSource: synthpad3, chords: ['D','A','B'] },
      { sampleSource: synthpad4, chords: ['B','C','E','G'] },
      { sampleSource: synthpad5, chords: ['A','C'] },
      { sampleSource: synthpad6, chords: ['G'] },
      { sampleSource: synthpad7, chords: ['G','E'] },
      { sampleSource: synthpad8, chords: ['G','E','C'] },
      { sampleSource: synthpad9, chords: ['A','D'] },
      { sampleSource: synthpad10, chords: ['G','E'] },
      { sampleSource: synthpad11, chords: ['E'] },
      { sampleSource: synthpad12, chords: ['C','A'] },
      { sampleSource: synthpad13, chords: ['G','B'] },
      { sampleSource: synthpad14, chords: ['E','B','G','D'] },
    ],
    sounds: [] as any,
    nextSoundTimer: 1,
    fadeOutTime: 500,
    baseVolume: 0.5,
    currentVolume: 1,
    maxSampleLength: 10000,
    minSampleLength: 1000,
    currentSoundIndex : 0,
    nextSoundIndex : 0,
  },
  {
    sampleLoader: [
      { sampleSource: kalimba1, chords: ['G','E','C','A','D'] },
      { sampleSource: kalimba2, chords: ['B','D'] },
      { sampleSource: kalimba3, chords: ['D','G','B','E','A','C'] },
      { sampleSource: kalimba4, chords: ['C','E','G'] },
      { sampleSource: kalimba5, chords: ['D','G','B','E','A','C'] },
      { sampleSource: kalimba6, chords: ['A','D','C'] },
      { sampleSource: kalimba7, chords: ['B','D','G'] },
      { sampleSource: kalimba8, chords: ['D','G','B','E','A','C'] },
      { sampleSource: kalimba9, chords: ['D','G','B','E','A','C'] },
      { sampleSource: kalimba10, chords: ['A','C'] },
      { sampleSource: kalimba11, chords: ['A','C','E'] },
      { sampleSource: kalimba12, chords: ['D','G','B','E','C'] },
      { sampleSource: kalimba13, chords: ['A','C','E'] },
      { sampleSource: kalimba14, chords: ['G','C','E'] },
      { sampleSource: kalimba15, chords: ['A','C'] }, 
    ],
    sounds: [] as any,
    nextSoundTimer: 1,
    fadeOutTime: 40,
    baseVolume: 0.6,
    currentVolume: 1,
    maxSampleLength: 10000,
    minSampleLength: 300,
    currentSoundIndex : 0,
    nextSoundIndex : 0,
  },
];