import React from "react";
import { updateDrift } from "./drift"
import { initSoundPlayer, updateSoundPlayer, setTrackVolume, setTrackDisable, updateTrackActivity, toggleRhythmic, updateBPM, updateCurrentSequenceChords} from "./soundplayer"
import { soundSources} from "./soundsources"
import "./App.css";

export const keys = { 
volKey : "volume",
actKey : "activity",
volDriftKey : "volDriftVelocity",
actDriftKey : "actDriftVelocity",
driftingKey : "drifting",
disabledKey : "disabled",
}

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
    this.handleBpmChange = this.handleBpmChange.bind(this);
    this.handleRhythmicToggle = this.handleRhythmicToggle.bind(this);
    this.handleChordClick = this.handleChordClick.bind(this);
  }

  appLoop() {
    soundSources.forEach((track : any, index : number) => {
      if (this.state[keys.driftingKey + index]){
        let newVolumeObj = updateDrift(this.state[keys.volKey + index], this.state[keys.volDriftKey + index], 100 , 0);
        let newVolDriftVelocity : any = {}
        newVolDriftVelocity[keys.volDriftKey + index] = newVolumeObj.velocity;
        this.setState({...newVolDriftVelocity}) 
        this.handleVolumeChange(newVolumeObj.value, index)

        if (track.kind === "inst"){
          let newActivityObj = updateDrift(this.state[keys.actKey + index], this.state[keys.actDriftKey + index], 100, 0);
          let newActDriftVelocity : any = {}
          newActDriftVelocity[keys.actDriftKey + index] = newActivityObj.velocity;
          this.setState({...newActDriftVelocity}) 
          this.handleActivityChange(newActivityObj.value, index)
        }
        console.log(newVolumeObj)
      }
    })


    let currentSeqChord = updateSoundPlayer();
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

  handleRhythmicToggle(value: boolean) {
    this.setState({ rhythmic: value }, () =>
      toggleRhythmic(this.state.rhythmic, this.state.bpm)
    );
  }

  render() {
    return (
      <div>
        <FaderContainer
          tracks={this.state}
          handleVolumeChange={this.handleVolumeChange}
          handleActivityChange={this.handleActivityChange}
          handleDriftToggle={this.handleDriftToggle}
          handleDisableToggle={this.handleDisableToggle}
        />
        <RhythmContainer
          rhythmic={this.state.rhythmic}
          bpm={this.state.bpm}
          handleBpmChange={this.handleBpmChange}
          handleRhythmicToggle={this.handleRhythmicToggle}
        />
        <ChordContainer
          currentChord={this.state.currentChord}
          handleChordClick={this.handleChordClick}
        />
      </div>
    );
  }

  componentDidMount() {
    initSoundPlayer(this.state);
    this.appLoop();
  }
} 

function FaderContainer(props: any) {
  return (
    <div className="FaderContainer">
      {soundSources.map((track: any, index: number) => {
        if (track.kind === "inst")
          return (
            <TrackUI
              index={index}
              volume={props.tracks[keys.volKey + index]}
              activity={props.tracks[keys.actKey + index]}
              disabled={props.tracks[keys.disabledKey + index]}
              drifting={props.tracks[keys.driftingKey + index]}
              key={index}
              handleVolumeChange={props.handleVolumeChange}
              handleActivityChange={props.handleActivityChange}
              handleDriftToggle={props.handleDriftToggle}
              handleDisableToggle={props.handleDisableToggle}
            />
          );
      })}
    </div>
  );
}

//class TrackUI extends React.Component<any, any> {
function TrackUI(props : any) {
    return (
      <div className="TrackUI">
        <p>This is track number {props.index}</p>
        <p>its volume is {Math.round(props.volume)}</p>
        <p>
          <ControlledSlider
            value={props.volume}
            onChange={props.handleVolumeChange}
            disabled={props.disabled}
            index={props.index}
            min={0}
            max={100}
          />
        </p>
        <p>its activity is {Math.round(props.activity)}</p>
        <p>
          <ControlledSlider
            value={props.activity}
            onChange={props.handleActivityChange}
            disabled={props.disabled}
            index={props.index}
            min={0}
            max={100}
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

function RhythmContainer(props : any){
  return (
    <div className = "RhythmContainer">
    <p>Rhythmic:{" "}
    <ControlledCheckbox 
      index = {0}
      checked = {props.rhythmic}
      onChange = {props.handleRhythmicToggle}
      disabled = {false}
    />
    </p>
    <p>
      The current BPM is {props.bpm}
    </p>
    <ControlledSlider 
      index = {0}
      value = {props.bpm}
      onChange = {props.handleBpmChange}
      min={40}
      max={130}
      />
    </div>
  )
}


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
      initState[keys.volKey + index] = 50;
      initState[keys.actKey + index] = 20;
      initState[keys.volDriftKey + index] = 0;
      initState[keys.actDriftKey + index] = 0;
      initState[keys.driftingKey + index] = false;
      initState[keys.disabledKey + index] = false;
      break;
  
      case "drum":
      initState[keys.volKey + index] = 50;
      initState[keys.volDriftKey + index] = 0;
      initState[keys.driftingKey + index] = false;
      initState[keys.disabledKey + index] = false;
      break;
    }
    initState.currentChord = "G";
    initState.rhythmic = false;
    initState.bpm = 100;
  })
}
  /*
  fxSources.forEach((track : any, index: number) => {
    fxTracks.push({
      index: index,
      volume: 50,
      volDriftVelocity: 0,
      drifting: false,
      disabled: false,
    })
  })
  */


export default App;

