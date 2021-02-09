import { Howl } from "howler"
import { soundSources } from "./soundsources"
import { keys } from "./App"

const chordOptions = ["G","A","B","C","D","E"];

const maxSoundsInSequence = 10
const minSoundsInSequence = 1
const freeBPM = 10;
const freeBPMRandomness = 10
const sequenceLength = 32

window.onload = () => {
  masterSeq.playing = true;
  masterSeq.restart();
}

class MasterSeq {
  bpm: number;
  startOfSequence: number;
  currentSequencePos: number;
  nextSequencePos: number;
  currentChord: string;
  barsPlayed: number;
  playing: boolean;

  constructor() {
    this.bpm = 0;
    this.startOfSequence = performance.now();
    this.currentSequencePos = 0;
    this.nextSequencePos = 0;
    this.currentChord = "";
    this.barsPlayed = 0;
    this.playing = false;
  }

  advanceSequence() {
    if (this.playing) {
      this.calcSequencePos();
      if (this.currentSequencePos >= 32) {
        this.barsPlayed++;
        if (this.barsPlayed % 2 === 0){
          newRandomChord();
        }
        this.restart();
      }

      if (this.currentSequencePos === this.nextSequencePos) {
        soundSources.forEach((track: any) => {
          if (track.kind === "inst" || track.kind === "drum")
          track.sequencer.playCurrentSequencePos();
        });

        this.nextSequencePos++;
      }
    }
  }

  calcSequencePos() {
    let sixteenth = (60 / this.bpm / 4) * 1000;
    let timePassed = performance.now() - this.startOfSequence;
    this.currentSequencePos = Math.floor(timePassed / sixteenth);
  }

  restart() {
    this.startOfSequence = performance.now();
    this.currentSequencePos = 0;
    this.nextSequencePos = 0;
  }
}
const masterSeq = new MasterSeq


class Sequencer {
  disabled: boolean;
  sounds: any[];
  currentSequence: number[];
  currentSoundIndex: number;
  activity: number;
  noteAmt: number;
  patterns: any;
  tonal : boolean;
  maxSoundsInSequence: number;
  minSoundsInSequence: number;

  constructor(
    sounds: any[],
    activity: number,
    disabled: boolean,
    patterns: any,
    tonal: boolean,
    maxSoundsInSequence: number,
    minSoundsInSequence: number,
  ) {
    this.sounds = sounds;
    this.disabled = disabled;
    this.currentSequence = [];
    this.activity = activity;
    this.noteAmt = 0;
    this.patterns = patterns;
    this.tonal = tonal;
    this.currentSoundIndex = 0;
    this.maxSoundsInSequence = maxSoundsInSequence
    this.minSoundsInSequence = minSoundsInSequence

    this.build();
  }

  calcAmountOfNotes() {
    this.noteAmt =
      this.minSoundsInSequence +
      Math.floor((this.activity / 100) * this.maxSoundsInSequence);
  }

  build() {
    if (this.patterns) {
      this.currentSequence = this.patterns[
        Math.floor(Math.random() * this.patterns.length)
      ];
    } else {
      this.calcAmountOfNotes();
      this.currentSequence = [];
      let possibleIndexes = [];
      for (let i = 0; i < sequenceLength; i++) {
        this.currentSequence.push(NaN);
        possibleIndexes.push(i);
      }
      for (let i = 0; i < this.noteAmt; i++) {
        let newSeqIndex =
          possibleIndexes[Math.floor(Math.random() * sequenceLength)];
        let newSoundIndex = getNextSoundIndex(this.sounds, masterSeq.currentChord);
        this.currentSequence[newSeqIndex] = newSoundIndex;
        possibleIndexes.splice(newSeqIndex, 1);
      }
    }
  }

  playCurrentSequencePos(){
      if (!isNaN(this.currentSequence[masterSeq.currentSequencePos])) {
        //this.sounds[this.currentSoundIndex].howl.stop();
        if (!this.disabled) {
          this.sounds[this.currentSequence[masterSeq.currentSequencePos]].howl.play();
          this.currentSoundIndex = this.currentSequence[masterSeq.currentSequencePos];
        }
      }  
  }

  mutate() {}

  updateChords() {
    if (this.tonal) {
      this.currentSequence.forEach((seqItem: number, seqIndex: number) => {
        if (!isNaN(seqItem)) {
          if (!this.sounds[seqItem].chords.includes(masterSeq.currentChord)) {
            this.currentSequence[seqIndex] = getNextSoundIndex(
              this.sounds,
              masterSeq.currentChord
            );
          }
        }
      });
    }
  }

