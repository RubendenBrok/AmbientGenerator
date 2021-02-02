import { request } from "https";
import React, { useState } from "react";
import "./App.css";

const driftAmt = 0.05;
const maxDriftSpeed = 0.2;

class App extends React.Component<any,any> {
  constructor(props: any) {
    super(props);
    this.state = {
      tracks :[
        { index: 0, volume: 50, activity: 50, volDriftVelocity: 0, actDriftVelocity: 0, drifting: false, disabled: false},
        { index: 1, volume: 50, activity: 50, volDriftVelocity: 0, actDriftVelocity: 0, drifting: false, disabled: false},
        { index: 2, volume: 50, activity: 50, volDriftVelocity: 0, actDriftVelocity: 0, drifting: false, disabled: false},
        { index: 3, volume: 50, activity: 50, volDriftVelocity: 0, actDriftVelocity: 0, drifting: false, disabled: false},
        { index: 4, volume: 50, activity: 50, volDriftVelocity: 0, actDriftVelocity: 0, drifting: false, disabled: false},
      ]
    };

    this.appLoop = this.appLoop.bind(this)
    this.handleVolumeChange = this.handleVolumeChange.bind(this)
    this.handleActivityChange = this.handleActivityChange.bind(this)
    this.handleDriftToggle = this.handleDriftToggle.bind(this)
    this.handleDisableToggle = this.handleDisableToggle.bind(this)

  }

  appLoop(){
    
    const oldTrackState = this.state.tracks

    oldTrackState.forEach((track : any) => {
      if (!track.disabled){
        if (track.drifting){
          track.volDriftVelocity = randomDriftVelocity(track.volDriftVelocity, driftAmt, maxDriftSpeed, -maxDriftSpeed)
          track.volume = parseFloat(limitDriftIncrease(track.volume, track.volDriftVelocity, 100, 0))
          if (track.volume === 0 || track.volume === 100){track.volDriftVelocity = 0} 

          track.actDriftVelocity = randomDriftVelocity(track.actDriftVelocity, driftAmt, maxDriftSpeed, -maxDriftSpeed)
          track.activity = parseFloat(limitDriftIncrease(track.activity, track.actDriftVelocity, 100, 0))
          if (track.activity === 0 || track.activity === 100){track.actDriftVelocity = 0}
        }
      }
    })
    
    this.setState(()=>({tracks : oldTrackState}))

    window.requestAnimationFrame(this.appLoop);
  }

  handleVolumeChange(value : number, index : number){
    let newTrackState = this.state.tracks;
    newTrackState[index].volume = value;
    this.setState({tracks: newTrackState})
  }

  handleActivityChange(value : number, index : number){
    let newTrackState = this.state.tracks;
    newTrackState[index].activity = value;
    this.setState({tracks: newTrackState})
  }

  handleDriftToggle(index : number){
    let newTrackState = this.state.tracks;
    newTrackState[index].drifting = !newTrackState[index].drifting;
    this.setState({tracks: newTrackState})
  }

  handleDisableToggle(index : number){
    let newTrackState = this.state.tracks;
    newTrackState[index].disabled = !newTrackState[index].disabled;
    this.setState({tracks: newTrackState})
  }

  render(){
    return(
      <UIContainer 
        numberOfTracks = {this.state.numberOfTracks} 
        tracks = {this.state.tracks} 
        handleVolumeChange = {this.handleVolumeChange}
        handleActivityChange = {this.handleActivityChange}
        handleDriftToggle = {this.handleDriftToggle}
        handleDisableToggle = {this.handleDisableToggle}/>
    )
  }

  componentDidMount() {
    this.appLoop();
  }
}

class UIContainer extends React.Component<any,any> {
  constructor(props: any) {
    super(props)
    this.state = {
      tracks : this.props.tracks}
    } 

  render(){

    return (
      <div className = "UIContainer">
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
            value={this.props.disabled}
            onChange={this.handleDisableToggle}
          ></input>
        </p>
      </div>
    );
  }
}

export default App;

function randomDriftVelocity(value: number, amount: number, max: number, min: number){
  value -= amount / 2;
  value += amount * Math.random();
  if (value > max) {value = max};
  if (value < min) {value = min};
  return Math.round(value * 100) / 100
}

function limitDriftIncrease(value: any, adder: number, max: number, min: number){
  value += adder;
  if (value > max) {value = max};
  if (value < min) {value = min};
  return value 
}