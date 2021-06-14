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
  updateActivity,
} from "./soundplayer";

import { MobileUI } from "./mobileui";
import HelpScreen from "./helpscreen";
import { soundSources } from "./soundsources";
import ChordContainer from "./chordcontainer";
import LoadingScreen from "./loadingscreen";
import "./App.css";
import {
  updateGraphics,
  initGraphics,
  ripple,
  colors,
  screenResize,
} from "./visuals";
import minus from "./img/minus.svg";
import plus from "./img/plus.svg";
import volumeOn from "./img/volumeon.svg";
import volumeOff from "./img/volumeoff.svg";
import turtle from "./img/turtle.svg";
import rabbit from "./img/rabbit.svg";
import rain from "./img/rain.svg";
import trees from "./img/trees.svg";
import gramophone from "./img/gramophone.svg";
import play from "./img/play.svg";
import pause from "./img/pause.svg";

// keys for dymaically creating and accessing state properties
export const keys = {
  volKey: "volume",
  actKey: "activity",
  volDriftKey: "volDriftVelocity",
  actDriftKey: "actDriftVelocity",
  disabledKey: "disabled",
  patKey: "pattern",
  seqKey: "currentSequence",
  showTrack: "showTrack",
  nowPlaying: "nowPlaying",
};
export const seqLength = 32;
export const chords = [
    {
      value: "G",
      name: "G",
    },
    {
      value: "A",
      name: "Am",
    },
    {
      value: "B",
      name: "Bm",
    },
    {
      value: "C",
      name: "C",
    },
    {
      value: "D",
      name: "D",
    },
    {
      value: "E",
      name: "Em",
    },
  ],
  chordChangeOptions = [2, 4, 8],
  drumChangeOptions = [2, 4, 8, 16],
  tempoChangeOptions = [8, 16],
  FXLength = 6000,
  bpmVariance = 8,
  fxIcons = [gramophone, rain, trees];
export const mobile = 650,
  maxBpm = 150,
  minBpm = 50;

export let amountOfSoundsLoaded = 0;
export const amountOfSounds = soundSources.reduce(
  (total: number, track: any) => {
    return total + track.sampleLoader.length;
  },
  0
);

