import React from "react";
import { updateDrift } from "./drift"
import { initSoundPlayer, updateSoundPlayer, setTrackVolume, setTrackDisable, updateTrackActivity, updateBPM, updateCurrentSequenceChords, updatePattern} from "./soundplayer"
import { soundSources} from "./soundsources"
import "./App.css";

// keys for dymaically creating and accessing state properties
export const keys = { 
volKey : "volume",
actKey : "activity",
volDriftKey : "volDriftVelocity",
actDriftKey : "actDriftVelocity",
driftingKey : "drifting",
disabledKey : "disabled",
patKey : "pattern"
}

// initialize state from soundsources object, create properties for every track
const initState: any = {};
initializeState();

export class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = { ...initState };

    this.appLoop = this.appLoop.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleActivityChange = this.handleActivityChange.bind(this);
    this.handleDriftToggle = this.handleDriftToggle.bind(this);
    this.handleDisableToggle = this.handleDisableToggle.bind(this);
    this.handlePatternChange = this.handlePatternChange.bind(this);
    this.handleBpmChange = this.handleBpmChange.bind(this);
    this.handleChordClick = this.handleChordClick.bind(this);
  }

  // main loop
  appLoop() {
    //check if track properties should 'drift'
    soundSources.forEach((track : any, index : number) => {
      let newVolDriftVelocity : any = {}
      let newActDriftVelocity : any = {}
      if (this.state[keys.driftingKey + index]){
        let newVolumeObj = updateDrift(this.state[keys.volKey + index], this.state[keys.volDriftKey + index], 100 , 0);
        newVolDriftVelocity[keys.volDriftKey + index] = newVolumeObj.velocity;
        this.setState({...newVolDriftVelocity}) 
        this.handleVolumeChange(newVolumeObj.value, index)

        if (track.kind === "inst"){
          let newActivityObj = updateDrift(this.state[keys.actKey + index], this.state[keys.actDriftKey + index], 100, 0);
          newActDriftVelocity[keys.actDriftKey + index] = newActivityObj.velocity;
          this.setState({...newActDriftVelocity}) 
          this.handleActivityChange(newActivityObj.value, index)
        }
      }
    })

    //updateSoundplayer advances all sequencers, sometimes it returns a new chord, in which case the state should change
    let currentSeqChord = updateSoundPlayer(this.state);
    if (currentSeqChord !== this.state.currentChord) {
      this.setState({ currentChord: currentSeqChord });
    }
    window.requestAnimationFrame(this.appLoop);
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
    newActivityState[keys.actKey +index] = parseFloat(value);
    this.setState({ ...newActivityState }, () =>
      updateTrackActivity(this.state[keys.actKey +index], index)
    );
  }

  handleDriftToggle(value: boolean, index: number) {
    let newDriftState: any = {};
    newDriftState[keys.driftingKey + index] = value;
    this.setState({ ...newDriftState });
  }

  handleDisableToggle(value: boolean, index: number) {
    let newDisabledState: any = {};
    newDisabledState[keys.disabledKey + index] = !value;
    this.setState({ ...newDisabledState }, () => {
      setTrackDisable(this.state[keys.disabledKey + index], index);
    });
  }

  handleChordClick(chord: string) {
    if (chord !== this.state.currentChord) {
      this.setState({ currentChord: chord }, () =>
        updateCurrentSequenceChords(this.state.currentChord)
      );
    }
  }

  handleBpmChange(newBpm: number) {
    this.setState({ bpm: newBpm }, () =>
      updateBPM(this.state.bpm, this.state.rhythmic)
    );
  }

  handlePatternChange(value: number, index: number){
    let newPatternState: any = {};
    newPatternState[keys.patKey + index] = value;
    this.setState({ ...newPatternState }, () => {
      updatePattern(this.state[keys.patKey + index], index);
    });
  }

  render() {
    return (
      <div className = "UIContainer">
        <div className = "UILeft">
        <InstrumentContainer
          tracks={this.state}
          handleVolumeChange={this.handleVolumeChange}
          handleActivityChange={this.handleActivityChange}
          handleDriftToggle={this.handleDriftToggle}
          handleDisableToggle={this.handleDisableToggle}
        />
        <ChordContainer
          currentChord={this.state.currentChord}
          handleChordClick={this.handleChordClick}
        />
        </div>
        <div className = "UIRight">
        <RhythmContainer
          tracks={this.state}
          bpm={this.state.bpm}
          handleVolumeChange={this.handleVolumeChange}
          handleBpmChange={this.handleBpmChange}
          handleDriftToggle={this.handleDriftToggle}
          handlePatternChange={this.handlePatternChange}
          handleDisableToggle={this.handleDisableToggle}
        />
        <FXContainer
          tracks={this.state}
          handleVolumeChange={this.handleVolumeChange}
          handleDriftToggle={this.handleDriftToggle}
          handleDisableToggle={this.handleDisableToggle}
        />
        </div>
      </div>
    );
  }

  componentDidMount() {
    initSoundPlayer(this.state);
    this.appLoop();
  }
} 

const InstrumentContainer = React.memo(function InstrumentContainer(props: any) {
  return (
    <div>
      <h1>Instruments</h1>
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
    </div>
  );
})

const TrackUI = React.memo(function TrackUI(props : any) {
    console.log("rendering" + props.index)
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
      <h1>Drums</h1>
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
            min={40}
            max={130}
          />
        </div>
      </div>
    </div>
  );
});

const FXContainer = React.memo(function FXContainer(props: any) {
  return (
    <div className="fxdiv">
      <h1>FX</h1>
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

function ChordContainer(props : any){
  return (
    <div className = "ChordContainer">
      <ChordButton value = "G" name = "G" handleChordClick = {props.handleChordClick} />
      <ChordButton value = "A" name = "Am" handleChordClick = {props.handleChordClick} />
      <ChordButton value = "B" name = "Bm" handleChordClick = {props.handleChordClick} />
      <ChordButton value = "C" name = "C" handleChordClick = {props.handleChordClick} />
      <ChordButton value = "D" name = "D" handleChordClick = {props.handleChordClick} />
      <ChordButton value = "E" name = "Em" handleChordClick = {props.handleChordClick} />
      the current chord is {props.currentChord}
    </div>
  )
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
    initState.currentChord = "G";
    initState.bpm = 90;
  })
}


export default App;

