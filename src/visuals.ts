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

let height: number;
let width: number;
let circleMaxR : number; 
let circleMinR : number; 
let circleMidX : number;
let circleMidY : number;
let ringDistance : number;

let objID = 0;
const PI = Math.PI;
const seqStepAngle = 2 * PI / 32;
const dotSize = 15;

export const colors = [0xEE1F49, 0xE02689, 0x7209B7, 0x4361EE, 0x77FFE6, 0x7BFF88, 0xD4FF5C, 0xFFEF93, 0xFFE8C4]

let amountOfDrawnTracks : number = 0;

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

  soundSources.forEach((track: any) => {
    if (track.kind === "inst" || track.kind === "drum") {
      amountOfDrawnTracks++;
    }
  });
  screenResize();

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
    if (performance.now() > this.creationTime + this.lifeTime) {
      this.dead = true;
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
    
    graphicsArr.forEach((obj: any, index: number)=>{
        obj.update();
        obj.draw();
    })

    for (let i = graphicsArr.length - 1; i >=0 ; i--){
      if (graphicsArr[i].dead){
        graphicsArr.splice(i, 1)
      }
    }

    // draw 8 white indicator lines
    overlay.lineStyle(1, 0x555555);
    for (let i = 0; i < 8; i++){
      overlay.moveTo(
        circleMidX + 40 * Math.sin(i / 8 * (2 * PI)),
      circleMidY + 40 * Math.cos(i / 8 * (2 * PI)))
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

          // draw a big circle in the color of the track
          fx.lineStyle(2, colors[index], 0.5)
          fx.drawCircle(circleMidX, circleMidY, r)
          overlay.lineStyle(2, colors[index], 0.5)
          overlay.drawCircle(circleMidX, circleMidY, r)

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
          graph.endFill()

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

function getVectorComponents(direction: number, speed: number) {
    return [Math.cos(direction) * speed, Math.sin(direction) * speed];
  }

export function ripple(track: number, volume: number, seqIndex: number){
  graphicsArr.push(new rippleCircle(0, 0, volume, track, seqIndex))
}

function screenResize(){
  width = Math.max(window.innerWidth, 1150);
  height = Math.max(window.innerHeight, 750);
  app.renderer.resize(width, height);
  circleMaxR = height / 2 - 50;
  circleMinR = circleMaxR / 4;
  circleMidX = width / 2;
  circleMidY = height / 2;
  ringDistance = (circleMaxR - circleMinR) / (amountOfDrawnTracks - 1);
  console.log(amountOfDrawnTracks)
}