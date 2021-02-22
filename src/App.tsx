import React from "react";
import { updateDrift } from "./drift";
import {
  initSoundPlayer,
  setTrackVolume,
  updateSeqChords,
  playFX,
  stopAllSounds,
  randomMutation,
  buildFromActivity,
  buildFromPattern,
  updateActivity
} from "./soundplayer";
import { soundSources } from "./soundsources";
import "./App.css";
import { updateGraphics, initGraphics, ripple } from "./visuals";

// keys for dymaically creating and accessing state properties
export const keys = { 
volKey : "volume",
actKey : "activity",
volDriftKey : "volDriftVelocity",
actDriftKey : "actDriftVelocity",
driftingKey : "drifting",
disabledKey : "disabled",
patKey : "pattern",
seqKey : "currentSequence"
}
export const seqLength = 32;
const chordOptions = ["G","A","B","C","D","E"],
barOptions = [1,2,4,8],
tempoChangeOptions = [8,16],
drumChangeOptions= [4,8,12],
FXLength = 6000,
maxBpm = 140,
minBpm = 60,
bpmVariance = 8;


// initialize state from soundsources object, create properties for every track
const initState: any = {};
initializeState();

/*
window.onload = () => {
  masterSeq.playing = true;
  masterSeq.restart();
}
*/

