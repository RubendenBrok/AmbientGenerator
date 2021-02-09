import { time } from "console";
import { timingSafeEqual } from "crypto";
import { Howl, Howler } from "howler"
import { start } from "repl";
import { soundSources, drumSources } from "./soundsources"

const chordOptions = ["G","A","B","C","D","E"];

const maxSoundsInSequence = 10
const minSoundsInSequence = 1
const freeBPM = 10;
const freeBPMRandomness = 10
const sequenceLength = 32

class Sequencer {
  disabled: boolean;
  sounds: any[];
  bpm: number;
  currentSequence: number[];
  startOfSequence: number;
  currentSequencePos: number;
  currentSoundIndex: number;
  nextSequencePos: number;
  currentChord: string;
  activity: number;
  noteAmt: number;
  patterns: any;
  tonal : boolean;

  constructor(
    sounds: any[],
    bpm: number,
    currentChord: string,
    activity: number,
    disabled: boolean,
    patterns: any,
    tonal: boolean
  ) {
    this.sounds = sounds;
    this.disabled = disabled;
    this.bpm = bpm;
    this.startOfSequence = performance.now();
    this.currentSequencePos = 0;
    this.currentSoundIndex = 0;
    this.nextSequencePos = 0;
    this.currentChord = currentChord;
    this.currentSequence = [];
    this.activity = activity;
    this.noteAmt = 0;
    this.patterns = patterns;
    this.tonal = tonal;

    this.build();
  }

  calcAmountOfNotes() {
    this.noteAmt =
      minSoundsInSequence +
      Math.floor((this.activity / 100) * maxSoundsInSequence);
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
        let newSoundIndex = getNextSoundIndex(this.sounds, this.currentChord);
        this.currentSequence[newSeqIndex] = newSoundIndex;
        possibleIndexes.splice(newSeqIndex, 1);
      }
    }
  }

  updateAndPlay() {
    this.calcSequencePos();
    if (this.currentSequencePos >= 32) {
      this.restart();
    }

    if (this.currentSequencePos === this.nextSequencePos) {
      if (!isNaN(this.currentSequence[this.currentSequencePos])) {
        //this.sounds[this.currentSoundIndex].howl.stop();
        if (!this.disabled) {
          this.sounds[this.currentSequence[this.currentSequencePos]].howl.play();
          this.currentSoundIndex = this.currentSequence[this.currentSequencePos];
        }
      }
      this.nextSequencePos++;
    }
  }

  restart() {
    this.startOfSequence = performance.now();
    this.currentSequencePos = 0;
    this.nextSequencePos = 0;
  }

  mutate() {}

  updateChords() {
    if (this.tonal) {
      this.currentSequence.forEach((seqItem: number, seqIndex: number) => {
        if (!isNaN(seqItem)) {
          if (!this.sounds[seqItem].chords.includes(this.currentChord)) {
            this.currentSequence[seqIndex] = getNextSoundIndex(
              this.sounds,
              this.currentChord
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
            this.currentSequence[currentSequenceEmptyIndices[editIndex]] = getNextSoundIndex(this.sounds, this.currentChord);
            currentSequenceEmptyIndices.splice(editIndex, 1)
        }
    }
  }

  calcSequencePos() {
    let sixteenth = (60 / this.bpm / 4) * 1000;
    let timePassed = performance.now() - this.startOfSequence;
    this.currentSequencePos = Math.floor(timePassed / sixteenth);
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

export function initSoundPlayer(
  trackState: any,
  bpm: number,
  chord: string,
  rhythmic: boolean
) {
  soundSources.forEach((track: any, index: number) => {
    let soundsArr: any[] = [];
    track.sampleLoader.forEach((sample: any) => {
      soundsArr.push(
        new Sound(sample.sampleSource, track.baseVolume, sample.chords)
      );
    });
    track.sequencer = new Sequencer(
      soundsArr,
      bpm,
      chord,
      trackState[index].activity,
      trackState[index].disabled,
      false,
      true
    );
    toggleRhythmic(rhythmic, bpm);
  });

  drumSources.forEach((track: any, index: number) => {
    let soundsArr: any[] = [];
    track.sampleLoader.forEach((sample: any) => {
      soundsArr.push(
        new Sound(sample.sampleSource, track.baseVolume, sample.chords)
      );
    });
    track.sequencer = new Sequencer(
      soundsArr,
      bpm,
      chord,
      100,
      false,
      track.patterns,
      false
    );
    toggleRhythmic(rhythmic, bpm);
  });
}


export function updateSoundPlayer(rhythmic : boolean){
    soundSources.forEach((track : any) => {
        track.sequencer.updateAndPlay()
    })

    if (rhythmic){
        drumSources.forEach((track : any) => {
            track.sequencer.updateAndPlay();
        })
    }
}

export function setTrackVolume(volume : number, index : number){
    soundSources[index].currentVolume = volume / 100;
    soundSources[index].sequencer.sounds.forEach((sound : any) => {
        sound.howl.volume(soundSources[index].currentVolume * soundSources[index].baseVolume)
    })
}

export function updateTrackActivity(activity : number, index : number){
    soundSources[index].sequencer.activity = activity;
    soundSources[index].sequencer.updateActivity();
}

export function setTrackDisable(trackData : any, index : number){
    soundSources[index].sequencer.disabled = trackData[index].disabled
    if (trackData[index].disabled){ stopAllSounds(index) }
}

function stopAllSounds(index : number){
    soundSources[index].sequencer.sounds.forEach((sound : any) => {
        sound.howl.stop()
    })
}

function getRandomIntButNotThisOne(range : number, current : number){
    let out = Math.floor(Math.random() * range);
    if (out === current){
        out = getRandomIntButNotThisOne(range, out)
    }
    return out
}

function getNextSoundIndex(sounds : object[], currentChord : string){
    let newSoundIndex : number
    let newSoundOptions : number[] = []

    sounds.forEach((sound : any, index : number) => {
        if (sound.chords.includes(currentChord)){
            newSoundOptions.push(index)
        }
    })
    newSoundIndex = newSoundOptions[Math.floor(Math.random() * newSoundOptions.length)]
    return newSoundIndex
}

export function toggleRhythmic(rhythmic : boolean, bpm : number){
    if (rhythmic){
        soundSources.forEach((track : any, index : any) => {
            track.sequencer.bpm = bpm;
            track.sequencer.build();
            track.sequencer.restart();
        }) 
        drumSources.forEach((track : any, index : any) => {
            track.sequencer.bpm = bpm;
            track.sequencer.build();
            track.sequencer.restart();
        }) 
    } else {
        soundSources.forEach((track : any, index : any) => {
            track.sequencer.bpm = freeBPM + Math.random() * freeBPMRandomness;
        }) 
    }
}

export function updateBPM(bpm : number, rhythmic : boolean){
    if (rhythmic){
        soundSources.forEach((track : any, index : any) => {
            track.sequencer.bpm = bpm;
        })
        drumSources.forEach((track : any, index : any) => {
            track.sequencer.bpm = bpm;
        })
    } 
}

export function updateCurrentSequenceChords(currentChord : string){
    soundSources.forEach((track : any, index : any) => {
        track.sequencer.currentChord = currentChord;
        track.sequencer.updateChords();
    })
}

function newRandomChord(){
    updateCurrentSequenceChords(chordOptions[Math.floor(Math.random() * 6)])
}





