import * as PIXI from "pixi.js";
import { seqLength, keys } from "./App";
import { soundSources } from "./soundsources";
import { AdvancedBloomFilter, KawaseBlurFilter } from "pixi-filters";

let app: any;
let graph: any;
let overlay: any;
let fx: any;

let graphicsArr: any[] = [];
let bloomFilter: any;
let blurFilter: any;

let height: number;
let width: number;
let circleMaxR: number;
let circleMinR: number;
let circleMidX: number;
let circleMidY: number;
let ringDistance: number;
let dotSize: number;

let driftCircleMin = 2;
const driftCircleUnSelect = 2;
const driftCircleSelect = 8;
const driftCircleMax = 12;
let driftCircle = driftCircleMin;
let driftHover = false;
let driftButton: any;
let driftRippleCounter: number;
let driftRippleTime = 2000;

const trackElements : any[] = [];
const trackSelected : boolean[] = [];
const trackWidthSelected = 9;
const trackWidthUnSelected = 2;
let objID = 0;
const PI = Math.PI;
const seqStepAngle = (2 * PI) / 32;

export const colors = [
  0xff1239,
  0xd61fff,
  0x2a22ff,
  0x26ffff,
  0x28ff5e,
  0xfffa5c,
  0xffb950,
  0xff6d33,
  0xffbdc8,
];

let amountOfDrawnTracks: number = 0;

window.onresize = () => screenResize();

export function initGraphics() {
  // prevents crash on some Firefox versions (https://github.com/pixijs/pixi.js/issues/7070)
  PIXI.settings.FAIL_IF_MAJOR_PERFORMANCE_CAVEAT = false;

  //Create a Pixi Application
  app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    transparent: true,
    resolution: 1,
  });

  document.body.appendChild(app.view);

  overlay = new PIXI.Graphics();
  app.stage.addChild(overlay);
  graph = new PIXI.Graphics();
  app.stage.addChild(graph);

  fx = new PIXI.Graphics();
  app.stage.addChild(fx);


  //initialize track data
  soundSources.forEach((track: any, index : number) => {
    if (track.kind === "inst" || track.kind === "drum") {
      amountOfDrawnTracks++;
      trackElements.push(document.getElementById("track"+index))
      trackSelected[index]=false;
      trackElements[index].addEventListener("mouseover", ()=>{trackSelected[index]=true;});
      trackElements[index].addEventListener("mouseleave", ()=>{trackSelected[index]=false;});
    }
  });
  screenResize();

  //initialize filters
  bloomFilter = new AdvancedBloomFilter();
  bloomFilter.threshold = 0.2;
  bloomFilter.bloomScale = 1;
  bloomFilter.blur = 3;
  bloomFilter.quality = 4;
  bloomFilter.brightness = 0.4;
  graph.filters = [bloomFilter];

  blurFilter = new KawaseBlurFilter();
  blurFilter.blur = 2;
  fx.filters = [blurFilter];

  //initialize driftbutton
  driftButton = document.getElementById("driftButton");
  driftButton.addEventListener("mouseenter", () => {
    driftHover = true;
  });
  driftButton.addEventListener("mouseout", () => {
    driftHover = false;
  });
  driftRippleCounter = performance.now();
}

class rippleCircle {
  x: number;
  y: number;
  size: number;
  growth: number;
  color: number;
  creationTime: number;
  lifeTime: number;
  beginFade: number;
  fadeTime: number;
  id: number;
  dead: boolean;
  startOpacity: number;
  opacity: number;
  thickness: number;
  r: number;

  constructor(volume: number, track: number, seqIndex: number) {
    this.r = circleMaxR - ringDistance * track;
    this.x = circleMidX + this.r * Math.sin(-seqIndex * seqStepAngle + PI);
    this.y = circleMidY + this.r * Math.cos(-seqIndex * seqStepAngle + PI);
    this.size = (volume / 100) * dotSize;
    this.color = colors[track];
    this.thickness = 5 + 5 * (volume / 100);
    this.creationTime = performance.now();
    this.lifeTime = 500 + 600 * (volume / 100);
    this.beginFade = 200;
    this.fadeTime = this.lifeTime - this.beginFade;
    this.id = objID;
    objID++;
    this.dead = false;
    this.growth = 0.2 + volume / 300;
    this.startOpacity = 0.4;
    this.opacity = this.startOpacity;
    this.update = this.update.bind(this);
  }

  update() {
    let newState = updateFXCircle(this);
    this.size = newState.size;
    this.opacity = newState.opacity;
    this.dead = newState.dead;
  }

  draw() {
    // graph.beginFill(this.color, this.opacity);
    drawFXCircle(
      this.x,
      this.y,
      this.size,
      this.thickness,
      this.color,
      this.opacity
    );
  }
}

class driftRipple {
  size: number;
  growth: number;
  color: number;
  creationTime: number;
  lifeTime: number;
  beginFade: number;
  fadeTime: number;
  id: number;
  dead: boolean;
  startOpacity: number;
  opacity: number;
  thickness: number;

  constructor() {
    this.size = circleMaxR - ringDistance * amountOfDrawnTracks;
    this.color = 0xffffff;
    this.thickness = 15;
    this.creationTime = performance.now();
    this.lifeTime = 2000;
    this.beginFade = 400;
    this.fadeTime = this.lifeTime - this.beginFade;
    this.id = objID;
    objID++;
    this.dead = false;
    this.growth = 0.3;
    this.startOpacity = 0.2;
    this.opacity = this.startOpacity;
    this.update = this.update.bind(this);
  }