export class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { ...initState };

    this.appLoop = this.appLoop.bind(this);
    this.updateMasterSeq = this.updateMasterSeq.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleActivityChange = this.handleActivityChange.bind(this);
    this.handleDriftToggle = this.handleDriftToggle.bind(this);
    this.handleDisableToggle = this.handleDisableToggle.bind(this);
    this.handlePatternChange = this.handlePatternChange.bind(this);
    this.handleBpmChange = this.handleBpmChange.bind(this);
    this.handleChordClick = this.handleChordClick.bind(this);
    this.handlePlayingToggle = this.handlePlayingToggle.bind(this);
    this.handleInstUIToggle = this.handleInstUIToggle.bind(this);
    this.handleDrumUIToggle = this.handleDrumUIToggle.bind(this);
    this.handleFxUIToggle = this.handleFxUIToggle.bind(this);
  }

  handleVolumeChange(value: any, index: number) {
    let newVolumeState: any = {};
    newVolumeState[keys.volKey + index] = parseFloat(value);
    this.setState({ ...newVolumeState }, () =>
      setTrackVolume(this.state[keys.volKey + index], index)
    );
  }

  handleActivityChange(value: any, index: number) {
    let newActivityState: any = {};
    newActivityState[keys.actKey + index] = parseFloat(value);
    this.setState({ ...newActivityState }, () => {
      let newSeqState: any = {};
      newSeqState[keys.seqKey + index] = updateActivity(
        this.state.currentChord,
        soundSources[index].sounds,
        this.state[keys.actKey + index],
        soundSources[index].minSoundsInSequence,
        soundSources[index].maxSoundsInSequence,
        this.state[keys.seqKey + index]
      );
      this.setState({ ...newSeqState })
    });
  }

  handleDriftToggle(value: boolean, index: number) {
    let newDriftState: any = {};
    newDriftState[keys.driftingKey + index] = value;
    this.setState({ ...newDriftState });
  }

  handleDisableToggle(value: boolean, index: number) {
    let newDisabledState: any = {};
    newDisabledState[keys.disabledKey + index] = !value;
    this.setState({ ...newDisabledState })
  }

  handleChordClick(chord: string) {
    if (chord !== this.state.currentChord) {
      this.setState({ currentChord: chord }, () => {
        soundSources.forEach((track: any, index: any) => {
          if (track.kind === "inst"){
            let newSeqState: any = {};
            newSeqState[keys.seqKey + index] = updateSeqChords(
              this.state.currentChord,
              soundSources[index].sounds,
              this.state[keys.seqKey + index]
            );
            this.setState({ ...newSeqState })
          }
        });
      });
    }
  }

  handleBpmChange(newBpm: number) {
    this.setState({ bpm: newBpm });
  }

  handlePlayingToggle() {
    this.setState({ playing: !this.state.playing }, () => {
      if (!this.state.playing) {
        soundSources.forEach((track: any, index: number) => {
          stopAllSounds(index);
        });
      }
    });
  }

  handlePatternChange(value: number, index: number) {
    let newPatternState: any = {};
    newPatternState[keys.patKey + index] = value;
    this.setState({ ...newPatternState }, () => {
      let newSeq : any = {};
      newSeq[keys.seqKey + index] = buildFromPattern(
        value - 1,
        soundSources[index].patterns,
        soundSources[index].sounds);
      this.setState({ ...newSeq })
    });
  }

  handleInstUIToggle() {
    let newUIState: any = {};
    newUIState.showInstUI = !this.state.showInstUI;
    this.setState({ ...newUIState });
  }
  handleDrumUIToggle() {
    let newUIState: any = {};
    newUIState.showDrumUI = !this.state.showDrumUI;
    this.setState({ ...newUIState });
  }
  handleFxUIToggle() {
    let newUIState: any = {};
    newUIState.showFxUI = !this.state.showFxUI;
    this.setState({ ...newUIState });
  }

  updateMasterSeq() {
    this.setState({lastPlayTime: performance.now()})
    let sixteenth = (60 / this.state.bpm / 4) * 1000;
    setTimeout(this.updateMasterSeq, sixteenth);

    if (this.state.playing) {
      //check if track properties should 'drift'
      soundSources.forEach((track: any, index: number) => {
        let newVolDriftVelocity: any = {};
        let newActDriftVelocity: any = {};
        if (this.state[keys.driftingKey + index]) {
          let newVolumeObj = updateDrift(
            this.state[keys.volKey + index],
            this.state[keys.volDriftKey + index],
            100,
            0
          );
          newVolDriftVelocity[keys.volDriftKey + index] = newVolumeObj.velocity;
          this.setState({ ...newVolDriftVelocity });
          this.handleVolumeChange(newVolumeObj.value, index);

          if (track.kind === "inst") {
            let newActivityObj = updateDrift(
              this.state[keys.actKey + index],
              this.state[keys.actDriftKey + index],
              100,
              0
            );
            newActDriftVelocity[keys.actDriftKey + index] =
              newActivityObj.velocity;
            this.setState({ ...newActDriftVelocity });
            this.handleActivityChange(newActivityObj.value, index);
          }
        }
      });

      let newSeqState = { ...this.state.masterSeq };

      // play sounds
      playSequencers(this.state);
      newSeqState.currentSequencePos++;
      if (newSeqState.currentSequencePos >= seqLength) {
        newSeqState.currentSequencePos = 0;
        newSeqState.barsPlayed++;

        if (newSeqState.barsPlayed === newSeqState.tempoChangeTimer) {
          newSeqState.tempoChangeTimer =
            newSeqState.barsPlayed + randomArrEntry(tempoChangeOptions);
          let newBpm = this.state.bpm;
          newBpm -= bpmVariance;
          newBpm += Math.round(bpmVariance * 2 * Math.random());
          if (newBpm > maxBpm) {
            newBpm = maxBpm;
          }
          if (newBpm < minBpm) {
            newBpm = minBpm;
          }
          this.handleBpmChange(newBpm);
        }

        // should a sequence mutate/evolve?
        soundSources.forEach((track: any, index: number) => {
          if (!this.state[keys.disabledKey + index]) {
            if (track.kind === "inst") {
              if (Math.random() < track.mutationChance) {
                let newSeq: any = {};
                newSeq[keys.seqKey + index] = randomMutation(
                  1,
                  this.state[keys.seqKey + index],
                  soundSources[index].sounds,
                  true,
                  this.state.currentChord
                );
                this.setState({ ...newSeq });
              }
            }
            if (track.kind === "drum") {
              if (Math.random() < track.mutationChance) {
                let newSeq: any = {};
                newSeq[keys.seqKey + index] = randomMutation(
                  1,
                  this.state[keys.seqKey + index],
                  soundSources[index].sounds,
                  false,
                  this.state.currentChord
                );
                this.setState({ ...newSeq });
              }
            }
          }
        });

        // should the drums change to a new pattern?
        if (newSeqState.newDrumSeqTimer === newSeqState.barsPlayed) {
          newSeqState.newDrumSeqTimer =
            newSeqState.newDrumSeqTimer + randomArrEntry(drumChangeOptions);
          soundSources.forEach((track: any, index: number) => {
            if (track.kind === "drum") {
              this.handlePatternChange(
                Math.floor(Math.random() * track.patterns.length) + 1,
                index
              );
            }
          });
        }

        //should the chord change?
        if (newSeqState.barsPlayed === newSeqState.nextChord) {
          newSeqState.nextChord =
            newSeqState.barsPlayed + randomArrEntry(barOptions);
          let newChord = newRandomChord(this.state.currentChord);
          this.handleChordClick(newChord);
        }
      }

      //retrigger FX loops if necessary
      if (performance.now() - newSeqState.FXTimer > FXLength) {
        playFX(this.state);
        newSeqState.FXTimer = performance.now();
      }

      this.setState({ masterSeq: newSeqState });
    }
  }

  // main loop
  appLoop() {
    if (this.state.playing){
      updateGraphics(this.state);
    }

    window.requestAnimationFrame(this.appLoop);
  }

  componentDidMount() {
    initSoundPlayer(this.state);
    initGraphics();

    soundSources.forEach((sound: any, index: number)=>{
      if (sound.kind === "inst"){
        let newSeq : any = {}
        newSeq[keys.seqKey + index] = buildFromActivity(
          initState.currentChord,
          soundSources[index].sounds,
          soundSources[index].initActivity,
          soundSources[index].minSoundsInSequence,
          soundSources[index].maxSoundsInSequence,
        )
        this.setState({ ...newSeq })
      }
      if (sound.kind === "drum"){
        let newSeq : any = {}
        newSeq[keys.seqKey + index] = buildFromPattern(
          soundSources[index].initPattern,
          soundSources[index].patterns,
          soundSources[index].sounds
        )
        this.setState({ ...newSeq })
      }
    })

    let sixteenth = (60 / this.state.bpm / 4) * 1000;
    setTimeout(this.updateMasterSeq, sixteenth);

    setTimeout(this.appLoop, 100);
  }

  render() {
    return (
      <div className="UIContainer">
        <div className="UILeft">
          <InstrumentContainer
            UIIndex={0}
            tracks={this.state}
            handleVolumeChange={this.handleVolumeChange}
            handleActivityChange={this.handleActivityChange}
            handleDriftToggle={this.handleDriftToggle}
            handleDisableToggle={this.handleDisableToggle}
            handleUIToggle={this.handleInstUIToggle}
            showUI={this.state.showInstUI}
          />
          <ChordContainer
            currentChord={this.state.currentChord}
            handleChordClick={this.handleChordClick}
            showUI={this.state.showInstUI}
          />
        </div>
        <div className="UIRight">
          <RhythmContainer
            UIIndex={1}
            tracks={this.state}
            bpm={this.state.bpm}
            handleVolumeChange={this.handleVolumeChange}
            handleBpmChange={this.handleBpmChange}
            handleDriftToggle={this.handleDriftToggle}
            handlePatternChange={this.handlePatternChange}
            handleDisableToggle={this.handleDisableToggle}
            handlePlayingToggle={this.handlePlayingToggle}
            handleUIToggle={this.handleDrumUIToggle}
            playing={this.state.playing}
            showUI={this.state.showDrumUI}
          />
          <FXContainer
            UIIndex={2}
            tracks={this.state}
            handleVolumeChange={this.handleVolumeChange}
            handleDriftToggle={this.handleDriftToggle}
            handleDisableToggle={this.handleDisableToggle}
            handleUIToggle={this.handleFxUIToggle}
            showUI={this.state.showFxUI}
          />
        </div>
      </div>
    );
  }
} 

