export const driftAmt = 0.05;
export const maxDriftSpeed = 0.2;

export function updateTrackDrift(oldTrackState: any) {
  const newTrackState = oldTrackState;
  newTrackState.forEach((category: any) => {
    category.forEach((track: any) => {
      if (!track.disabled) {
        if (track.drifting) {
          track.volDriftVelocity = randomDriftVelocity(
            track.volDriftVelocity,
            driftAmt,
            maxDriftSpeed,
            -maxDriftSpeed
          );
          track.volume = parseFloat(
            limitDriftIncrease(track.volume, track.volDriftVelocity, 100, 0)
          );
          if (track.volume === 0 || track.volume === 100) {
            track.volDriftVelocity = 0;
          }

          track.actDriftVelocity = randomDriftVelocity(
            track.actDriftVelocity,
            driftAmt,
            maxDriftSpeed,
            -maxDriftSpeed
          );
          track.activity = parseFloat(
            limitDriftIncrease(track.activity, track.actDriftVelocity, 100, 0)
          );
          if (track.activity === 0 || track.activity === 100) {
            track.actDriftVelocity = 0;
          }
        }
      }
    });
  });
  return newTrackState;
}

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