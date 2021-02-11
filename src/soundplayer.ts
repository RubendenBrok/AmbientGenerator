import { Howl, Howler } from "howler"
import { soundSources } from "./soundsources"
import { keys, seqLength } from "./App"
import { SSL_OP_NO_QUERY_MTU } from "constants";

const chordOptions = ["G","A","B","C","D","E"];

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
    currentChord: string
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

    this.build(currentChord);
  }

  calcAmountOfNotes() {
    this.noteAmt =
      this.minSoundsInSequence +
      Math.floor((this.activity / 100) * this.maxSoundsInSequence);
  }

  build(currentChord : string) {
    if (this.patterns) {

    } else {
      this.calcAmountOfNotes();
      this.currentSequence = [];
      let possibleIndexes = [];
      for (let i = 0; i < seqLength; i++) {
        this.currentSequence.push(NaN);
        possibleIndexes.push(i);
      }
      for (let i = 0; i < this.noteAmt; i++) {
        let newSeqIndex =
          possibleIndexes[Math.floor(Math.random() * seqLength)];
        let newSoundIndex = getNextSoundIndex(this.sounds, currentChord);
        this.currentSequence[newSeqIndex] = newSoundIndex;
        possibleIndexes.splice(newSeqIndex, 1);
      }
    }
  }

  playSeqPosition(position : number){
      if (!isNaN(this.currentSequence[position])) {
        //this.sounds[this.currentSoundIndex].howl.stop();
        if (!this.disabled) {
          this.sounds[this.currentSequence[position]].howl.play();
          this.currentSoundIndex = this.currentSequence[position];
        }
      }  
  }

  mutate() {}

  updateChords(currentChord : string) {
    if (this.tonal) {
      this.currentSequence.forEach((seqItem: number, seqIndex: number) => {
        if (!isNaN(seqItem)) {
          if (!this.sounds[seqItem].chords.includes(currentChord)) {
            this.currentSequence[seqIndex] = getNextSoundIndex(
              this.sounds,
              currentChord
            );
          }
        }
      });
    }
  }

  updateActivity(currentChord : string){
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
            this.currentSequence[currentSequenceEmptyIndices[editIndex]] = getNextSoundIndex(this.sounds, currentChord);
            currentSequenceEmptyIndices.splice(editIndex, 1)
        }
    }
  }
}

class Sound {
  howl: any;
  chords: any;

  constructor(url: string, baseVolume: number, initVolume: number, chords: string[]) {
    this.howl = new Howl({
      src: [url],
      volume: baseVolume * (initVolume / 100)
    })
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
  Howler.volume(2);

  soundSources.forEach((track: any, index: number) => {
    let soundsArr: any[] = [];
    switch (track.kind) {
      case "inst":
        track.sampleLoader.forEach((sample: any) => {
          soundsArr.push(
            new Sound(sample.sampleSource, track.baseVolume, track.initVolume, sample.chords)
          );
        });
        track.sequencer = new Sequencer(
          soundsArr,
          state[keys.actKey + index],
          state[keys.disabledKey + index],
          false,
          true,
          track.maxSoundsInSequence,
          track.minSoundsInSequence,
          state.currentChord
        );
        break;

      case "drum":
        track.sampleLoader.forEach((sample: any) => {
          soundsArr.push(
            new Sound(sample.sampleSource, track.baseVolume, track.initVolume, sample.chords)
          );
        });
        track.sequencer = new Sequencer(
          soundsArr,
          100,
          state[keys.disabledKey + index].disabled,
          track.patterns,
          false,
          track.maxSoundsInSequence,
          track.minSoundsInSequence,
          state.currentChord
        );
        track.sequencer.currentSequence = soundSources[index].patterns[soundSources[index].initPattern];
        break;

        case "fx":
          track.sampleLoader.forEach((sample: any) => {
            soundsArr.push(
              new Sound(sample.sampleSource, track.baseVolume, track.initVolume, sample.chords)
            );
          });
          track.sequencer = new Sequencer(
            soundsArr,
            100,
            state[keys.disabledKey + index].disabled,
            false,
            false,
            track.maxSoundsInSequence,
            track.minSoundsInSequence,
            state.currentChord
          );
          break;     
    }    
  });
}


export function setTrackVolume(volume: number, index: number) {
  soundSources[index].sequencer.sounds.forEach((sound: any) => {
    sound.howl.volume(
      (volume / 100) * soundSources[index].baseVolume
    );
  });
}

export function updateTrackActivity(activity: number, index: number, currentChord: string) {
  soundSources[index].sequencer.activity = activity;
  soundSources[index].sequencer.updateActivity(currentChord);
}

export function setTrackDisable(disabled : boolean, index: number) {
  soundSources[index].sequencer.disabled = disabled;
  if (disabled) {
    stopAllSounds(index);
  }
  if (!disabled && soundSources[index].kind === "fx"){
    soundSources[index].sequencer.sounds[0].howl.play()
  }
}

export function stopAllSounds(index: number) {
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

export function updateCurrentSequenceChords(currentChord: string) {
  soundSources.forEach((track: any, index: any) => {
    if (track.kind === "inst"){
      track.sequencer.updateChords(currentChord);
    }
  });
}

export function playSequencers(position: number){
  soundSources.forEach((track: any, index: any) => {
    if (track.kind === "inst" || track.kind === "drum"){
      track.sequencer.playSeqPosition(position);
    }
  });
}

export function playFX(){
  soundSources.forEach((track: any, index: any) => {
    if (track.kind === "fx"){
      if (!track.sequencer.disabled){
      track.sequencer.sounds[0].howl.play();
      }
    }
  });
}

export function updatePattern(value: number, index: number){
  soundSources[index].sequencer.currentSequence = soundSources[index].patterns[value - 1];
}

function newRandomChord() {
  updateCurrentSequenceChords(chordOptions[Math.floor(Math.random() * 6)]);
}