const InstrumentContainer = React.memo(function InstrumentContainer(props: any) {
  return (
    <div>
      <h1 onClick = {()=>{props.handleUIToggle()}}>Instruments </h1>
      {props.showUI
      ? 
      <div className="InstrumentContainer">
        {soundSources.map((track: any, index: number) => {
          if (track.kind === "inst")
            return (
              <TrackUI
                index={index}
                volume={props.tracks[keys.volKey + index]}
                range2Value={props.tracks[keys.actKey + index]}
                disabled={props.tracks[keys.disabledKey + index]}
                drifting={props.tracks[keys.driftingKey + index]}
                range2Label={"Activity: "}
                range2Min={0}
                range2Max={100}
                range2Step={1}
                key={index}
                handleVolumeChange={props.handleVolumeChange}
                handleRange2Change={props.handleActivityChange}
                handleDriftToggle={props.handleDriftToggle}
                handleDisableToggle={props.handleDisableToggle}
              />
            );
        })}
      </div>
      :""}
    </div>
  );
})

const TrackUI = React.memo(function TrackUI(props : any) {
    return (
      <div className="TrackUI">
        <p><b>{soundSources[props.index].name}</b></p>
        <p>Volume: {Math.round(props.volume)}</p>
        <p>
          <ControlledSlider
            value={props.volume}
            onChange={props.handleVolumeChange}
            disabled={props.disabled}
            index={props.index}
            min={0}
            max={100}
            step={1}
          />
        </p>
        <p>{props.range2Label}{Math.round(props.range2Value)}</p>
        <p>
          <ControlledSlider
            value={props.range2Value}
            onChange={props.handleRange2Change}
            disabled={props.disabled}
            index={props.index}
            min={props.range2Min}
            max={props.range2Max}
            step={props.range2Step}
          />
        </p>
        <p>
          Drift:{" "}
          <ControlledCheckbox
            index={props.index}
            checked={props.drifting}
            onChange={props.handleDriftToggle}
            disabled={props.disabled}
          />
        </p>
        <p>
          Enabled:{" "}
          <ControlledCheckbox
            index={props.index}
            checked={!props.disabled}
            onChange={props.handleDisableToggle}
            disabled={false}
          />
        </p>
      </div>
    );
  }
)

