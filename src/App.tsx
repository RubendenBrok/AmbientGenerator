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
import rain from "./img/rain.svg"
import trees from "./img/trees.svg"
import gramophone from "./img/gramophone.svg"
import play from "./img/play.svg"
import pause from "./img/pause.svg"

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
const chords = [{
  value: "G",
  name: "G"
},{
  value: "A",
  name: "Am"
},{
  value: "B",
  name: "Bm"
},{
  value: "C",
  name: "C"
},{
  value: "D",
  name: "D"
},{
  value: "E",
  name: "Em"
}],
chordChangeOptions = [2,4,8],
drumChangeOptions = [2,4,8,16],
tempoChangeOptions = [8,16],
FXLength = 6000,
maxBpm = 150,
minBpm = 50,
bpmVariance = 8,
fxIcons = [gramophone, rain, trees];

let amountOfSoundsLoaded = 0;
const amountOfSounds = soundSources.reduce((total : number, track : any) => {
  return total + track.sampleLoader.length;
}, 0)

export const increaseLoadedSounds = ()=>{amountOfSoundsLoaded++;}


// initialize state from soundsources object, create properties for every track
const initState: any = {};
initializeState();

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
    this.handleChordUIToggle = this.handleChordUIToggle.bind(this);
    this.handleFxUIToggle = this.handleFxUIToggle.bind(this);
    this.handlePatternChange = this.handlePatternChange.bind(this);
    this.handleBpmChange = this.handleBpmChange.bind(this);
    this.handleChordClick = this.handleChordClick.bind(this);
    this.handleChordChange = this.handleChordChange.bind(this);
    this.handlePlayingToggle = this.handlePlayingToggle.bind(this);
    this.startApp = this.startApp.bind(this);
    this.animateLoadingScreen = this.animateLoadingScreen.bind(this);
  }

  startApp() {
    this.setState({ appStarted: true }, () => {
      let sixteenth = (60 / this.state.bpm / 4) * 1000;
      setTimeout(this.updateMasterSeq, sixteenth);
      setTimeout(this.appLoop, 100);
      setTimeout(() => this.setState({hideOpeningScreen : true}), 500)
    });
  }

  animateLoadingScreen() {
    if (!this.state.loaded){
      let newPoints = [...this.state.loadingAnimPoints];
      newPoints.push(".");
      if (newPoints.length > 4) {newPoints.length = 0;}
      this.setState({loadingAnimPoints : newPoints})
      setTimeout(this.animateLoadingScreen, 500)
    }
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
    newDriftState.masterSeq = this.state.masterSeq;
    newDriftState.masterSeq.newDrumSeq =
      this.state.masterSeq.newDrumSeq + randomArrEntry(drumChangeOptions);
    this.setState({ ...newDriftState });
  }

  handleDisableToggle(value: boolean, index: number) {
    let newDisabledState: any = {};
    newDisabledState[keys.disabledKey + index] = !value;
    if (!value) {
      stopAllSounds(index);
    }
    this.setState({ ...newDisabledState });
  }

  handleChordUIToggle() {
    let newUIState: any = {};
    newUIState.showChordUI = !this.state.showChordUI;
    this.setState({ ...newUIState });
  }

  handleFxUIToggle() {
    let newUIState: any = {};
    newUIState.showFxUI = !this.state.showFxUI;
    this.setState({ ...newUIState });
  }

  handleChordClick(index: number) {
    let newSeq = this.state.masterSeq;
    newSeq.progression[index] = newSeq.progression[index] + 1;
    if (newSeq.progression[index] >= chords.length) {
      newSeq.progression[index] = 0;
    }
    if (newSeq.currentBarInProgression === index) {
      this.handleChordChange(chords[newSeq.progression[index]].value);
    }
  }

  handleChordChange(chord: string) {
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

        //handle cycling through the chord progression
        newSeqState.currentBarInProgression++;
        if (newSeqState.currentBarInProgression > 3) {
          newSeqState.currentBarInProgression = 0;
        }
        if (
          chords[newSeqState.progression[newSeqState.currentBarInProgression]]
            .value !== this.state.currentChord
        ) {
          this.handleChordChange(
            chords[newSeqState.progression[newSeqState.currentBarInProgression]]
              .value
          );
        }

        //should the tempo randomly change?
        if (this.state.drifting) {
          if (newSeqState.barsPlayed >= newSeqState.tempoChangeTimer) {
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
          if (newSeqState.barsPlayed >= newSeqState.newDrumSeq) {
            soundSources.forEach((track: any, index: number) => {
              if (track.kind === "drum") {
                this.handlePatternChange(
                  Math.floor(Math.random() * track.patterns.length) + 1,
                  index
                );
              }
            });
            newSeqState.newDrumSeq =
              randomArrEntry(drumChangeOptions) + newSeqState.barsPlayed;
          }

          //should the chords randomly change?
          if (newSeqState.barsPlayed >= newSeqState.newChord) {
            let changeIndex = Math.floor(
              Math.random() * newSeqState.progression.length
            );
            newSeqState.progression[changeIndex] = Math.floor(
              Math.random() * chords.length
            );
            newSeqState.newChord =
              randomArrEntry(chordChangeOptions) + newSeqState.barsPlayed;
            if (newSeqState.barsPlayed % 4 === changeIndex) {
              this.handleChordChange(
                chords[newSeqState.progression[changeIndex]].value
              );
            }
          }
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
    console.log(amountOfSounds)
    this.animateLoadingScreen();
    initSoundPlayer();
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

    
    window.addEventListener("load", () => {
      this.setState({ loaded: true });
    });
    
   //setTimeout(()=>this.setState({ loaded: true }), 1000)
  }

  render() {
    return (
          <div className="UIContainer">
            <LoadingScreen
            loaded={this.state.loaded}
            started={this.state.appStarted}
            hideOpeningScreen={this.state.hideOpeningScreen}
            startApp={this.startApp}
            loadingAnimPoints={this.state.loadingAnimPoints}
            totalSounds={amountOfSounds}
            loadedSounds={amountOfSoundsLoaded}
            />
            <FlowButton
              drifting={this.state.drifting}
              handleDriftToggle={this.handleDriftToggle}
            />
            <div className="UILeft">
              <InstContainer
                state={this.state}
                handleVolumeChange={this.handleVolumeChange}
                handleActivityChange={this.handleActivityChange}
                handleDisableToggle={this.handleDisableToggle}
                handlePatternChange={this.handlePatternChange}
              />
              <ChordContainer
                currentChord={this.state.currentChord}
                currentBarInProgression={
                  this.state.masterSeq.currentBarInProgression
                }
                progression={this.state.masterSeq.progression}
                handleChordClick={this.handleChordClick}
                showUI={this.state.showChordUI}
                handleChordUIToggle={this.handleChordUIToggle}
              />
            </div>
            <div className="UIRight">
              <DrumContainer
                tracks={this.state}
                handleVolumeChange={this.handleVolumeChange}
                handlePatternChange={this.handlePatternChange}
                handleDisableToggle={this.handleDisableToggle}
                showUI={this.state.showDrumUI}
              />
              <FXContainer
                UIIndex={2}
                tracks={this.state}
                handleVolumeChange={this.handleVolumeChange}
                handleFxUIToggle={this.handleFxUIToggle}
                showUI={this.state.showFxUI}
              />
              <PlayContainer
                bpm={this.state.bpm}
                playing={this.state.playing}
                handleBpmChange={this.handleBpmChange}
                handlePlayingToggle={this.handlePlayingToggle}
              />
            </div>
          </div>

    );
  }
} 

const LoadingScreen = React.memo(function LoadingScreen(props: any) {
  let opacityClass: string;
  let displayStr: string;
  if (props.hideOpeningScreen) {
    displayStr = "none";
  } else {
    displayStr = "block";
  }
  if (props.started) {
    opacityClass = "hide";
  } else {
    opacityClass = "show";
  }
  return (

    <div
      className={"loadingContainer " + opacityClass}
      style={{ display: displayStr }}
    >
      <div className="quoteContainer">
        <div className="quote" id="quote1">
          <div>
            <h2>
              <i>noun: </i>
              <b>flow</b>
            </h2>
          </div>
          <ul>
            <li>
              the action or fact of moving along in a steady, continuous stream.
            </li>
            <li>a steady, continuous stream or supply of something.</li>
            <li>
              the gradual permanent deformation of a solid under stress, without
              melting.
            </li>
          </ul>
        </div>

        <div className="quote" id="quote2">
          “The only way to make sense out of change is to plunge into it, move
          with it, and join the dance.”
          <br />
          <i>― Alan Wilson Watts</i>
        </div>
      </div>
      {props.loaded ? (
        <div className="startButton" onClick={props.startApp}>
          Start
          <div className="hoverLine"></div>
        </div>
      ) : (
        <div className="loadingBox">
          <div>
          {"Loading sounds"+props.loadingAnimPoints.join("")}
        </div>
        <div>
          {props.loadedSounds + " of " + props.totalSounds}
        </div>
        </div>

      )}
    </div>
  );
});

const InstContainer = React.memo(function InstrumentContainer(props: any) {
  return (
    <div className="instrumentContainer">
      {soundSources.map((track: any, index: number) => {
        if (track.kind === "inst")
          return (
            <TrackContainer
              index={index}
              key={index}
              volume={props.state[keys.volKey + index]}
              range2Value={props.state[keys.actKey + index]}
              disabled={props.state[keys.disabledKey + index]}
              range2Min={0}
              range2Max={100}
              range2Step={1}
              kind={track.kind}
              showTrack={props.state[keys.showTrack + index]}
              nowPlaying={props.state[keys.nowPlaying + index]}
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
  let flexDirection: any;

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
    <div className="trackContainer" style={{ flexDirection: flexDirection }} id={"track"+props.index}>
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
          <div className="trackSliderContainer">
            <div className = "trackSlider">
              <IconContainer icon1={volumeOff} />
              <ControlledSlider
                value={props.volume}
                onChange={props.handleVolumeChange}
                disabled={props.disabled}
                index={props.index}
                min={0}
                max={100}
                step={1}
              />
              <IconContainer icon1={volumeOn} />
            </div>
            {props.kind === "inst" ? (
              <div  className = "trackSlider">
                <IconContainer icon1={minus} />
                <ControlledSlider
                  value={props.range2Value}
                  onChange={props.handleActivityChange}
                  disabled={props.disabled}
                  index={props.index}
                  min={props.range2Min}
                  max={props.range2Max}
                  step={props.range2Step}
                />
                <IconContainer icon1={plus} />
              </div>
            ) : (
              <div  className = "trackSlider">
                <IconContainer icon1={minus} />
                <ControlledSlider
                  value={props.range2Value}
                  onChange={props.handlePatternChange}
                  disabled={props.disabled}
                  index={props.index}
                  min={1}
                  max={soundSources[props.index].patterns.length}
                  step={props.range2Step}
                />
                <IconContainer icon1={plus} />
              </div>
            )}
          </div>
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
                key={index}
                volume={props.tracks[keys.volKey + index]}
                range2Value={props.tracks[keys.patKey + index]}
                disabled={props.tracks[keys.disabledKey + index]}
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
  let playIcon : string;
  props.playing ? playIcon = pause : playIcon = play;
  return (
    <div className="playContainer">

      <div className="bpmslider">
        <img className="speedIcon" src={turtle} />
        <ControlledSlider
          vertical={true}
          index={0}
          value={props.bpm}
          onChange={props.handleBpmChange}
          min={minBpm}
          max={maxBpm}
        />
        <img className="speedIcon" src={rabbit} />
      </div>
      <div className = {"buttonContainer"}>
      <div className="button" onClick={props.handlePlayingToggle}
      style = {{backgroundImage: "url("+playIcon+")"}}>
      </div>
      </div>
    </div>
  );
});

const FlowButton = React.memo(function FlowButton(props:any){
  let selectClass = "";
  if (props.drifting){selectClass = " drifting"}
  return(
  <div onClick={props.handleDriftToggle} className = {"driftButton" + selectClass} id = "driftButton">
  FLOW
  <div className="hoverLine"></div>

</div>
  )
})

const FXContainer = React.memo(function FXContainer(props: any) {
  let fxIndex = -1;
  return (
    <div className="fxContainer">
      {props.showUI?(
      <div className="fxUI trackSliders">
        {soundSources.map((track: any, index: number) => {
          if (track.kind === "fx") {
            fxIndex ++;
            return (
              <FXUI
                index={index}
                fxIndex={fxIndex}
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
      ) : (
        <div className = "fxIndicator" onClick={props.handleFxUIToggle}>FX</div>
      )}
    </div>
  );
})

const FXUI = React.memo(function FXUI(props: any){
  return (
    <div className="fxSlider">
      <IconContainer icon1={""}/>
      <div className="">
        <ControlledSlider
          value={props.volume}
          onChange={props.handleVolumeChange}
          disabled={props.disabled}
          index={props.index}
          min={0}
          max={100}
          step={1}
        />
      </div>
      <IconContainer icon1={fxIcons[props.fxIndex]}/>
    </div>
  );
})

function ChordContainer(props: any) {
  return (
    <div className = "chordContainer">
        {props.showUI ? (
        <div className="chordProgression">
          <ChordButton
            value = {chords[props.progression[0]].value}
            name = {chords[props.progression[0]].name}
            currentBarInProgression = {props.currentBarInProgression}
            index = {0}
            handleChordClick={props.handleChordClick}
            id = "firstChord"
          />
          <ChordButton
            value = {chords[props.progression[1]].value}
            name = {chords[props.progression[1]].name}
            currentBarInProgression = {props.currentBarInProgression}

            index = {1}
            handleChordClick={props.handleChordClick}
            id = "secondChord"
          />
          <ChordButton
            value = {chords[props.progression[2]].value}
            name = {chords[props.progression[2]].name}
            currentBarInProgression = {props.currentBarInProgression}

            index = {2}
            handleChordClick={props.handleChordClick}
            id = "thirdChord"
          />
          <ChordButton
            value = {chords[props.progression[3]].value}
            name = {chords[props.progression[3]].name}
            currentBarInProgression = {props.currentBarInProgression}

            index = {3}
            handleChordClick={props.handleChordClick}
            id = "lastChord"
          />
        </div>

        ) : (
          <div onClick = {()=> props.handleChordUIToggle()} className = "chordsButton">Change Chord Progression</div>
        )}
    </div>
  );
}

function IconContainer(props: any){
  return (
    <div className = "iconContainer">
      <img className = "icon" src = {props.icon1}></img>
    </div>
  )
}

function ChordButton(props: any) {
  let extraClass = "";
  if (props.currentBarInProgression === props.index){extraClass = " currentChord"}
  return (
    <div
      className={"chordButton" + extraClass}
      onClick={() => props.handleChordClick(props.index)}
      id = {props.id}
    >
      {props.name}
    </div>
  );
}

function ControlledSlider(props : any){
  function handleChange(event : any){
    props.onChange(event.target.value, props.index)
  }
  let verticalClass = ""
  if (props.vertical){verticalClass = " vertical"}
  let disabled : string;
  props.disabled ? disabled = "disabled" : disabled = "";
  return (
    <input
    className={"slider "+ disabled + verticalClass}
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

function initializeState(){
  initState.bpm = 90;
  initState.playing = true;
  initState.drifting = false;

  initState.showChordUI = false;
  initState.showFxUI = false;

  initState.appStarted = false;
  initState.loaded = false;
  initState.hideOpeningScreen = false;
  initState.loadingAnimPoints = [];


  initState.masterSeq = {
    currentSequencePos : 0,
    lastPlayTime: performance.now(),
    barsPlayed : 0,
    FXTimer: -FXLength,
    newDrumSeq: randomArrEntry(drumChangeOptions),
    newChord: randomArrEntry(chordChangeOptions),
    tempoChangeTimer: randomArrEntry(tempoChangeOptions),
    currentBarInProgression : 0,
    progression : [5, 5, 4, 3],
  }

  initState.currentChord = chords[initState.masterSeq.progression[0]].value;

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

