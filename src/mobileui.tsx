import {
  keys,
  amountOfSounds,
  amountOfSoundsLoaded,
  ControlledSlider,
  IconContainer,
} from "./App";
import React, { useState } from "react";
import { soundSources } from "./soundsources";
import { colors } from "./visuals";
import LoadingScreen from "./loadingscreen";

import minus from "./img/minus.svg";
import plus from "./img/plus.svg";
import volumeOn from "./img/volumeon.svg";
import volumeOff from "./img/volumeoff.svg";
import play from "./img/play.svg";
import pause from "./img/pause.svg";
import turtle from "./img/turtle.svg";
import rabbit from "./img/rabbit.svg";

import "./mobile.css";

export const MobileUI = ({
  state,
  startApp,
  handleTrackSelect,
  handleVolumeChange,
  handleActivityChange,
  handlePatternChange,
  handleDisableToggle,
  handlePlayingToggle,
  handleDriftToggle,
  handleBpmChange,
}: any) => {
  const [trackOpen, setTrackOpen] = useState(false);
  const [openIndex, setOpenIndex] = useState(0);

  let playIcon: string;
  state.playing ? (playIcon = pause) : (playIcon = play);

  const handleTrackClick = (index: number, open: boolean) => {
    setTrackOpen(open);
    setOpenIndex(index);
    handleTrackSelect(index, open);
  };

  return (
    <div className="mobileUIContainer">
      <LoadingScreen
        loaded={state.loaded}
        started={state.appStarted}
        hideOpeningScreen={state.hideOpeningScreen}
        startApp={startApp}
        loadingAnimPoints={state.loadingAnimPoints}
        totalSounds={amountOfSounds}
        loadedSounds={amountOfSoundsLoaded}
      />
      {!trackOpen && (
        <div className="mobileUIContainerBase">
          <div className="mobileTrackContainer">
            {soundSources.map((track: any, index: number) => {
              if (track.kind === "drum" || track.kind === "inst") {
                return (
                  <MobileTrackButton
                    handleTrackClick={handleTrackClick}
                    key={index}
                    index={index}
                    nowPlaying={false}
                    disabled={state[keys.disabledKey + index]}
                  />
                );
              }
            })}
          </div>
          <div className={"mobileButtonContainer"}>
            <div
              className="mobileButton"
              onClick={handlePlayingToggle}
              style={{ backgroundImage: "url('" + playIcon + "')" }}
            ></div>
          </div>
        </div>
      )}
      {trackOpen && (
        <MobileTrackEditor
          state={state}
          openIndex={openIndex}
          handleTrackClick={handleTrackClick}
          handleVolumeChange={handleVolumeChange}
          handlePatternChange={handlePatternChange}
          handleActivityChange={handleActivityChange}
          handleDisableToggle={handleDisableToggle}
        />
      )}
    </div>
  );
};

const MobileTrackButton = ({
  handleTrackClick,
  index,
  nowPlaying,
  disabled,
}: any) => {
  let colorStr = colors[index].toString(16);
  colorStr = "#".concat(colorStr);

  let shadow: string;
  nowPlaying
    ? (shadow = `0px 0px 15px #${colors[index].toString(16)}`)
    : (shadow = `0px 0px 5px #${colors[index].toString(16)}`);

  let indicatorClass = "mobileTrackIndicator";

  if (disabled) {
    indicatorClass += " disabled";
  }

  return (
    <div className="mobileTrack">
      <div
        className={indicatorClass}
        style={{
          backgroundColor: colorStr,
          boxShadow: shadow,
        }}
        onClick={() => handleTrackClick(index, true)}
      ></div>
    </div>
  );
};

const MobileTrackEditor = ({
  openIndex,
  nowPlaying,
  state,
  handleTrackClick,
  handleVolumeChange,
  handleActivityChange,
  handlePatternChange,
  handleDisableToggle,
}: any) => {
  let colorStr = colors[openIndex].toString(16);
  colorStr = "#".concat(colorStr);

  let shadow: string;
  nowPlaying
    ? (shadow = `0px 0px 15px #${colors[openIndex].toString(16)}`)
    : (shadow = `0px 0px 5px #${colors[openIndex].toString(16)}`);

  let indicatorClass = "mobileTrackIndicator";

  if (state[keys.disabledKey + openIndex]) {
    indicatorClass += " disabled";
  }

  return (
    <div className="mobileTrackEditor">
      <div className="mobileTrackEditorTop">
        <div className="mobileTrackIndicatorEditor">
          <div
            className={indicatorClass}
            style={{
              backgroundColor: colorStr,
              boxShadow: shadow,
            }}
            onClick={() =>
              handleDisableToggle(
                state[keys.disabledKey + openIndex],
                openIndex
              )
            }
          ></div>
        </div>
        <div className="trackUI">
          <div className="trackSliderContainer">
            <div className="trackSlider">
              <IconContainer icon1={volumeOff} />
              <ControlledSlider
                value={state[keys.volKey + openIndex]}
                onChange={handleVolumeChange}
                disabled={state[keys.disabledKey + openIndex]}
                index={openIndex}
                min={0}
                max={100}
                step={1}
              />
              <IconContainer icon1={volumeOn} />
            </div>
            {soundSources[openIndex].kind === "inst" ? (
              <div className="trackSlider">
                <IconContainer icon1={minus} />
                <ControlledSlider
                  value={state[keys.actKey + openIndex]}
                  onChange={handleActivityChange}
                  disabled={state[keys.disabledKey + openIndex]}
                  index={openIndex}
                  min={0}
                  max={100}
                  step={1}
                />
                <IconContainer icon1={plus} />
              </div>
            ) : (
              <div className="trackSlider">
                <IconContainer icon1={minus} />
                <ControlledSlider
                  value={state[keys.patKey + openIndex]}
                  onChange={handlePatternChange}
                  disabled={state[keys.disabledKey + openIndex]}
                  index={openIndex}
                  min={1}
                  max={soundSources[openIndex].patterns.length}
                  step={1}
                />
                <IconContainer icon1={plus} />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mobileEditorButtonContainer">
        <div
          className="mobileEditorButton"
          onClick={() =>
            handleDisableToggle(state[keys.disabledKey + openIndex], openIndex)
          }
        >
          <u className={state[keys.disabledKey + openIndex] ? "flash" : ""}>
            {state[keys.disabledKey + openIndex] ? "TURN ON" : "TURN OFF"}
          </u>
        </div>
        <div
          className="mobileEditorButton"
          onClick={() => handleTrackClick(openIndex, false)}
        >
          <u>CLOSE</u>
        </div>
      </div>
    </div>
  );
};