const RhythmContainer = React.memo(function RhythmContainer(props: any) {
  return (
    <div className="drumdiv">
      <h1 onClick = {()=>{props.handleUIToggle()}}>Drums</h1>
      {props.showUI
      ?
      <div className="RhythmContainer">
        {soundSources.map((track: any, index: number) => {
          if (track.kind === "drum") {
            return (
              <TrackUI
                index={index}
                volume={props.tracks[keys.volKey + index]}
                disabled={props.tracks[keys.disabledKey + index]}
                drifting={props.tracks[keys.driftingKey + index]}
                range2Value={props.tracks[keys.patKey + index]}
                range2Label={"Pattern: "}
                range2Min={1}
                range2Max={soundSources[index].patterns.length}
                range2Step={1}
                key={index}
                handleVolumeChange={props.handleVolumeChange}
                handleRange2Change={props.handlePatternChange}
                handleDriftToggle={props.handleDriftToggle}
                handleDisableToggle={props.handleDisableToggle}
              />
            );
          }
        })}
        <div className="bpmslider">
          <p>BPM: {props.bpm}</p>
          <ControlledSlider
            index={0}
            value={props.bpm}
            onChange={props.handleBpmChange}
            min={minBpm}
            max={maxBpm}
          />
                  <button onClick={props.handlePlayingToggle}>
          {props.playing
          ? 'PAUSE'
          : 'PLAY'}
        </button>
        </div>

      </div>
      :""}
    </div>
  );
});

const FXContainer = React.memo(function FXContainer(props: any) {
  return (
    <div className="fxdiv">
      <h1 onClick = {()=>{props.handleUIToggle()}}>FX</h1>
      {props.showUI
      ?
      <div className="FXContainer">
        {soundSources.map((track: any, index: number) => {
          if (track.kind === "fx") {
            return (
              <FXUI
                index={index}
                volume={props.tracks[keys.volKey + index]}
                disabled={props.tracks[keys.disabledKey + index]}
                drifting={props.tracks[keys.driftingKey + index]}
                key={index}
                handleVolumeChange={props.handleVolumeChange}
                handleDriftToggle={props.handleDriftToggle}
                handleDisableToggle={props.handleDisableToggle}
              />
            );
          }
        })}
      </div>
      :""}
    </div>
  );
})

const FXUI = React.memo(function FXUI(props: any){
  return (
    <div className="TrackUI">
      <p><b>{soundSources[props.index].name}</b></p>
      <p>Volume: {Math.round(props.volume)}</p>
      <p>
        <ControlledSlider
          value={props.volume}
          onChange={props.handleVolumeChange}
          disabled={props.disabled}
          index={props.index}
          min={0}
          max={100}
          step={1}
        />
      </p>
      <p>
        Drift:{" "}
        <ControlledCheckbox
          index={props.index}
          checked={props.drifting}
          onChange={props.handleDriftToggle}
          disabled={props.disabled}
        />
      </p>
      <p>
        Enabled:{" "}
        <ControlledCheckbox
          index={props.index}
          checked={!props.disabled}
          onChange={props.handleDisableToggle}
          disabled={false}
        />
      </p>
    </div>
  );
})

