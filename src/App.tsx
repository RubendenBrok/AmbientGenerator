import { request } from "https";
import React, { useState } from "react";
import { updateTrackDrift } from "./drift"
import { initSoundPlayer, updateSoundPlayer, setTrackVolume, setTrackDisable, setTrackActivity } from "./soundplayer"
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
    };

    this.appLoop = this.appLoop.bind(this);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleActivityChange = this.handleActivityChange.bind(this);
    this.handleDriftToggle = this.handleDriftToggle.bind(this);
    this.handleDisableToggle = this.handleDisableToggle.bind(this);
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

  handleDriftToggle(index: number) {
    let newTrackState = this.state.tracks;
    newTrackState[index].drifting = !newTrackState[index].drifting;
    this.setState({ tracks: newTrackState });
  }

  handleDisableToggle(index: number) {
    let newTrackState = this.state.tracks;
    newTrackState[index].disabled = !newTrackState[index].disabled;
    this.setState({ tracks: newTrackState }, () => {
      setTrackDisable(this.state.tracks, index);
    });
  }

  handleChordClick(chord: string) {
    if (chord !== this.state.currentChord){
      this.setState({ currentChord: chord });
    }
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
        <ChordContainer
          currentChord={this.state.currentChord}
          handleChordClick={this.handleChordClick}
        />
      </div>
    );
  }

  componentDidMount() {
    initSoundPlayer(this.state.tracks);
    this.appLoop();
  }
}

class FaderContainer extends React.Component<any,any> {
  constructor(props: any) {
    super(props)
    this.state = {
      tracks : this.props.tracks}
    } 

  render(){

    return (
      <div className = "FaderContainer">
        {this.props.tracks.map((track : any) => {
          return (
            <TrackUI 
              index = {track.index} 
              volume = {track.volume} 
              activity = {track.activity} 
              disabled = {track.disabled}
              key = {track.index} 
              handleVolumeChange = {this.props.handleVolumeChange}
              handleActivityChange = {this.props.handleActivityChange}
              handleDriftToggle = {this.props.handleDriftToggle}
              handleDisableToggle = {this.props.handleDisableToggle}
              />
          )})
        }
      </div>
    )
  }
}

class TrackUI extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.handleVolumeChange = this.handleVolumeChange.bind(this);
    this.handleActivityChange = this.handleActivityChange.bind(this);
    this.handleDriftToggle = this.handleDriftToggle.bind(this);
    this.handleDisableToggle = this.handleDisableToggle.bind(this);
  }

  handleVolumeChange(e: any) {
    this.props.handleVolumeChange(e.target.value, this.props.index);
  }

  handleActivityChange(e: any) {
    this.props.handleActivityChange(e.target.value, this.props.index);
  }

  handleDriftToggle() {
    this.props.handleDriftToggle(this.props.index);
  }

  handleDisableToggle() {
    this.props.handleDisableToggle(this.props.index);
  }

  render() {
    return (
      <div className="TrackUI">
        <p>This is track number {this.props.index}</p>
        <p>its volume is {Math.round(this.props.volume)}</p>
        <p>
          <input
            type="range"
            value={this.props.volume}
            onChange={this.handleVolumeChange}
            disabled={this.props.disabled}
          ></input>
        </p>
        <p>its activity is {Math.round(this.props.activity)}</p>
        <p>
          <input
            type="range"
            value={this.props.activity}
            onChange={this.handleActivityChange}
            disabled={this.props.disabled}
          ></input>
        </p>
        <p>
          Drift:{" "}
          <input
            type="checkbox"
            value={this.props.drifting}
            onChange={this.handleDriftToggle}
            disabled={this.props.disabled}
          ></input>
        </p>
        <p>
          Enabled:{" "}
          <input
            type="checkbox"
            checked={!this.props.disabled}
            onChange={this.handleDisableToggle}
          ></input>
        </p>
      </div>
    );
  }
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

export default App;

