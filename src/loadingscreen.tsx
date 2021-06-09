import React from 'react'

export const LoadingScreen = React.memo(function LoadingScreen(props: any) {
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

export default LoadingScreen