export const increaseLoadedSounds = () => {
  amountOfSoundsLoaded++;
};

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
    this.loadChecker = this.loadChecker.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleTrackSelect = this.handleTrackSelect.bind(this);
    this.handleVolumeClick = this.handleVolumeClick.bind(this);
    this.handleActivityClick = this.handleActivityClick.bind(this);
    this.handlePatternClick = this.handlePatternClick.bind(this);
    this.toggleHelp = this.toggleHelp.bind(this);
  }

  startApp() {
    this.setState({ appStarted: true }, () => {
      let sixteenth = (60 / this.state.bpm / 4) * 1000;
      setTimeout(this.updateMasterSeq, sixteenth);
      setTimeout(this.appLoop, 100);
      setTimeout(() => this.setState({ hideOpeningScreen: true }), 500);
    });
  }

  toggleHelp() {
    this.setState({ showHelp: !this.state.showHelp });
  }

  handleTrackSelect(index: number, selected: boolean) {
    let newSelectState = [...this.state.trackSelected];
    newSelectState[index] = selected;
    this.setState({ trackSelected: newSelectState });
  }

  animateLoadingScreen() {
    if (!this.state.loaded) {
      let newPoints = [...this.state.loadingAnimPoints];
      newPoints.push(".");
      if (newPoints.length > 4) {
        newPoints.length = 0;
      }
      this.setState({ loadingAnimPoints: newPoints });
      setTimeout(this.animateLoadingScreen, 500);
    }
  }

  handleVolumeChange(value: any, index: number) {
    let newVolumeState: any = {};
    newVolumeState[keys.volKey + index] = parseFloat(value);
    this.setState({ ...newVolumeState }, () =>
      setTrackVolume(this.state[keys.volKey + index], index)
    );
  }

  handleVolumeClick(amt: number, index: number) {
    let newVol = this.state[keys.volKey + index] + amt;
    newVol = Math.min(Math.max(newVol, 0), 100);
    this.handleVolumeChange(newVol, index);
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

  handleActivityClick(amt: number, index: number) {
    let newAct = this.state[keys.actKey + index] + amt;
    newAct = Math.min(Math.max(newAct, 0), 100);
    this.handleActivityChange(newAct, index);
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

  handleChordClick(index: number, amt: number) {
    let newSeq = { ...this.state.masterSeq };
    newSeq.progression[index] += amt;
    if (newSeq.progression[index] >= chords.length) {
      newSeq.progression[index] = 0;
    }
    if (newSeq.progression[index] < 0) {
      newSeq.progression[index] = chords.length - 1;
    }
    this.setState({ ...newSeq }, () => {
      if (newSeq.currentBarInProgression === index) {
        this.handleChordChange(chords[newSeq.progression[index]].value);
      }
    });
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

  handlePatternClick(amt: number, index: number) {
    let newPat = this.state[keys.patKey + index] + amt;
    newPat = Math.min(Math.max(newPat, 1), soundSources[index].patterns.length);
    this.handlePatternChange(newPat, index);
  }

  updateMasterSeq() {
    let sixteenth = (60 / this.state.bpm / 4) * 1000;
    setTimeout(this.updateMasterSeq, sixteenth);

    let { masterSeq, ...newState }: any = { ...this.state };

    newState.lastPlayTime = performance.now();

    if (this.state.playing) {
      if (this.state.drifting) {
        //check if track properties should 'drift'
        soundSources.forEach((track: any, index: number) => {
          let newVolumeObj = updateDrift(
            newState[keys.volKey + index],
            newState[keys.volDriftKey + index],
            100,
            0
          );
          newState[keys.volDriftKey + index] = newVolumeObj.velocity;
          newState[keys.volKey + index] = newVolumeObj.value;
          setTrackVolume(newState[keys.volKey + index], index);

          if (track.kind === "inst") {
            let newActivityObj = updateDrift(
              newState[keys.actKey + index],
              newState[keys.actDriftKey + index],
              100,
              0
            );
            newState[keys.actDriftKey + index] = newActivityObj.velocity;
            newState[keys.actKey + index] = newActivityObj.value;
            newState[keys.seqKey + index] = updateActivity(
              newState.currentChord,
              soundSources[index].sounds,
              newState[keys.actKey + index],
              soundSources[index].minSoundsInSequence,
              soundSources[index].maxSoundsInSequence,
              newState[keys.seqKey + index]
            );
          }
        });
      }

      // play sounds
      let whosPlaying = playSequencers(this.state);
      soundSources.forEach((track: any, index: any) => {
        if (track.kind === "inst" || track.kind === "drum") {
          newState[keys.nowPlaying + index] =
            whosPlaying[keys.nowPlaying + index];
        }
      });

      masterSeq.currentSequencePos++;
      if (masterSeq.currentSequencePos >= seqLength) {
        masterSeq.currentSequencePos = 0;
        masterSeq.barsPlayed++;

        //handle cycling through the chord progression
        masterSeq.currentBarInProgression++;
        if (masterSeq.currentBarInProgression > 3) {
          masterSeq.currentBarInProgression = 0;
        }
        if (
          chords[masterSeq.progression[masterSeq.currentBarInProgression]]
            .value !== newState.currentChord
        ) {
          newState.currentChord =
            chords[
              masterSeq.progression[masterSeq.currentBarInProgression]
            ].value;
          console.log(newState);
          soundSources.forEach((track: any, index: any) => {
            if (track.kind === "inst") {
              newState[keys.seqKey + index] = updateSeqChords(
                newState.currentChord,
                soundSources[index].sounds,
                newState[keys.seqKey + index]
              );
            }
          });
        }

        //should the tempo randomly change?
        if (newState.drifting) {
          if (masterSeq.barsPlayed >= masterSeq.tempoChangeTimer) {
            masterSeq.tempoChangeTimer =
              masterSeq.barsPlayed + randomArrEntry(tempoChangeOptions);
            let newBpm = newState.bpm;
            newBpm -= bpmVariance;
            newBpm += Math.round(bpmVariance * 2 * Math.random());
            if (newBpm > maxBpm) {
              newBpm = maxBpm;
            }
            if (newBpm < minBpm) {
              newBpm = minBpm;
            }
            newState.bpm = newBpm;
          }

          // should a sequence mutate/evolve?
          soundSources.forEach((track: any, index: number) => {
            if (!newState[keys.disabledKey + index]) {
              if (track.kind === "inst") {
                if (Math.random() < track.mutationChance) {
                  newState[keys.seqKey + index] = randomMutation(
                    1,
                    newState[keys.seqKey + index],
                    soundSources[index].sounds,
                    true,
                    newState.currentChord
                  );
                }
              }
              if (track.kind === "drum") {
                if (Math.random() < track.mutationChance) {
                  newState[keys.seqKey + index] = randomMutation(
                    1,
                    newState[keys.seqKey + index],
                    soundSources[index].sounds,
                    false,
                    newState.currentChord
                  );
                }
              }
            }
          });

          // should the drums change to a new pattern?
          if (masterSeq.barsPlayed >= masterSeq.newDrumSeq) {
            soundSources.forEach((track: any, index: number) => {
              if (track.kind === "drum") {
                newState[keys.patKey + index] =
                  Math.floor(Math.random() * track.patterns.length) + 1;

                newState[keys.seqKey + index] = buildFromPattern(
                  newState[keys.patKey + index] - 1,
                  soundSources[index].patterns,
                  soundSources[index].sounds
                );
              }
            });
            masterSeq.newDrumSeq =
              randomArrEntry(drumChangeOptions) + masterSeq.barsPlayed;
          }

          //should the chords randomly change?
          if (masterSeq.barsPlayed >= masterSeq.newChord) {
            let changeIndex = Math.floor(
              Math.random() * masterSeq.progression.length
            );
            masterSeq.progression[changeIndex] = Math.floor(
              Math.random() * chords.length
            );
            masterSeq.newChord =
              randomArrEntry(chordChangeOptions) + masterSeq.barsPlayed;
            if (masterSeq.barsPlayed % 4 === changeIndex) {
              newState.currentChord =
                chords[masterSeq.progression[changeIndex]].value;
              soundSources.forEach((track: any, index: any) => {
                if (track.kind === "inst") {
                  newState[keys.seqKey + index] = updateSeqChords(
                    newState.currentChord,
                    soundSources[index].sounds,
                    newState[keys.seqKey + index]
                  );
                }
              });
            }
          }
        }
      }

      //retrigger FX loops if necessary
      if (!this.state.mobile) {
        if (performance.now() - masterSeq.FXTimer > FXLength) {
          playFX(this.state);
          masterSeq.FXTimer = performance.now();
        }
      }
      this.setState({ masterSeq: { ...masterSeq }, ...newState });
    }
  }

  loadChecker() {
    if (amountOfSounds === amountOfSoundsLoaded) {
      this.setState({ loaded: true });
    } else {
      setTimeout(() => this.loadChecker(), 10);
    }
  }

  handleResize() {
    screenResize();
    if (window.innerWidth < mobile && !this.state.mobileUI) {
      this.setState({ mobileUI: true });
    }
    if (window.innerWidth > mobile && this.state.mobileUI) {
      this.setState({ mobileUI: false });
    }
  }

  // main loop
  appLoop() {
    updateGraphics(this.state);
    window.requestAnimationFrame(this.appLoop);
  }

  componentDidMount() {
    this.animateLoadingScreen();
    initSoundPlayer();
    initGraphics(this.state.mobileUI, this.state.hq);
    this.loadChecker();

    window.addEventListener("resize", this.handleResize);
    this.handleResize();

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

    //setTimeout(()=>this.setState({ loaded: true }), 1000)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }

  render() {
    return (
      <div>
        {!this.state.mobileUI &&
          (this.state.showHelp ? (
            <HelpScreen mobile={false} toggleHelp={this.toggleHelp} />
          ) : (
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

              <div className="UILeft">
                <InstContainer
                  state={this.state}
                  handleVolumeChange={this.handleVolumeChange}
                  handleActivityChange={this.handleActivityChange}
                  handleVolumeClick={this.handleVolumeClick}
                  handleActivityClick={this.handleActivityClick}
                  handleDisableToggle={this.handleDisableToggle}
                  handlePatternChange={this.handlePatternChange}
                  handleTrackSelect={this.handleTrackSelect}
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
                  handleVolumeClick={this.handleVolumeClick}
                  handlePatternClick={this.handlePatternClick}
                  showUI={this.state.showDrumUI}
                  handleTrackSelect={this.handleTrackSelect}
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
                {!this.state.showFxUI && (
                  <FlowButton
                    drifting={this.state.drifting}
                    handleDriftToggle={this.handleDriftToggle}
                  />
                )}
                {!this.state.showFxUI && (
                  <div className="helpButton button" onClick={this.toggleHelp}>
                    <div className="mobileHelp">?</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        {this.state.mobileUI && (
          <MobileUI
            state={this.state}
            startApp={this.startApp}
            handleTrackSelect={this.handleTrackSelect}
            handleVolumeChange={this.handleVolumeChange}
            handleActivityChange={this.handleActivityChange}
            handlePatternChange={this.handlePatternChange}
            handleDisableToggle={this.handleDisableToggle}
            handlePlayingToggle={this.handlePlayingToggle}
            handleDriftToggle={this.handleDriftToggle}
            handleBpmChange={this.handleBpmChange}
            handleVolumeClick={this.handleVolumeClick}
            handleActivityClick={this.handleActivityClick}
            handlePatternClick={this.handlePatternClick}
            handleChordUIToggle={this.handleChordUIToggle}
            handleChordClick={this.handleChordClick}
            toggleHelp={this.toggleHelp}
          />
        )}
      </div>
    );
  }
}

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
              handleTrackSelect={props.handleTrackSelect}
              handleVolumeClick={props.handleVolumeClick}
              handleActivityClick={props.handleActivityClick}
            />
          );
      })}
    </div>
  );
});

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
  let shadow: string;
  props.nowPlaying
    ? (shadow = `0px 0px 15px #${colors[props.index].toString(16)}`)
    : (shadow = `0px 0px 5px #${colors[props.index].toString(16)}`);
  if (props.disabled) {
    indicatorClass += " disabled";
  }
  return (
    <div
      className="trackContainer"
      style={{ flexDirection: flexDirection }}
      id={"track" + props.index}
      onMouseOver={() => props.handleTrackSelect(props.index, true)}
      onMouseOut={() => props.handleTrackSelect(props.index, false)}
    >
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
            <div className="trackSlider">
              <IconContainer
                icon1={volumeOff}
                click={() => props.handleVolumeClick(-10, props.index)}
              />
              <ControlledSlider
                value={props.volume}
                onChange={props.handleVolumeChange}
                disabled={props.disabled}
                index={props.index}
                min={0}
                max={100}
                step={1}
              />
              <IconContainer
                icon1={volumeOn}
                click={() => props.handleVolumeClick(10, props.index)}
              />
            </div>
            {props.kind === "inst" ? (
              <div className="trackSlider">
                <IconContainer
                  icon1={minus}
                  click={() => props.handleActivityClick(-10, props.index)}
                />
                <ControlledSlider
                  value={props.range2Value}
                  onChange={props.handleActivityChange}
                  disabled={props.disabled}
                  index={props.index}
                  min={props.range2Min}
                  max={props.range2Max}
                  step={props.range2Step}
                />
                <IconContainer
                  icon1={plus}
                  click={() => props.handleActivityClick(10, props.index)}
                />
              </div>
            ) : (
              <div className="trackSlider">
                <IconContainer
                  icon1={minus}
                  click={() => props.handlePatternClick(-1, props.index)}
                />
                <ControlledSlider
                  value={props.range2Value}
                  onChange={props.handlePatternChange}
                  disabled={props.disabled}
                  index={props.index}
                  min={1}
                  max={soundSources[props.index].patterns.length}
                  step={props.range2Step}
                />
                <IconContainer
                  icon1={plus}
                  click={() => props.handlePatternClick(1, props.index)}
                />
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
              handleTrackSelect={props.handleTrackSelect}
              handleVolumeClick={props.handleVolumeClick}
              handlePatternClick={props.handlePatternClick}
            />
          );
      })}
    </div>
  );
});

