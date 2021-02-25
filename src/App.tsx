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
import { updateGraphics, initGraphics, ripple, colors } from "./visuals";
import minus from "./img/minus.svg"
import plus from "./img/plus.svg"
import volumeOn from "./img/volumeon.svg"
import volumeOff from "./img/volumeoff.svg"
import turtle from "./img/turtle.svg"
import rabbit from "./img/rabbit.svg"




// keys for dymaically creating and accessing state properties
export const keys = { 
volKey : "volume",
actKey : "activity",
volDriftKey : "volDriftVelocity",
actDriftKey : "actDriftVelocity",
disabledKey : "disabled",
patKey : "pattern",
seqKey : "currentSequence",
showTrack : "showTrack",
nowPlaying : "nowPlaying"
}
export const seqLength = 32;
const chordOptions = ["G","A","B","C","D","E"],
barOptions = [1,2,4,8],
tempoChangeOptions = [8,16],
drumChangeOptions= [4,8,12],
FXLength = 6000,
maxBpm = 150,
minBpm = 50,
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
      this.setState({ ...newSeqState });
    });
  }

  handleDriftToggle() {
    let newDriftState: any = {};
    newDriftState.drifting = !this.state.drifting;
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
          if (track.kind === "inst") {
            let newSeqState: any = {};
            newSeqState[keys.seqKey + index] = updateSeqChords(
              this.state.currentChord,
              soundSources[index].sounds,
              this.state[keys.seqKey + index]
            );
            this.setState({ ...newSeqState });
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
      let newSeq: any = {};
      newSeq[keys.seqKey + index] = buildFromPattern(
        value - 1,
        soundSources[index].patterns,
        soundSources[index].sounds
      );
      this.setState({ ...newSeq });
    });
  }

  updateMasterSeq() {
    this.setState({ lastPlayTime: performance.now() });
    let sixteenth = (60 / this.state.bpm / 4) * 1000;
    setTimeout(this.updateMasterSeq, sixteenth);

    if (this.state.playing) {
      if (this.state.drifting) {
        //check if track properties should 'drift'
        soundSources.forEach((track: any, index: number) => {
          let newVolDriftVelocity: any = {};
          let newActDriftVelocity: any = {};
            let newVolumeObj = updateDrift(
              this.state[keys.volKey + index],
              this.state[keys.volDriftKey + index],
              100,
              0
            );
            newVolDriftVelocity[keys.volDriftKey + index] =
              newVolumeObj.velocity;
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
          
        });
      }

      let newSeqState = { ...this.state.masterSeq };

      // play sounds
      let whosPlaying = playSequencers(this.state);
      this.setState({ ...whosPlaying });
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
      updateGraphics(this.state);

    window.requestAnimationFrame(this.appLoop);
  }

  componentDidMount() {
    initSoundPlayer(this.state);
    initGraphics();

    soundSources.forEach((sound: any, index: number) => {
      if (sound.kind === "inst") {
        let newSeq: any = {};
        newSeq[keys.seqKey + index] = buildFromActivity(
          initState.currentChord,
          soundSources[index].sounds,
          soundSources[index].initActivity,
          soundSources[index].minSoundsInSequence,
          soundSources[index].maxSoundsInSequence
        );
        this.setState({ ...newSeq });
      }
      if (sound.kind === "drum") {
        let newSeq: any = {};
        newSeq[keys.seqKey + index] = buildFromPattern(
          soundSources[index].initPattern,
          soundSources[index].patterns,
          soundSources[index].sounds
        );
        this.setState({ ...newSeq });
      }
    });

    let sixteenth = (60 / this.state.bpm / 4) * 1000;
    setTimeout(this.updateMasterSeq, sixteenth);

    setTimeout(this.appLoop, 100);
  }

  render() {
    return (
      <div className="UIContainer">
        <div className="UILeft">
          <LeftContainer
            UIIndex={0}
            tracks={this.state}
            handleVolumeChange={this.handleVolumeChange}
            handleActivityChange={this.handleActivityChange}
            handleDisableToggle={this.handleDisableToggle}
            handlePatternChange={this.handlePatternChange}
          />
        </div>
        <div className="UIRight">
          <DrumContainer
            UIIndex={1}
            tracks={this.state}
            handleVolumeChange={this.handleVolumeChange}
            handlePatternChange={this.handlePatternChange}
            handleDisableToggle={this.handleDisableToggle}
            showUI={this.state.showDrumUI}
          />
          <PlayContainer
            bpm={this.state.bpm}
            playing={this.state.playing}
            drifting={this.state.drifting}
            handleDriftToggle={this.handleDriftToggle}
            handleBpmChange={this.handleBpmChange}
            handlePlayingToggle={this.handlePlayingToggle}
          />
          {/*
          <FXContainer
            UIIndex={2}
            tracks={this.state}
            handleVolumeChange={this.handleVolumeChange}
            handleDriftToggle={this.handleDriftToggle}
            handleDisableToggle={this.handleDisableToggle}
            showUI={this.state.showFxUI}
          />
          */}
                  <ChordContainer
          currentChord={this.state.currentChord}
          handleChordClick={this.handleChordClick}
          showUI={this.state.showInstUI}
        />
        </div>

      </div>
    );
  }
} 

