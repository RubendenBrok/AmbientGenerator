import { Howl, Howler } from "howler"
import { soundSources } from "./soundsources"

let frameCounter : number;

class Sound {
  howl: any;
  chords: any;
  fading: boolean

  constructor(url: string, baseVolume: number, chords: Array<string>) {
    this.howl = new Howl({
      src: [url],
      volume: baseVolume,

    });
    this.chords = chords;
    this.fading = false
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
export function initSoundPlayer(trackData : any){
    Howler.volume(0.6)

    soundSources.forEach((track, index) => {
        track.sampleLoader.forEach(sample =>{
            soundSources[index].sounds.push(
                new Sound(sample.sampleSource, track.baseVolume, sample.chords)
            )
        })
    })
}


export function updateSoundPlayer(trackData : any, currentChord : string){

    frameCounter = performance.now();

    soundSources.forEach((track, index) => { 
        if (!trackData[index].disabled){
        if (frameCounter > track.nextSoundTimer) {
        
          track.sounds[track.currentSoundIndex].howl.stop()
          /*
          track.sounds[track.currentSoundIndex].fading = true;
          track.sounds[track.currentSoundIndex].howl.fade(
            track.sounds[track.currentSoundIndex].howl.volume(),
            0,
            track.fadeOutTime, 
            () => {track.sounds[track.currentSoundIndex].fading = false}
          );
          */
         if (!isNaN(track.nextSoundIndex)) { 
            track.sounds[track.nextSoundIndex].howl.play();     
            track.currentSoundIndex = track.nextSoundIndex;
          }


         let nextSoundIndex = getNextSoundIndex(track.currentSoundIndex, track.sounds, currentChord)

          track.nextSoundIndex = nextSoundIndex;



          track.nextSoundTimer = frameCounter + ((100 - trackData[index].activity) / 100) * track.maxSampleLength + track.minSampleLength;
        }
    }
    })
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

function getNextSoundIndex(currentSoundIndex : number, sounds : object[], currentChord : string){
    let newSoundIndex : number
    let newSoundOptions : number[] = []
    let indexInOptions : number

    sounds.forEach((sound : any, index : number) => {
        if (index !== currentSoundIndex){
            if (sound.chords.includes(currentChord)){
                newSoundOptions.push(index)
            }
        }
    })

    newSoundIndex = newSoundOptions[Math.floor(Math.random() * newSoundOptions.length)]
    return newSoundIndex
}