  update() {
    let newState = updateFXCircle(this);
    this.size = newState.size;
    this.opacity = newState.opacity;
    this.dead = newState.dead;
  }

  draw() {
    // graph.beginFill(this.color, this.opacity);
    drawFXCircle(
      width / 2,
      height / 2,
      this.size,
      this.thickness,
      this.color,
      this.opacity
    );
  }
}

function drawFXCircle(
  x: number,
  y: number,
  size: number,
  thickness: number,
  color: number,
  opacity: number
) {
  fx.lineStyle(thickness, color, opacity);
  fx.drawCircle(x, y, size);
  fx.endFill();
}

function updateFXCircle(object: any) {
  object.size += object.growth;

  if (performance.now() > object.creationTime + object.beginFade) {
    let howLongAmIFading =
      performance.now() - object.creationTime - object.beginFade;
    object.opacity =
      object.startOpacity -
      object.startOpacity * (howLongAmIFading / object.fadeTime);
  }
  if (performance.now() > object.creationTime + object.lifeTime) {
    object.dead = true;
  }
  return object;
}

export function updateGraphics(state: any) {
  graph.clear();
  fx.clear();
  overlay.clear();

  graph.beginFill(0x2a2a2a, 0.2);
  graph.drawRect(0, 0, width, height);
  graph.endFill();

  graphicsArr.forEach((obj: any, index: number) => {
    obj.update();
    obj.draw();
  });

  for (let i = graphicsArr.length - 1; i >= 0; i--) {
    if (graphicsArr[i].dead) {
      graphicsArr.splice(i, 1);
    }
  }

  // draw 8 white indicator lines
  overlay.lineStyle(1, 0x555555);
  for (let i = 0; i < 8; i++) {
    overlay.moveTo(
      circleMidX +
        (circleMaxR - ringDistance * amountOfDrawnTracks) *
          Math.sin((i / 8) * (2 * PI)),
      circleMidY +
        (circleMaxR - ringDistance * amountOfDrawnTracks) *
          Math.cos((i / 8) * (2 * PI))
    );
    overlay.lineTo(
      circleMidX + circleMaxR * Math.sin((i / 8) * (2 * PI)),
      circleMidY + circleMaxR * Math.cos((i / 8) * (2 * PI))
    );
  }

  //draw the flow button circle
  if (state.drifting) {
    driftCircleMin = driftCircleSelect;
  } else {
    driftCircleMin = driftCircleUnSelect;
  }

  if (driftHover && driftCircle < driftCircleMax) {
    driftCircle += 1;
  }
  if (!driftHover && driftCircle > driftCircleMin) {
    driftCircle -= 1;
  }
  let r = circleMaxR - ringDistance * amountOfDrawnTracks;
  fx.lineStyle(driftCircle, 0xffffff, 0.5);
  fx.drawCircle(circleMidX, circleMidY, r);
  overlay.lineStyle(2, 0xffffff, 0.5);
  overlay.drawCircle(circleMidX, circleMidY, r);

  //draw ripples if sequencer is drifting
  if (state.drifting && state.playing) {
    if (performance.now() - driftRippleCounter >= driftRippleTime) {
      driftRippleCounter = performance.now();
      graphicsArr.push(new driftRipple());
    }
  }

  soundSources.forEach((track: any, index: number) => {
    if (track.kind === "drum" || track.kind === "inst") {
      if (!state[keys.disabledKey + index]) {
        let r = circleMaxR - ringDistance * index;
        let sixteenth = (60 / state.bpm / 4) * 1000;
        let timeInCurrentStep = performance.now() - state.lastPlayTime;
        let angle =
          state.masterSeq.currentSequencePos * seqStepAngle +
          (timeInCurrentStep / sixteenth) * seqStepAngle -
          PI -
          0.2;
        let size = dotSize * (state[keys.volKey + index] / 100);

        // draw a big circle in the color of the track
        if (trackSelected[index]){
          fx.lineStyle(trackWidthSelected, colors[index], 0.5);
        } else {
          fx.lineStyle(trackWidthUnSelected, colors[index], 0.5);
        }
        fx.drawCircle(circleMidX, circleMidY, r);
        overlay.lineStyle(2, colors[index], 0.5);
        overlay.drawCircle(circleMidX, circleMidY, r);

        //for each track, draw a circle when there is a sound in the sequencer
        graph.beginFill(colors[index]);
        for (let i = 0; i < seqLength; i++) {
          if (!isNaN(state[keys.seqKey + index][i])) {
            graph.drawCircle(
              circleMidX + r * Math.sin(-i * seqStepAngle + PI),
              circleMidY + r * Math.cos(-i * seqStepAngle + PI),
              size
            );
          }
        }
        graph.endFill();

        //draw the small circle to indicate where the sequencer is
        if (state.playing) {
          overlay.beginFill(0xcccccc);
          overlay.drawCircle(
            circleMidX + r * Math.sin(-angle),
            circleMidY + r * Math.cos(-angle),
            3
          );
          overlay.endFill();
        }
      }
    }
  });
}

export function ripple(track: number, volume: number, seqIndex: number) {
  graphicsArr.push(new rippleCircle(volume, track, seqIndex));
}

function screenResize() {
  width = Math.max(window.innerWidth, 650);
  height = Math.max(window.innerHeight, 550);
  app.renderer.resize(width, height);
  circleMaxR = Math.min(height, width * 0.6) / 2 - 50;
  circleMinR = circleMaxR / 4;
  circleMidX = width / 2;
  circleMidY = height / 2;
  ringDistance = (circleMaxR - circleMinR) / (amountOfDrawnTracks - 1);
  dotSize = Math.min(width * 0.6, height) / 60;
}