const LeftContainer = React.memo(function InstrumentContainer(props: any) {
  return (
      <div className="instrumentContainer">
        {soundSources.map((track: any, index: number) => {
          if (track.kind === "inst")
            return (
              <TrackContainer
                index={index}
                volume={props.tracks[keys.volKey + index]}
                range2Value={props.tracks[keys.actKey + index]}
                disabled={props.tracks[keys.disabledKey + index]}
                range2Label={"Activity: "}
                range2Min={0}
                range2Max={100}
                range2Step={1}
                kind={track.kind}
                showTrack={props.tracks[keys.showTrack + index]}
                nowPlaying={props.tracks[keys.nowPlaying + index]}
                handleVolumeChange={props.handleVolumeChange}
                handleActivityChange={props.handleActivityChange}
                handlePatternChange={props.handlePatternChange}
                handleDisableToggle={props.handleDisableToggle}
              />
            );
        })}
      </div>
  );
})

const TrackContainer = React.memo(function TrackUI(props: any) {
  let colorStr = colors[props.index].toString(16);
  colorStr = "#".concat(colorStr);

  let indicatorClass = "trackIndicator";
  let flexDirection :any,
  icon1 = volumeOff,
  icon2 = volumeOn,
  icon3 = minus,
  icon4 = plus;

  if (props.kind === "inst") {
    indicatorClass += " inst";
    flexDirection = "row";
  } else {
    indicatorClass += " drum";
    flexDirection = "row-reverse";
  }
  let disabled: string;
  let shadow: string;
  props.disabled ? (disabled = "disabled") : (disabled = "");
  props.nowPlaying
    ? (shadow = `0px 0px 15px #${colors[props.index].toString(16)}`)
    : (shadow = `0px 0px 5px #${colors[props.index].toString(16)}`);
  if (props.disabled) {
    indicatorClass += " disabled";
  }
  return (
    <div className="trackContainer"
      style = {{flexDirection: flexDirection}}>
      <div
        className={indicatorClass}
        style={{
          backgroundColor: colorStr,
          boxShadow: shadow,
        }}
        onClick={() => props.handleDisableToggle(props.disabled, props.index)}
      ></div>
      {!props.disabled ? (
        <div className="trackUI">
          <IconContainer icon1={icon1} icon2={icon3} />
          <div className="trackSliders">
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
            {props.kind === "inst" ? (
              <p>
                <ControlledSlider
                  value={props.range2Value}
                  onChange={props.handleActivityChange}
                  disabled={props.disabled}
                  index={props.index}
                  min={props.range2Min}
                  max={props.range2Max}
                  step={props.range2Step}
                />
              </p>
            ) : (
              <p>
                <ControlledSlider
                  value={props.range2Value}
                  onChange={props.handlePatternChange}
                  disabled={props.disabled}
                  index={props.index}
                  min={1}
                  max={soundSources[props.index].patterns.length}
                  step={props.range2Step}
                />
              </p>
            )}
          </div>
          <IconContainer icon1={icon2} icon2={icon4} />
        </div>
      ) : (
        ""
      )}
    </div>
  );
});

