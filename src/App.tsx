import { request } from "https";
import React, { useState } from "react";
import { updateTrackDrift } from "./drift"
import { initSoundPlayer, updateSoundPlayer, setTrackVolume, setTrackDisable, setTrackActivity, toggleRhythmic, updateBPM, updateCurrentSequenceChords } from "./soundplayer"
import "./App.css";
import { isPropertySignature } from "typescript";

export class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      tracks: [
        {
          index: 0,
          volume: 50,
          activity: 50,
          volDriftVelocity: 0,
          actDriftVelocity: 0,
          drifting: false,
          disabled: false,
        },
        {
          index: 1,
          volume: 50,
          activity: 50,
          volDriftVelocity: 0,
          actDriftVelocity: 0,
          drifting: false,
          disabled: false,
        },
        {
          index: 2,
          volume: 50,
          activity: 50,
          volDriftVelocity: 0,
          actDriftVelocity: 0,
          drifting: false,
          disabled: false,
        },
        {
          index: 3,
          volume: 50,
          activity: 50,
          volDriftVelocity: 0,
          actDriftVelocity: 0,
          drifting: false,
          disabled: false,
        },
        //{ index: 4, volume: 50, activity: 50, volDriftVelocity: 0, actDriftVelocity: 0, drifting: false, disabled: false},
      ],
      currentChord: "G",
      rhythmic: false,
      bpm: 100
    };

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
    const newTrackState = updateTrackDrift(this.state.tracks);
    newTrackState.forEach((track: any, index: number) => {
      if (track.volume !== this.state.volume) {
        this.handleVolumeChange(track.volume, index);
      }
      if (track.activity !== this.state.activity) {
        this.handleActivityChange(track.activity, index);
      }
    });

    updateSoundPlayer(this.state.tracks, this.state.currentChord)

    window.requestAnimationFrame(this.appLoop);
  }

  handleVolumeChange(value: any, index: number) {
    let newTrackState = this.state.tracks;
    newTrackState[index].volume = parseFloat(value);
    this.setState({ tracks: newTrackState }, () =>
      setTrackVolume(this.state.tracks[index].volume, index)
    );
  }

  handleActivityChange(value: any, index: number) {
    let newTrackState = this.state.tracks;
    newTrackState[index].activity = parseFloat(value);
    this.setState({ tracks: newTrackState }, () =>
      setTrackActivity(this.state.tracks[index].activity, index)
    );
  }

  handleDriftToggle(value :boolean, index: number) {
    let newTrackState = this.state.tracks;
    newTrackState[index].drifting = value;
    this.setState({ tracks: newTrackState });
  }

  handleDisableToggle(value : boolean, index: number) {
    let newTrackState = this.state.tracks;
    newTrackState[index].disabled = !value;
    this.setState({ tracks: newTrackState }, () => {
      setTrackDisable(this.state.tracks, index);
    });
  }

  handleChordClick(chord: string) {
    if (chord !== this.state.currentChord){
      this.setState({ currentChord: chord }, () => updateCurrentSequenceChords(this.state.currentChord));
    }
  }

  handleBpmChange(newBpm : number){
    this.setState( {bpm : newBpm}, () => updateBPM(this.state.bpm) )
  }

  handleRhythmicToggle(value : boolean){
    this.setState( {rhythmic : value}, () => toggleRhythmic(this.state.rhythmic, this.state.tracks) )
  }

  render() {
    return (
      <div>
        <FaderContainer
          numberOfTracks={this.state.numberOfTracks}
          tracks={this.state.tracks}
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
    initSoundPlayer(this.state.tracks, this.state.bpm);
    this.appLoop();
  }
}

function FaderContainer(props : any){
    return (
      <div className = "FaderContainer">
        {props.tracks.map((track : any) => {
          return (
            <TrackUI 
              index = {track.index} 
              volume = {track.volume} 
              activity = {track.activity} 
              disabled = {track.disabled}
              key = {track.index} 
              handleVolumeChange = {props.handleVolumeChange}
              handleActivityChange = {props.handleActivityChange}
              handleDriftToggle = {props.handleDriftToggle}
              handleDisableToggle = {props.handleDisableToggle}
              />
          )})
        }
      </div>
    )
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

export default App;