  updateActivity(){
    this.calcAmountOfNotes();
    let currentSequenceNoteIndices : number[] = [];
    let currentSequenceEmptyIndices : number[] = [];
    let editIndex : number;
    let noteDifference : number;

    this.currentSequence.forEach((seqItem : number, index: number) => {
        if (!isNaN(seqItem)){
            currentSequenceNoteIndices.push(index)
        }   else {
            currentSequenceEmptyIndices.push(index)
        }
    })

    noteDifference = this.noteAmt - currentSequenceNoteIndices.length
    if (noteDifference < 0){
        for (let i = 0; i > noteDifference; i--){
            editIndex = Math.floor(Math.random() * currentSequenceNoteIndices.length);
            this.currentSequence[currentSequenceNoteIndices[editIndex]] = NaN;
            currentSequenceNoteIndices.splice(editIndex, 1)
        }
    } else if (noteDifference > 0){
        for (let i = 0; i < noteDifference; i++){
            editIndex = Math.floor(Math.random() * currentSequenceEmptyIndices.length);
            this.currentSequence[currentSequenceEmptyIndices[editIndex]] = getNextSoundIndex(this.sounds, masterSeq.currentChord);
            currentSequenceEmptyIndices.splice(editIndex, 1)
        }
    }
  }
}

class Sound {
  howl: any;
  chords: any;

  constructor(url: string, baseVolume: number, chords: Array<string>) {
    this.howl = new Howl({
      src: [url],
      volume: baseVolume,
    });
    this.chords = chords;
  }
}

/*  for each track, initsoundPlayer loads every sample into a new howl, 
    together with the chords that particular sound can be played on it.
    All these sounds are then pushed into a sequencer object, which controls the playback
    
    soundSources [
        sequencer :
            sounds: [{
                howl: *ACTUAL SOUND*
                chords ["Array of chords it can be played on"]
            ]}
    ]  
*/

export function initSoundPlayer(state: any) {
  masterSeq.bpm = state.bpm;
  masterSeq.currentChord = state.currentChord;

  soundSources.forEach((track: any, index: number) => {
    let soundsArr: any[] = [];
    switch (track.kind) {
      case "inst":
        track.sampleLoader.forEach((sample: any) => {
          soundsArr.push(
            new Sound(sample.sampleSource, track.baseVolume, sample.chords)
          );
        });
        track.sequencer = new Sequencer(
          soundsArr,
          state[keys.actKey + index],
          state[keys.disabledKey + index],
          false,
          true,
          track.maxSoundsInSequence,
          track.minSoundsInSequence
        );
        break;

      case "drum":
        track.sampleLoader.forEach((sample: any) => {
          soundsArr.push(
            new Sound(sample.sampleSource, track.baseVolume, sample.chords)
          );
        });
        track.sequencer = new Sequencer(
          soundsArr,
          100,
          state[keys.disabledKey + index].disabled,
          track.patterns,
          false,
          track.maxSoundsInSequence,
          track.minSoundsInSequence
        );
        break;
    }
  });
}


export function updateSoundPlayer() {
  masterSeq.advanceSequence();
  return (masterSeq.currentChord);
}

export function setTrackVolume(volume: number, index: number) {
  soundSources[index].currentVolume = volume / 100;
  soundSources[index].sequencer.sounds.forEach((sound: any) => {
    sound.howl.volume(
      soundSources[index].currentVolume * soundSources[index].baseVolume
    );
  });
}

export function updateTrackActivity(activity: number, index: number) {
  soundSources[index].sequencer.activity = activity;
  soundSources[index].sequencer.updateActivity();
}

export function setTrackDisable(disabled : boolean, index: number) {
  soundSources[index].sequencer.disabled = disabled;
  if (disabled) {
    stopAllSounds(index);
  }
}

function stopAllSounds(index: number) {
  soundSources[index].sequencer.sounds.forEach((sound: any) => {
    sound.howl.stop();
  });
}

function getRandomIntButNotThisOne(range: number, current: number) {
  let out = Math.floor(Math.random() * range);
  if (out === current) {
    out = getRandomIntButNotThisOne(range, out);
  }
  return out;
}

function getNextSoundIndex(sounds: object[], currentChord: string) {
  let newSoundIndex: number;
  let newSoundOptions: number[] = [];
  sounds.forEach((sound: any, index: number) => {
    if (sound.chords.includes(currentChord)) {
      newSoundOptions.push(index);
    }
  });
  newSoundIndex =
    newSoundOptions[Math.floor(Math.random() * newSoundOptions.length)];

  return newSoundIndex;
}

export function toggleRhythmic(rhythmic: boolean, bpm: number) {
  if (rhythmic) {
    soundSources.forEach((track: any, index: any) => {
      track.sequencer.bpm = bpm;
      track.sequencer.build();
      track.sequencer.restart();
    });
  } else {
    soundSources.forEach((track: any, index: any) => {
      track.sequencer.bpm = freeBPM + Math.random() * freeBPMRandomness;
    });
  }
}

export function updateBPM(bpm: number, rhythmic: boolean) {
  let timePassed = performance.now() - masterSeq.startOfSequence;
  if (masterSeq.bpm !== bpm){
    let rhythmScale = masterSeq.bpm / bpm;
    masterSeq.startOfSequence = performance.now() - timePassed * rhythmScale;
    masterSeq.bpm = bpm;
  }
}

export function updateCurrentSequenceChords(currentChord: string) {
  masterSeq.currentChord = currentChord;
  soundSources.forEach((track: any, index: any) => {
    if (track.kind === "inst"){
      track.sequencer.updateChords();
    }
  });
}

function newRandomChord() {
  updateCurrentSequenceChords(chordOptions[Math.floor(Math.random() * 6)]);
}





