import {chords } from './App'

export function ChordContainer(props: any) {
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

  export default ChordContainer