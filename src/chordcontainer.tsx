import { chords } from "./App";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export function ChordContainer(props: any) {
  return (
    <div className="chordContainer">
      {props.showUI ? (
        <div
          className={
            !props.mobile
              ? "chordProgression"
              : "chordProgression mobileProgression"
          }
        >
          <ChordButton
            value={chords[props.progression[0]].value}
            name={chords[props.progression[0]].name}
            currentBarInProgression={props.currentBarInProgression}
            index={0}
            handleChordClick={props.handleChordClick}
            id="firstChord"
            mobile={props.mobile}
          />
          <ChordButton
            value={chords[props.progression[1]].value}
            name={chords[props.progression[1]].name}
            currentBarInProgression={props.currentBarInProgression}
            index={1}
            handleChordClick={props.handleChordClick}
            id="secondChord"
            mobile={props.mobile}
          />
          <ChordButton
            value={chords[props.progression[2]].value}
            name={chords[props.progression[2]].name}
            currentBarInProgression={props.currentBarInProgression}
            index={2}
            handleChordClick={props.handleChordClick}
            id="thirdChord"
            mobile={props.mobile}
          />
          <ChordButton
            value={chords[props.progression[3]].value}
            name={chords[props.progression[3]].name}
            currentBarInProgression={props.currentBarInProgression}
            index={3}
            handleChordClick={props.handleChordClick}
            id="lastChord"
            mobile={props.mobile}
          />
          <div className="closeButton left" onClick={props.handleChordUIToggle}>
            close
          </div>
        </div>
      ) : (
        <div
          onClick={() => props.handleChordUIToggle()}
          className="chordsButton"
        >
          Change Chord Progression
        </div>
      )}
    </div>
  );
}

function ChordButton(props: any) {
  let extraClass = "";
  if (props.currentBarInProgression === props.index) {
    extraClass = " currentChord";
  }
  if (props.mobile) {
    extraClass += " mobileChordButton";
  }
  return (
    <div className={"chordButton" + extraClass} id={props.id}>
      {props.name}
      <div className="chordArrowContainer">
        <IoIosArrowUp
          className="chordArrow"
          onClick={() => props.handleChordClick(props.index, 1)}
        />

        <IoIosArrowDown
          className="chordArrow"
          onClick={() => props.handleChordClick(props.index, -1)}
        />
      </div>
    </div>
  );
}

export default ChordContainer;
