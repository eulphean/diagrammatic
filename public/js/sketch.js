let osc, envelope;
let frWindow = [];
let frAvg;
let avg = (array) => array.reduce((a,b) => a + b)  / 100;

// Controller to interface with the database. 
let dbController = new DBController();

function setup() {;

let cnv =  createCanvas(windowWidth, windowHeight);
  imageMode(CENTER);
  cnv.drop(gotFile, playTone);
  initSound(); //turn oscillator on
  playTone(); // play a sound showing init.
  setupOsc(12000, 3334); //12000 is where I receive from MAX tuio-bridge.maxpat, 3334 is where I send back config to server
}


function draw() {
  background(255);
  ellipseMode(RADIUS);
  //markerGrab();
  mbDraw();
  fps();
};


function mbDraw(){
  for (i = 0; i < mediaBundles.length; i++) {
    mediaBundles[i].over();
    mediaBundles[i].update();
    mediaBundles[i].show();
    }

}

function initSound (){
  osc = new p5.SinOsc();
  // Instantiate the envelope
  envelope = new p5.Env();
  // set attackTime, decayTime, sustainRatio, releaseTime
  envelope.setADSR(0.001, 0.5, 0.1, 0.5);
  // set attackLevel, releaseLevel
  envelope.setRange(1, 0);
  osc.start();
}

function fps (){
let fr = frameRate();
if (frWindow.length>100){
frWindow = frWindow.slice(1,100);
frWindow.push(fr);
}
else {
  frWindow.push(fr);
}



push();
noStroke();
fill(0);
textSize(40);
frAvg = avg(frWindow);
text(int(frAvg),0, height-60);
pop();
}
