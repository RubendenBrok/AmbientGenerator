import { Howl, Howler } from "howler"
import { soundSources } from "./soundsources"
import { keys, seqLength, randomArrEntry } from "./App"

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
            new Sound(
              sample.sampleSource,
              track.baseVolume,
              track.initVolume,
              sample.chords
            )
          );
        });
        track.sounds = soundsArr;
        break;

      case "drum":
        track.sampleLoader.forEach((sample: any) => {
          soundsArr.push(
            new Sound(
              sample.sampleSource,
              track.baseVolume,
              track.initVolume,
              sample.chords
            )
          );
        });
        track.sounds = soundsArr;
        break;

      case "fx":
        track.sampleLoader.forEach((sample: any) => {
          soundsArr.push(
            new Sound(
              sample.sampleSource,
              track.baseVolume,
              track.initVolume,
              sample.chords
            )
          );
        });
        track.sounds = soundsArr;
        break;
    }    
  });
}


export function setTrackVolume(volume: number, index: number) {
  soundSources[index].sounds.forEach((sound: any) => {
    sound.howl.volume(
      (volume / 100) * soundSources[index].baseVolume
    );
  });
}

export function stopAllSounds(index: number) {
  soundSources[index].sounds.forEach((sound: any) => {
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
  newSoundIndex = randomArrEntry(newSoundOptions);

  return newSoundIndex;
}

export function playFX(state: any){
  soundSources.forEach((track: any, index: any) => {
    if (track.kind === "fx"){
      if (!state[keys.disabledKey + index]){
      track.sounds[0].howl.play();
      }
    }
  });
}

export function randomMutation(
  iterations: number,
  startingSeq: number[],
  sounds: any,
  tonal: boolean,
  currentChord: string
) {
  let newSeq = [...startingSeq];
  for (let i = 0; i < iterations; i++) {
    let emptyIndexes: number[] = [];
    let filledIndexes: number[] = [];
    newSeq.forEach((step: number, index: number) => {
      isNaN(step) ? emptyIndexes.push(index) : filledIndexes.push(index);
    });
    if (tonal){
      newSeq[
        emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)]
      ] = getNextSoundIndex(sounds, currentChord)
    } else {
      newSeq[
        emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)]
      ] = Math.floor(Math.random() * sounds.length);
    }

    newSeq[
      filledIndexes[Math.floor(Math.random() * filledIndexes.length)]
    ] = NaN;
  }
  return newSeq;
}


export function buildFromActivity(
  currentChord: string,
  sounds: any[],
  activity: number,
  minNotes: number,
  maxNotes: number,
) {
  let noteAmt = calcAmountOfNotes(minNotes, maxNotes, activity);
  let currentSequence = [];
  let possibleIndexes = [];
  for (let i = 0; i < seqLength; i++) {
    currentSequence.push(NaN);
    possibleIndexes.push(i);
  }
  for (let i = 0; i < noteAmt; i++) {
    let newSeqIndex = possibleIndexes[Math.floor(Math.random() * seqLength)];
    let newSoundIndex = getNextSoundIndex(sounds, currentChord);
    currentSequence[newSeqIndex] = newSoundIndex;
    possibleIndexes.splice(newSeqIndex, 1);
  }
  return currentSequence;
}

export function buildFromPattern(patternIndex : number, patterns: any[], sounds: any[]){
  let newSeq = [...patterns[patternIndex]];
  newSeq.forEach((step : number, index : number)=>{
    if (!isNaN(step)){
      newSeq[index] = Math.floor(Math.random() * sounds.length)
    }
  })
  return newSeq;
}

function calcAmountOfNotes(min: number, max: number, activity: number) {
  return min + Math.floor((activity / 100) * max);
}

export function updateActivity(
  currentChord: string,
  sounds: any[],
  activity: number,
  minNotes: number,
  maxNotes: number,
  currentSequence: number[]
) {
  let noteAmt = calcAmountOfNotes(minNotes, maxNotes, activity);
  let currentSequenceNoteIndices: number[] = [];
  let currentSequenceEmptyIndices: number[] = [];
  let editIndex: number;
  let noteDifference: number;

  currentSequence.forEach((seqItem: number, index: number) => {
    if (!isNaN(seqItem)) {
      currentSequenceNoteIndices.push(index);
    } else {
      currentSequenceEmptyIndices.push(index);
    }
  });

  noteDifference = noteAmt - currentSequenceNoteIndices.length;
  if (noteDifference < 0) {
    for (let i = 0; i > noteDifference; i--) {
      editIndex = Math.floor(Math.random() * currentSequenceNoteIndices.length);
      currentSequence[currentSequenceNoteIndices[editIndex]] = NaN;
      currentSequenceNoteIndices.splice(editIndex, 1);
    }
  } else if (noteDifference > 0) {
    for (let i = 0; i < noteDifference; i++) {
      editIndex = Math.floor(
        Math.random() * currentSequenceEmptyIndices.length
      );
      currentSequence[
        currentSequenceEmptyIndices[editIndex]
      ] = getNextSoundIndex(sounds, currentChord);
      currentSequenceEmptyIndices.splice(editIndex, 1);
    }
  }

  return currentSequence;
}

export function updateSeqChords(currentChord : string, sounds: any, currentSequence: number[]) {
    currentSequence.forEach((seqItem: number, seqIndex: number) => {
      if (!isNaN(seqItem)) {
        if (!sounds[seqItem].chords.includes(currentChord)) {
          currentSequence[seqIndex] = getNextSoundIndex(
            sounds,
            currentChord
          );
        }
      }
    });

    return currentSequence;
}


