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

import strings1 from "./sound/5 strings/1.mp3"
import strings2 from "./sound/5 strings/2.mp3"
import strings3 from "./sound/5 strings/3.mp3"
import strings4 from "./sound/5 strings/4.mp3"
import strings5 from "./sound/5 strings/5.mp3"
import strings6 from "./sound/5 strings/6.mp3"
import strings7 from "./sound/5 strings/7.mp3"
import strings8 from "./sound/5 strings/8.mp3"
import strings9 from "./sound/5 strings/9.mp3"
import strings10 from "./sound/5 strings/10.mp3"
import strings11 from "./sound/5 strings/11.mp3"
import strings12 from "./sound/5 strings/12.mp3"
import strings13 from "./sound/5 strings/13.mp3"
import strings14 from "./sound/5 strings/14.mp3"
import strings15 from "./sound/5 strings/15.mp3"
import strings16 from "./sound/5 strings/16.mp3"
import strings17 from "./sound/5 strings/17.mp3"

import kick from "./sound/drums/kick.mp3"
import snare1 from "./sound/drums/snare1.mp3"
import snare2 from "./sound/drums/snare2.mp3"
import snare3 from "./sound/drums/snare3.mp3"

import rain from "./sound/fx/rain.mp3"
import vinyl from "./sound/fx/vinyl.mp3"
import forest from "./sound/fx/forest.mp3"

// shorten NaN for better sequencer pattern readability (see drumtracks below)
const N = NaN;

/* soundSources is the source of all non-user-accessible data. 
each array entry represents one 'track' or sound family, with the following properties:

-sampleLoader: object that holds the URL for every individual sample, together with the chords on which that sample can be played
-kind: inst, drum of fx - used to make different categories behave in different ways
-sequencer: soundPlayerInit creates an instance of the Sequencer class here, which holds all sounds (as Howls from howler.js)
  and the current sequence of the track.
-baseVolume: can be used to make an entire track louder or softer without having to re-export al samples
-currentVolume: current volume of the track
-currentSoundIndex: index of the current sound playing in sequencer.sounds
-maxSoundsInSequence: amount of sounds per sequence when track activity is 100
-minSoundsInSequence: amount of sounds per sequence when track activity is 1
-name: track name
-init** :stats with which the track will start - accessed in InitializeState
*/