function ChordContainer(props: any) {
  return (
    <div>
      {props.showUI ? (
        <div className="ChordContainer">
          <ChordButton
            value="G"
            name="G"
            handleChordClick={props.handleChordClick}
          />
          <ChordButton
            value="A"
            name="Am"
            handleChordClick={props.handleChordClick}
          />
          <ChordButton
            value="B"
            name="Bm"
            handleChordClick={props.handleChordClick}
          />
          <ChordButton
            value="C"
            name="C"
            handleChordClick={props.handleChordClick}
          />
          <ChordButton
            value="D"
            name="D"
            handleChordClick={props.handleChordClick}
          />
          <ChordButton
            value="E"
            name="Em"
            handleChordClick={props.handleChordClick}
          />
          the current chord is {props.currentChord}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

function ChordButton(props : any){
  return (
    <div className = "ChordButton">
      <button onClick = { () => props.handleChordClick(props.value) }>
      {props.name}</button>
    </div>
  )
}

function ControlledSlider(props : any){
  function handleChange(event : any){
    props.onChange(event.target.value, props.index)
  }
  return (
    <input
    type="range"
    value={props.value}
    onChange={handleChange}
    disabled={props.disabled}
    min={props.min}
    max={props.max}
    step={props.step}
  ></input>
  )
}

function ControlledCheckbox(props : any){
  function handleChange(event : any){
    props.onChange(event.target.checked, props.index)
  }
  return (
    <input
    type="checkbox"
    checked={props.checked}
    onChange={handleChange}
    disabled={props.disabled}
  ></input>
  )
}

function initializeState(){
  initState.currentChord = "G";
  initState.bpm = 90;
  initState.playing = true;

  initState.showInstUI = true;
  initState.showDrumUI = true;
  initState.showFxUI = true;

  initState.masterSeq = {
    currentSequencePos : 0,
    lastPlayTime: performance.now(),
    barsPlayed : 0,
    newDrumSeqTimer : randomArrEntry(drumChangeOptions),
    FXTimer: -FXLength,
    nextChord: randomArrEntry(barOptions),
    tempoChangeTimer: randomArrEntry(tempoChangeOptions)
  }

  soundSources.forEach((track : any, index: number) => {

    switch (track.kind){
      case "inst":
        initState[keys.volKey + index] = soundSources[index].initVolume;
        initState[keys.actKey + index] = soundSources[index].initActivity;
        initState[keys.volDriftKey + index] = 0;
        initState[keys.actDriftKey + index] = 0;
        initState[keys.driftingKey + index] = soundSources[index].initDrifting;
        initState[keys.disabledKey + index] = soundSources[index].initDisabled;
        break;
  
      case "drum":
        initState[keys.volKey + index] = soundSources[index].initVolume;
        initState[keys.volDriftKey + index] = 0;
        initState[keys.driftingKey + index] = soundSources[index].initDrifting;
        initState[keys.disabledKey + index] = soundSources[index].initDisabled;
        initState[keys.patKey + index] = soundSources[index].initPattern + 1;
        break;

      case "fx":
        initState[keys.volKey + index] = soundSources[index].initVolume;
        initState[keys.volDriftKey + index] = 0;
        initState[keys.driftingKey + index] = soundSources[index].initDrifting;
        initState[keys.disabledKey + index] = soundSources[index].initDisabled;
        break;
    }
  })
}

function newRandomChord(currentChord : string) {
  let possibleOptions = [...chordOptions];
  let currentChordIndex = possibleOptions.indexOf(currentChord);
  possibleOptions.splice(currentChordIndex,1)
  return randomArrEntry(possibleOptions);
}

export function randomArrEntry(arr : any){
  return arr[Math.floor(Math.random() * arr.length)]
}

function playSequencers(state: any) {
  soundSources.forEach((track: any, index: any) => {
    if (!state[keys.disabledKey + index]) {
      if (track.kind === "inst" || track.kind === "drum") {
        let soundIndex =
          state[keys.seqKey + index][state.masterSeq.currentSequencePos];
        if (!isNaN(soundIndex)) {
          soundSources[index].sounds[soundIndex].howl.play();
          ripple(index, state[keys.volKey + index], state.masterSeq.currentSequencePos)
        }
      }
    }
  });
}

export default App;