const PlayContainer = React.memo(function PlayContainer(props: any) {
  let playIcon: string;
  props.playing ? (playIcon = pause) : (playIcon = play);
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
      <div className={"buttonContainer"}>
        <div
          className="button"
          onClick={props.handlePlayingToggle}
          style={{ backgroundImage: "url(" + playIcon + ")" }}
        ></div>
      </div>
    </div>
  );
});

const FlowButton = React.memo(function FlowButton(props: any) {
  let selectClass = "";
  if (props.drifting) {
    selectClass = " flash";
  }
  return (
    <div
      onClick={props.handleDriftToggle}
      className={"driftButton" + selectClass}
      id="driftButton"
    >
      {props.drifting ? "EVOLVING" : "EVOLVE"}
    </div>
  );
});

const FXContainer = React.memo(function FXContainer(props: any) {
  let fxIndex = -1;
  return (
    <div className="fxContainer">
      {props.showUI ? (
        <div className="fxUI trackSliders">
          {soundSources.map((track: any, index: number) => {
            if (track.kind === "fx") {
              fxIndex++;
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
                  label={soundSources[index].name}
                />
              );
            }
          })}
          <div className="closeButton" onClick={props.handleFxUIToggle}>
            close
          </div>
        </div>
      ) : (
        <div className="fxIndicator" onClick={props.handleFxUIToggle}>
          FX
        </div>
      )}
    </div>
  );
});

