import * as PIXI from "pixi.js";
import { seqLength, keys } from "./App"
import { soundSources } from "./soundsources"
import { AdvancedBloomFilter, KawaseBlurFilter } from 'pixi-filters'


let app: any;
let graph: any;
let overlay: any;
let fx: any;

let graphicsArr: any[] = [];
let bloomFilter : any;
let blurFilter : any;

let nextCircle = performance.now()+100;
let objID = 0;
const PI = Math.PI;
const seqStepAngle = 2 * PI / 32;
let circleMaxR = window.innerHeight / 2 - 50;
let circleMinR = circleMaxR / 5;
const dotSize = 15;
const colors = [0xEE1F49, 0xE02689, 0x7209B7, 0x4361EE, 0x77FFE6, 0x7BFF88, 0xD4FF5C, 0xFFEF93]
let circleMidX = window.innerWidth / 2;
let circleMidY = window.innerHeight / 2;

let width = window.innerWidth;
let height = window.innerHeight;

let amountOfDrawnTracks = 0;
let ringDistance = 0;

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

  soundSources.forEach((track: any) => {
    if (track.kind === "inst" || track.kind === "drum") {
      amountOfDrawnTracks++;
    }
  });
  ringDistance = (circleMaxR - circleMinR) / amountOfDrawnTracks;

  bloomFilter = new AdvancedBloomFilter();
  bloomFilter.threshold = 0.20;
  bloomFilter.bloomScale = 1;
  bloomFilter.blur = 3;
  bloomFilter.quality = 4;
  bloomFilter.brightness = 0.4;
  graph.filters = [bloomFilter];

  blurFilter= new KawaseBlurFilter();
  blurFilter.blur = 2;
  fx.filters = [blurFilter];
}

class rippleCircle {
  x: number;
  y: number;
  angle: number;
  speed: number;
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

  constructor(
    angle: number,
    speed: number,
    volume: number,
    track: number,
    seqIndex: number
  ) {
    this.r = circleMaxR - ringDistance * track;
    this.x = circleMidX + this.r * Math.sin(-seqIndex * seqStepAngle + PI);
    this.y = circleMidY + this.r * Math.cos(-seqIndex * seqStepAngle + PI);
    this.angle = angle;
    this.speed = speed;
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
  }

  update() {
    let velComponents = getVectorComponents(this.angle, this.speed);
    this.x += velComponents[0];
    this.y += velComponents[1];
    this.size += this.growth;


    if (performance.now() > this.creationTime + this.beginFade) {
      let howLongAmIFading =
        performance.now() - this.creationTime - this.beginFade;
      this.opacity =
        this.startOpacity -
        this.startOpacity * (howLongAmIFading / this.fadeTime);
    }
  }

  draw() {
   // graph.beginFill(this.color, this.opacity);
    fx.lineStyle(this.thickness, this.color, this.opacity);
    fx.drawCircle(this.x, this.y, this.size);
    fx.endFill();
  }
}

export function updateGraphics(state: any){
    graph.clear();
    fx.clear();
    overlay.clear();
    
    graph.beginFill(0x2a2a2a, 0.2);
    graph.drawRect(0,0, width, height);
    graph.endFill();
    
    let deadIndexes: number[] = [];
    graphicsArr.forEach((obj: any, index: number)=>{
        obj.update();
        obj.draw();
        if (performance.now() > obj.creationTime + obj.lifeTime){
            deadIndexes.push(index);
        }
    })

    graphicsArr.reverse();

    deadIndexes.forEach((index: number)=>{
        graphicsArr.splice(graphicsArr.length-1-index, 1)
    })
    

    overlay.lineStyle(1, 0x555555);
    for (let i = 0; i < 8; i++){
      overlay.moveTo(circleMidX, height / 2);
      overlay.lineTo(
      circleMidX + circleMaxR * Math.sin(i / 8 * (2 * PI)),
      circleMidY + circleMaxR * Math.cos(i / 8 * (2 * PI))
      )
    }

    soundSources.forEach((track: any, index: number) => {
      if (track.kind === "drum" || track.kind === "inst") {
        if (!state[keys.disabledKey + index]) {
          let r = circleMaxR - ringDistance * index;
          let sixteenth = (60 / state.bpm / 4) * 1000;
          let timeInCurrentStep = performance.now() - state.lastPlayTime;
          let angle = (state.masterSeq.currentSequencePos * seqStepAngle) + (timeInCurrentStep / sixteenth) * seqStepAngle - PI - 0.2;
          let size = dotSize * (state[keys.volKey + index] / 100);
          fx.lineStyle(2, colors[index], 0.5)
          fx.drawCircle(circleMidX, circleMidY, r)
          overlay.lineStyle(2, colors[index], 0.5)
          overlay.drawCircle(circleMidX, circleMidY, r)
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
          graph.endFill()
          overlay.beginFill(0xCCCCCC);
          overlay.drawCircle(
            circleMidX + r * Math.sin(- angle),
            circleMidY + r * Math.cos(- angle),
            3
          );
          overlay.endFill()

        }
      }
    });

}

function getVectorComponents(direction: number, speed: number) {
    return [Math.cos(direction) * speed, Math.sin(direction) * speed];
  }

export function ripple(track: number, volume: number, seqIndex: number){
  graphicsArr.push(new rippleCircle(0, 0, volume, track, seqIndex))
}