
// let zoom = 1.00;
// let zMin = 0.05;
// let zMax = 9.00;
// let sensitivity = 0.005;

function updateIndex() {
  for (i=0;i<mediaBundles.length;i++){
  mediaBundles[i].index = i;
  }
}

function logMB(inputName, log)  {
  // logs feedback to psuedoconsole
  let text;
  switch (log) {
    case "duplicate":
      text = "There is already a MediaBundle called " + inputName + ", please find a new name or edit that one.";
      break;
    case "created":
      text = "You have successfully created a MediaBundle called " + inputName + ".";
      break;
      case "newObj":
        text = "You have successfully added " + inputName + " new object(s).";
        break;
    }
  $("#MBCreateOutput").empty();
  $("#MBCreateOutput").show();
  document.getElementById("MBCreateOutput").innerHTML = text;
  $("#MBCreateOutput").fadeOut(2000);
}

let keys = [];

function keyPressed() {
  if(keys.length>=2){
    keys.splice(0,1);
  }
  keys.push(key);

  // trigger name prompt for MB
  if (keys [0] == "Alt" && keys [1] == "n") {
    getPhrase(); //get name and then chain to "createMB"
  }
  if(keys [0] == "Alt" && keys [1] == "w"){
    writeDiagram();
  }

  if (keys [0] == "Alt" && keys [1] == "h"){
    panelVis();
  }

  if (keys [0] == "Alt" && keys [1] == "o"){
    panelOrg();
  }

  if (keys [0] == "Alt" && keys [1] == "l"){
    let dbKey = prompt("enter key", '');
    dbController.retrieveBundle(dbKey, bundleReceived); 
  }
}

function bundleReceived(key, bundleData) {
  console.log(bundleData);
  // Creates a media bundle
  let newBundle = new MediaBundle(key, mediaBundles.length);
  
  // Create text objects
  let textObjects = bundleData.text; 
  let objects = Object.values(textObjects);
  objects.forEach(o => {
    let data = String(o.txt);
    let obj = new TextObject('', o.name, data, o.index, mediaBundles.length);
    newBundle.objects[o.index] = obj;
  });

  // Create image objects.
  let imageObjects = bundleData.image; 
  objects = Object.values(imageObjects);
  objects.forEach(o => {
    let img = createImg(o.data, "").hide();
    let obj = new ImageObject('', o.name, img, o.index, mediaBundles.length);
    newBundle.objects[o.index] = obj; 
  });

  mediaBundles.push(newBundle);
}

// //trigger drag for given bundle
function mousePressed() {
  for (i = 0; i < mediaBundles.length; i++) {
    mediaBundles[i].pressed();
    }
}

//
function doubleClicked() {
  for (i = 0; i < mediaBundles.length; i++) {
    //if the mouse is over the bundle and it is not being dragged, rotate-shift the mediaobject array
    if (mediaBundles[i].rollover) {
      if (mediaBundles[i].dragging == false) {
        mediaBundles[i].objects.unshift(mediaBundles[i].objects.pop());
      }
    }

  }
}

// // here are some dragging fucntions (releases all objects when mouse up) and also click to cycle through objects
function mouseReleased() {
  for (i = 0; i < mediaBundles.length; i++) {
    //release all bundles from this.dragging
    mediaBundles[i].released();
  }
}


// dynamically adjust the canvas to the window
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


function playTone(){
  let midiValue = 40;
   let freqValue = midiToFreq(midiValue);
   osc.freq(freqValue);

   envelope.play(osc, 0, 0.1);
}
//
//
// function mouseWheel(event) {
//   zoom += sensitivity * event.delta;
//   zoom = constrain(zoom, zMin, zMax);
//   //uncomment to block page scrolling
//   return false;
// }