const DrumContainer = React.memo(function DrumContainer(props: any) {
  return (
      <div className="drumContainer">
        {soundSources.map((track: any, index: number) => {
          if (track.kind === "drum")
            return (
              <TrackContainer
                index={index}
                volume={props.tracks[keys.volKey + index]}
                range2Value={props.tracks[keys.actKey + index]}
                disabled={props.tracks[keys.disabledKey + index]}
                range2Label={"Activity: "}
                range2Min={0}
                range2Max={100}
                range2Step={1}
                kind={track.kind}
                showTrack={props.tracks[keys.showTrack + index]}
                nowPlaying={props.tracks[keys.nowPlaying + index]}
                handleVolumeChange={props.handleVolumeChange}
                handleActivityChange={props.handleActivityChange}
                handlePatternChange={props.handlePatternChange}
                handleDisableToggle={props.handleDisableToggle}
              />
            );
        })}


      </div>
  );
});

const PlayContainer = React.memo(function PlayContainer(props: any) {
  let selectClass = "";
  if (props.drifting){selectClass = " selected"}
  return (
    <div className="playContainer">

      <div className="bpmslider">
        <img className="speedIcon" src={turtle} />
        <ControlledSlider
          index={0}
          value={props.bpm}
          onChange={props.handleBpmChange}
          min={minBpm}
          max={maxBpm}
        />
        <img className="speedIcon" src={rabbit} />
      </div>
      <div className = {"buttonContainer"}>
      <button onClick={props.handleDriftToggle} className = {selectClass}>
        EVOLVE
      </button>
      <button onClick={props.handlePlayingToggle}>
        {props.playing ? "PAUSE" : "PLAY"}
      </button>
      </div>
    </div>
  );
});

const FXContainer = React.memo(function FXContainer(props: any) {
  return (
    <div className="fxdiv">
      <div className="fxContainer">
        {soundSources.map((track: any, index: number) => {
          if (track.kind === "fx") {
            return (
              <FXUI
                index={index}
                volume={props.tracks[keys.volKey + index]}
                disabled={props.tracks[keys.disabledKey + index]}
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
    <div className="trackUI">
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
    </div>
  );
})

function ChordContainer(props: any) {
  return (
    <div>
      {props.showUI ? (
        <div className="chordContainer">
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

function IconContainer(props: any){
  return (
    <div className = "iconContainer">
      <img className = "icon" src = {props.icon1}></img>
      <img className = "icon" src = {props.icon2}></img>
    </div>
  )
}

function ChordButton(props : any){
  return (
    <div className = "chordButton">
      <button onClick = { () => props.handleChordClick(props.value) }>
      {props.name}</button>
    </div>
  )
}

function ControlledSlider(props : any){
  function handleChange(event : any){
    props.onChange(event.target.value, props.index)
  }
  let disabled : string;
  props.disabled ? disabled = "disabled" : disabled = "";
  return (
    <input
    className={"slider "+ disabled}
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
  initState.drifting = false;

  initState.showInstUI = true;
  initState.showDrumUI = false;
  initState.showFxUI = false;

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
        initState[keys.disabledKey + index] = soundSources[index].initDisabled;
        initState[keys.showTrack + index] = false;
        initState[keys.nowPlaying + index] = false;
        break;
  
      case "drum":
        initState[keys.volKey + index] = soundSources[index].initVolume;
        initState[keys.volDriftKey + index] = 0;
        initState[keys.disabledKey + index] = soundSources[index].initDisabled;
        initState[keys.patKey + index] = soundSources[index].initPattern + 1;
        initState[keys.nowPlaying + index] = false;
        break;

      case "fx":
        initState[keys.volKey + index] = soundSources[index].initVolume;
        initState[keys.volDriftKey + index] = 0;
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
  let whosPlaying : any = {};
  soundSources.forEach((track: any, index: any) => {
    whosPlaying[keys.nowPlaying + index] = false;
    if (!state[keys.disabledKey + index]) {
      if (track.kind === "inst" || track.kind === "drum") {
        let soundIndex =
          state[keys.seqKey + index][state.masterSeq.currentSequencePos];
        if (!isNaN(soundIndex)) {
          soundSources[index].sounds[soundIndex].howl.play();
          whosPlaying[keys.nowPlaying + index] = true;
          ripple(index, state[keys.volKey + index], state.masterSeq.currentSequencePos)
        }
      }
    }
  });
  return whosPlaying;
}

export default App;

