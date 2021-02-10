export const driftAmt = 0.15;
export const maxDriftSpeed = 0.3;

export function updateDrift(currentValue: number, driftVelocity: number, max: number, min: number) {
  const driftObj = {
    value : currentValue,
    velocity : driftVelocity
  }
  driftObj.velocity = randomDriftVelocity(
    driftObj.velocity,
    driftAmt,
    maxDriftSpeed,
    -maxDriftSpeed
  );
  driftObj.value = parseFloat(
    limitDriftIncrease(driftObj.value, driftObj.velocity, max, min)
  );
  if (driftObj.value === min || driftObj.value === max) {
    driftObj.velocity = 0;
  }

  return driftObj;
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