const FXUI = React.memo(function FXUI(props: any) {
  return (
    <div className="fxSlider">
      <div className="fxLabel">{props.label}</div>
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
      <IconContainer icon1={fxIcons[props.fxIndex]} />
    </div>
  );
});

export function IconContainer(props: any) {
  return (
    <div className="iconContainer" onClick={props.click}>
      <img className="icon" src={props.icon1}></img>
    </div>
  );
}

export function ControlledSlider(props: any) {
  function handleChange(event: any) {
    props.onChange(event.target.value, props.index);
  }
  let verticalClass = "";
  if (props.vertical) {
    verticalClass = " vertical";
  }
  let disabled: string;
  props.disabled ? (disabled = "disabled") : (disabled = "");
  return (
    <input
      className={"slider " + disabled + verticalClass}
      type="range"
      value={props.value}
      onChange={handleChange}
      disabled={props.disabled}
      min={props.min}
      max={props.max}
      step={props.step}
    ></input>
  );
}

function initializeState() {
  initState.bpm = 90;
  initState.playing = true;
  initState.drifting = false;

  initState.hq = false;

  initState.showChordUI = false;
  initState.showFxUI = false;
  initState.showHelp = false;

  initState.appStarted = false;
  initState.loaded = false;
  initState.hideOpeningScreen = false;
  initState.loadingAnimPoints = [];

  initState.trackSelected = [];
  initState.mobileUI = window.innerWidth < mobile ? true : false;

  initState.masterSeq = {
    currentSequencePos: 0,
    lastPlayTime: performance.now(),
    barsPlayed: 0,
    FXTimer: -FXLength,
    newDrumSeq: randomArrEntry(drumChangeOptions),
    newChord: randomArrEntry(chordChangeOptions),
    tempoChangeTimer: randomArrEntry(tempoChangeOptions),
    currentBarInProgression: 0,
    progression: [5, 5, 4, 3],
  };

  initState.currentChord = chords[initState.masterSeq.progression[0]].value;

  soundSources.forEach((track: any, index: number) => {
    initState.trackSelected.push(false);
    switch (track.kind) {
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
  });
}

export function randomArrEntry(arr: any) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function playSequencers(state: any) {
  let whosPlaying: any = {};
  soundSources.forEach((track: any, index: any) => {
    whosPlaying[keys.nowPlaying + index] = false;
    if (!state[keys.disabledKey + index]) {
      if (track.kind === "inst" || track.kind === "drum") {
        let soundIndex =
          state[keys.seqKey + index][state.masterSeq.currentSequencePos];
        if (!isNaN(soundIndex)) {
          soundSources[index].sounds[soundIndex].howl.play();
          whosPlaying[keys.nowPlaying + index] = true;
          ripple(
            index,
            state[keys.volKey + index],
            state.masterSeq.currentSequencePos
          );
        }
      }
    }
  });
  return whosPlaying;
}

export default App;
