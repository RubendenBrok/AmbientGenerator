import { time } from "console";
import { Howl, Howler } from "howler"
import { start } from "repl";
import { soundSources, drumSources } from "./soundsources"

let frameCounter : number;
const SEQUENCER = {
    rhythmicSequence : false,
    startOfSequence : 0,
    currentSequencePos : -1,
    nextSequencePos : 0,
    bpm : 100
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

/* initsoundPlayer loads every sample into a new howl, together with the chords that particular sound can be played on
soundSources [
    {sounds: [{
        howl: *ACTUAL SOUND*
        chords ["Array of chords it can be played on"}]
    ]}
]
*/
export function initSoundPlayer(trackData : any, bpm : number){
    soundSources.forEach((track) => {
        track.sampleLoader.forEach(sample =>{
            track.sounds.push(
                new Sound(sample.sampleSource, track.baseVolume, sample.chords)
            )
        })
    })

    drumSources.forEach((track) => {
        track.sampleLoader.forEach(sample =>{
            track.sounds.push(
                new Sound(sample.sampleSource, track.baseVolume, [])
            )
        })
    })


    SEQUENCER.bpm = bpm;
}


export function updateSoundPlayer(trackData : any, currentChord : string){

    frameCounter = performance.now();

    if (SEQUENCER.rhythmicSequence){
        SEQUENCER.currentSequencePos = calcSequencePos(SEQUENCER.startOfSequence, SEQUENCER.bpm);
        if (SEQUENCER.currentSequencePos >= 32){sequencerInit()};
        if (SEQUENCER.currentSequencePos === SEQUENCER.nextSequencePos){
            SEQUENCER.nextSequencePos++;
            if (!isNaN(drumSources[0].patterns[SEQUENCER.currentSequencePos])){
                drumSources[0].sounds[0].howl.play();
            }
            soundSources.forEach((track : any, index : number) => {
                if (!trackData[index].disabled){
                    if (!isNaN(track.currentSequence[SEQUENCER.currentSequencePos])){
                        track.nextSoundIndex = track.currentSequence[SEQUENCER.currentSequencePos]
                        track.sounds[track.currentSoundIndex].howl.stop();
                        track.sounds[track.nextSoundIndex].howl.play();
                        track.currentSoundIndex = track.nextSoundIndex;
                    }
                }
            })
        }
    } else {
        soundSources.forEach((track, index) => { 
            if (!trackData[index].disabled){
            if (frameCounter > track.nextSoundTimer) {
             track.sounds[track.currentSoundIndex].howl.stop()
             track.nextSoundIndex = getNextSoundIndex(track.sounds, currentChord)
             if (!isNaN(track.nextSoundIndex)) { 
                track.sounds[track.nextSoundIndex].howl.play();     
                track.currentSoundIndex = track.nextSoundIndex;
              }
              track.nextSoundTimer = frameCounter + ((100 - trackData[index].activity) / 100) * track.maxSampleLength + track.minSampleLength ;
            }
        }
        })
    }
}

export function setTrackVolume(volume : number, index : number){
    soundSources[index].currentVolume = volume / 100;
    soundSources[index].sounds.forEach((sound : any) => {
        sound.howl.volume(soundSources[index].currentVolume * soundSources[index].baseVolume)
    })
}

export function setTrackActivity(activity : number, index : number){
    let newSoundWaitTime = ((100 - activity) / 100) * soundSources[index].maxSampleLength + soundSources[index].minSampleLength + performance.now();
    if (newSoundWaitTime < soundSources[index].nextSoundTimer){
        soundSources[index].nextSoundTimer = newSoundWaitTime
    }
}

export function setTrackDisable(trackData : any, index : number){
    if (trackData[index].disabled){
        stopAllSounds(index)
    } else {
        soundSources[index].nextSoundTimer = performance.now() + 500
    }
}

function stopAllSounds(index : number){
    soundSources[index].sounds.forEach((sound : any) => {
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
      //  if (index !== currentSoundIndex){
            if (sound.chords.includes(currentChord)){
                newSoundOptions.push(index)
            }
      //  }
    })

    newSoundIndex = newSoundOptions[Math.floor(Math.random() * newSoundOptions.length)]
    return newSoundIndex
}

export function toggleRhythmic(value : boolean, trackState : any){
    SEQUENCER.rhythmicSequence = value;
    if (value){
        sequencerInit()
    }

    resetSoundSourcesSequencers(trackState)
}

export function updateBPM(bpm : number){
    SEQUENCER.bpm = bpm
}

function calcSixteenthNoteLength(bpm : number){
    return ( 60 / bpm / 4 ) * 1000;
}

function calcSequencePos(startTime : number, bpm : number){
    let sixteenth = calcSixteenthNoteLength(bpm);
    let timePassed = performance.now() - startTime;
    return Math.floor(timePassed / sixteenth)
}

function sequencerInit(){
    SEQUENCER.startOfSequence = performance.now();
    SEQUENCER.currentSequencePos = -1;
    SEQUENCER.nextSequencePos = 0;
}

function resetSoundSourcesSequencers(trackState : any){
    soundSources.forEach((track : any, index : number) => {
        track.currentSequence = []
        for (let i = 0; i < 32; i++){
            if (Math.random() > ((100 - trackState[index].activity) / 100)){
                let newSoundIndex = getNextSoundIndex(track.sounds, "G");
                track.currentSequence.push(newSoundIndex);
            } else {
                track.currentSequence.push(NaN)
            }
        }
    })
}

export function updateCurrentSequenceChords(chord : string){
    soundSources.forEach((track : any, index : number) => {
        track.currentSequence.forEach((seqItem: number, seqIndex : number) => {
            if (!isNaN(seqItem)){
                if (!track.sounds[seqItem].chords.includes(chord)){
                    track.currentSequence[seqIndex] = getNextSoundIndex(track.sounds, chord)
                }
            }
        })
    })
}