export const soundSources : any = [
//INSTURMENTS////
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
    kind: "inst",
    sequencer : {},
    baseVolume: 0.8,
    maxSoundsInSequence: 8,
    minSoundsInSequence: 1,
    name: "Piano",
    initDisabled: false,
    initActivity: 20,
    initDrifting: true,
    initVolume: 100,
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
      { sampleSource: synthbas14, chords: ["F"] },
    ],
    kind: "inst",
    sequencer : {},
    baseVolume: 1,
    maxSoundsInSequence: 12,
    minSoundsInSequence: 1,
    name: "Bass",
    initDisabled: false,
    initActivity: 40,
    initDrifting: false,
    initVolume: 100,
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
    kind: "inst",
    sequencer : {},
    baseVolume: 0.5,
    maxSoundsInSequence: 5,
    minSoundsInSequence: 1,
    name: "Pad",
    initDisabled: false,
    initActivity: 40,
    initDrifting: false,
    initVolume: 50,
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
    kind: "inst",
    sequencer : {},
    baseVolume: 0.7,
    maxSoundsInSequence: 12,
    minSoundsInSequence: 1,
    name: "Kalimba",
    initDisabled: true,
    initActivity: 20,
    initDrifting: false,
    initVolume: 100,
  },
  {
    sampleLoader: [
      { sampleSource: strings1, chords: ['G','E'] },
      { sampleSource: strings2, chords: ['B','G'] },
      { sampleSource: strings3, chords: ['A','C'] },
      { sampleSource: strings4, chords: ['C','E'] },
      { sampleSource: strings5, chords: ['E','G'] },
      { sampleSource: strings6, chords: ['C'] },
      { sampleSource: strings7, chords: ['A','E'] },
      { sampleSource: strings8, chords: ['D','B'] },
      { sampleSource: strings9, chords: ['G','E','A','C'] },
      { sampleSource: strings10, chords: ['D','G','B'] },
      { sampleSource: strings11, chords: ['A','C','E'] },
      { sampleSource: strings12, chords: ['D','G','B','A'] },
      { sampleSource: strings13, chords: ['D','G','B','E','A','C'] },
      { sampleSource: strings14, chords: ['A','C','D'] },
      { sampleSource: strings15, chords: ['D','G','B'] }, 
      { sampleSource: strings16, chords: ['D','G','B','E','A','C'] }, 
      { sampleSource: strings17, chords: ['D','G','B'] }, 

    ],
    kind: "inst",
    sequencer : {},
    baseVolume: 0.3,
    maxSoundsInSequence: 3,
    minSoundsInSequence: 1,
    name: "Strings",
    initDisabled: true,
    initActivity: 20,
    initDrifting: false,
    initVolume: 50,
  },
  //DRUMS///
  {
    sampleLoader:[
      {sampleSource: kick}
    ],
    kind: "drum",
    patterns: [
    //|1           2           3           4          |1           2           3           4         |
      [0, N, N, N, N, N, N, N, N, N, N, N, N, N, 0, N, 0, N, N, N, N, N, N, N, N, N, N, N, N, N, N, N],
      [0, N, N, N, N, N, N, N, 0, N, N, N, N, N, 0, N, 0, N, N, N, N, N, N, N, 0, N, N, N, N, N, N, N],
      [0, N, N, N, 0, N, N, N, 0, N, N, N, 0, N, N, N, 0, N, N, N, 0, N, N, N, 0, N, N, N, 0, N, 0, N],
      [0, N, N, 0, 0, N, 0, N, 0, N, N, N, 0, N, 0, N, 0, N, N, N, 0, N, N, N, 0, N, N, 0, N, N, 0, N],
      ],
    baseVolume: 1,
    currentsequence : [],
    sequencer : {},
    maxSoundsInSequence: 12,
    minSoundsInSequence: 1,
    name: "Kick",
    initDisabled: false,
    initActivity: 20,
    initDrifting: false,
    initVolume: 100,
    initPattern: 2,
  },
  {
    sampleLoader:[
      {sampleSource: snare1},
      {sampleSource: snare2},
      {sampleSource: snare3},
    ],
    kind: "drum",
    patterns: [
    //|1           2           3           4          |1           2           3           4         |
      [N, N, N, N, N, N, N, N, 0, N, N, N, N, N, N, N, N, N, N, N, N, N, N, N, 0, N, N, N, N, N, N, N],
      [N, N, N, N, 0, N, N, N, N, N, N, N, 0, N, N, N, N, N, N, N, 0, N, N, N, N, N, N, N, 0, N, N, N],
      [N, N, N, 0, N, N, N, N, N, N, 0, N, N, N, N, N, N, 0, N, N, 0, N, N, N, 0, N, N, N, 0, N, N, N],
      ],
    baseVolume: 0.5,
    currentsequence : [],
    sequencer : {},
    maxSoundsInSequence: 12,
    minSoundsInSequence: 1,
    name: "Snare",
    initDisabled: false,
    initActivity: 20,
    initDrifting: false,
    initVolume: 100,
    initPattern: 1,
    },
//FX//////
  {
    sampleLoader: [{ sampleSource: vinyl }],
    baseVolume: 0.3,
    kind: "fx",
    name: "Vinyl",
    initDisabled: false,
    initActivity: 20,
    initDrifting: true,
    initVolume: 100,
  },
  {
    sampleLoader: [{ sampleSource: rain }],
    baseVolume: 0.07,
    kind: "fx",
    name: "Rain",
    initDisabled: false,
    initActivity: 20,
    initDrifting: true,
    initVolume: 40,
  },
  {
    sampleLoader: [{ sampleSource: forest }],
    baseVolume: 0.2,
    kind: "fx",
    name: "Forest",
    initDisabled: true,
    initActivity: 20,
    initDrifting: false,
    initVolume: 0,
  },
];