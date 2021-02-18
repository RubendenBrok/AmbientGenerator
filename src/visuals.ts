import * as PIXI from "pixi.js";

let app: any;
let graph: any;
let graphicsArr: any[] = [];
let nextCircle = performance.now()+100;
let objID = 0;
const PI = Math.PI;


export function initGraphics() {
  //Create a Pixi Application
  app = new PIXI.Application({
    width: window.innerWidth,
    height: window.innerHeight,
    antialias: true,
    transparent: true,
    resolution: 1,
  });

  document.body.appendChild(app.view);

  graph = new PIXI.Graphics();
  app.stage.addChild(graph);
}

class GraphicsObj {
    x: number;
    y: number;
    angle: number;
    speed: number;
    size: number;
    color: number;
    creationTime: number;
    lifeTime: number;
    id: number;
    dead: boolean;

    constructor(
        x: number,
        y: number,
        angle: number,
        speed: number,
        size: number,
        color: number,
    ) {
        this.x= x;
        this.y=y;
        this.angle=angle;
        this.speed=speed;
        this.size=size;
        this.color=color;
        this.creationTime=performance.now();
        this.lifeTime = 2000;
        this.id = objID;
        objID++;
        this.dead = false;
    }

    updatePos(){
        let velComponents = getVectorComponents(this.angle, this.speed);
        this.x += velComponents[0];
        this.y += velComponents[1];
    }

    draw(){
        graph.beginFill(this.color)
        graph.drawCircle(this.x, this.y, this.size)
        graph.endFill()
    }
}

export function updateGraphics(){
    graph.clear();

    if (performance.now() > nextCircle){
        nextCircle += 300;
        graphicsArr.push(new GraphicsObj(
            600,
            400,
            0,
            4,
            Math.random() * 20 + 20,
            0x00FFAA
        ))
    }

    let deadIndexes: number[] = [];
    graphicsArr.forEach((obj: any, index: number)=>{
        obj.updatePos();
        obj.draw();
        if (performance.now() > obj.creationTime + obj.lifeTime){
            deadIndexes.push(index);
        }
    })

    graphicsArr.reverse();

    deadIndexes.forEach((index: number)=>{
        graphicsArr.splice(graphicsArr.length-1-index, 1)
    })

}



function getVectorComponents(direction: number, speed: number) {
    return [Math.cos(direction) * speed, Math.sin(direction) * speed];
  }