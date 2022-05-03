//array containing all mediaBundles;
let mediaBundles = [];

let MediaBundle = class {
  constructor(name, index) {
    this.name = name;
    this.x = (width / 4) + (index * 220);
    this.y = height / 2;
    this.w = 200;
    this.h = 200;
    this.index = index;
    this.objects = [];
    this.fiducial = 0;
    this.dragging = false; // Is the object being dragged?
    this.rollover = false; // Is the mouse over the ellipse?
    this.editing = false;
    //  this.filter = (BLUR, 0);
    this.gui;
    this.obj_guis = [];
    this.params = {

      //interface/style options on off
      header: true,
      foregroundColor: "#ffffff",
      backgroundColor: "#000000",

      headerTextSize: 14,
      headerTextFont: "monospace",

      bgBox: true,
      borderWeight: 8,


      scrambleAmount: 200,
      scramble: false,

      scatter: false,
      scatterRadius: 200,


      useFiducialMarker: false,
      anchorToMarker: "0",
    };

    this.buildGUI = function() {
      let self = this;
      this.gui = QuickSettings.create(this.index * 210, 10, `${this.name}`)
        .bindText("name", `${this.name}`, this)
        .bindBoolean("header", true, this.params)
        .bindBoolean("bgBox", true, this.params)
        .bindRange("borderWeight", 0, 20, 5, 1, this.params)
        .bindDropDown("headerTextFont", ["serif", "sans-serif", "monospace", "cursive", "fantasy"], this.params)
        .bindColor("backgroundColor", "#000000", this.params)
        .bindColor("foregroundColor", "#ffffff", this.params)
        .bindRange("headerTextSize", 6, 200, 14, 1, this.params)
        //  .addFileChooser("addMediaObjectFile","Add New Media Object", "", this.handleFile.bind(mediaBundles[this.index]))
        .bindBoolean("scatter", false, this.params)
        .bindRange("scatterRadius", 1, 1000, 200, 10, this.params)
        .addButton("randomize scramble", function() {

          self.scrambleObjects(self.objects)
        })
        .bindRange("scrambleAmount", 1, 1000, 200, 10, this.params)
        .bindBoolean("scramble", false, this.params)
        .bindBoolean("useFiducialMarker", false, this.params)
        .addDropDown("anchorToMarker", markerAdmin.IDs, function(object) {
          self.fiducial = object.index;
          console.log("Test")
        })
        .addDropDown("edit media object", [], function(object) {
          self.showObjGUI(object.index)
        })
        .addButton("save bundle", function() {
          self.saveBundle(); 
        })
      mbPanels.push(this.gui);
    };
    this.buildGUI();
  }

  saveBundle() {
    console.log('All objects are here');
    console.log(this.objects);
    
    let json = {
      'text': {},
      'image': {},
      'bundleParams': this.params
    };

    this.objects.forEach(o => {
      if (o.type === 'text') {         
        let key = 'text:' + o.index; 
        let params = o.params; 
        params.name = o.name; 
        params.index = o.index; 
        json['text'][key] = o.params; 
      } else if (o.type === 'image') {
        // Create image
        let params = o.params; 
        params.name = o.name; 
        params.index = o.index; 
        params.data = o.img.elt.currentSrc; // base64 data. 
        let key = 'image:' + o.index; 
        json['image'][key] = params; 
      }
    });

    console.log(json);
    json = JSON.stringify(json);
    console.log(json);
    dbController.saveBundle(this.name, json); 
    // JSON bundle that goes to the DB. 
  }

  showObjGUI(index) {
    for (let i = 0; i < this.objects.length; i++) {
      if (index == i) {
        this.objects[i].destroyGUI();
        this.objects[i].buildGUI();
      }
    }
  }



  refreshObjList() {
    let self = this;
    let objectNames = [];
    for (let i = 0; i < this.objects.length; i++) {
      objectNames.push(this.objects[i].name);
      this.objects[i].index = i;
    };
    this.gui
      .removeControl("edit media object")
      .addDropDown("edit media object", objectNames, function(object) {
        self.showObjGUI(object.index)
      });
    this.showObjGUI(0);
  }

  scrambleObjects(objects, amt) {
    console.log("hi " + objects);
    for (let object of objects) {
      object.params.offsetX = random(-1, 1);
      object.params.offsetY = random(-1, 1);
    }

  }
  //
  // //this function handles ADD MEDIA OBJECT file inputs
  handleFile(file) {
    // parse out the files
    // get info to make a mediaObject
    let obj;


  let name  = file.name.split('.')
  name.splice(name.length-1, 1);
  name = name[0].split(' ');
  console.log(name);
  name = name.join('_');


    // let path = URL.createObjectURL(file);

    let mbIndex = this.index;
    let index = this.objects.length;


    if (file.type === 'image') {
      let img = createImg(file.data, "").hide();
      obj = new ImageObject(file, name, img, index, mbIndex);
    } else if (file.type == 'video') {
      let vid = createVideo(file.data).hide();
      obj = new VideoObject(file, name, vid, index, mbIndex);
    }
    else if (file.type == 'text') {
      let text = String(file.data);
      console.log(text);
      obj = new TextObject(file, name, text, index, mbIndex);
    }

    this.objects.push(obj);
    this.refreshObjList();
  }

  destructor() {
    delete mediaBundles(this.index);
  };

  get position() {
    return (this.x, this.y);
  }

  over() {
    // Is mouse over object

    if (mouseX > this.x - (this.w / 2) && mouseX < this.x + (this.w / 2) && mouseY > this.y - (this.h / 2) && mouseY < this.y + (this.h / 2)) {
      this.rollover = true;
    } else {
      this.rollover = false;
    }
  }
  update() {

    if (this.addMediaObject) {
      this.addMediaObject = false;
      this.newObject();
    }

    // Adjust location if being dragged
    if (this.dragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY
    }
  };
  show() {

    if (this.params.useFiducialMarker) {

      this.x = (1 - markerAdmin.markers[this.fiducial].x) * width;
      this.y = (1 - markerAdmin.markers[this.fiducial].y) * height;


    }

    if (this.params.bgBox) {
      push();
      rectMode(CENTER);
      noFill();

      translate(this.x, this.y);
      if (this.rollover) {
        stroke(this.params.foregroundColor);
      } else {
        stroke(this.params.backgroundColor);
      }
      strokeWeight(this.params.borderWeight);
      rect(0, 0, this.w, this.h)
      pop()
    }
    if (this.params.header) {
      push();
      rectMode(CENTER);
      noStroke();

      if (this.rollover) {
        fill(this.params.foregroundColor);
      } else {
        fill(this.params.backgroundColor);
      }

      rect(this.x, this.y - (this.h / 2), this.w + this.params.borderWeight, this.params.headerTextSize + textDescent());
      textFont(this.params.headerTextFont);
      textSize(this.params.headerTextSize);

      if (this.rollover) {
        fill(this.params.backgroundColor);
      } else {
        fill(this.params.foregroundColor);
      }
      text(this.name, this.x, this.y - (this.h / 2), this.w + this.params.borderWeight, this.params.headerTextSize + textDescent());
      pop()
    }




    for (i=0;i<this.objects.length;i++) {
        let xPos = this.x; // hold x and y pos in memory to apply transformations
        let yPos = this.y;
        let angle = Math.PI * 2 / this.objects.length;

      push();
      if (this.params.scramble) {
        xPos = xPos + (this.objects[i].params.offsetX*this.params.scrambleAmount);
        yPos = yPos + (this.objects[i].params.offsetY*this.params.scrambleAmount);
      }
      if (this.params.scatter) {
        xPos = xPos + (cos(angle * i * this.params.scatterRadius));
        yPos = yPos - (sin(angle * i * this.params.scatterRadius));
      }

      translate(xPos, yPos)



switch(this.objects[i].type){
  case 'image':
    scale(this.objects[i].params.scale);
    image(this.objects[i].img, 0, 0, this.objects[i].width, this.objects[i].height);
    break;
  case 'text':
    noStroke();
    fill(this.objects[i].params.textColor);
    textSize(this.objects[i].params.textSize);
    textFont(this.objects[i].params.font);
    text(this.objects[i].params.txt, 0, 0, this.objects[i].width)
    break;
  case 'video':
    console.log("you haven't added ability this yet.");
    break;
}

      pop();
    }
  }




//
//
//   else if (this.params.scramble) {
//     for (let m = 0; m < this.objects.length; m++) {
//       image(this.objects[m].img, this.x + this.objects[m].offset[0], this.y + this.objects[m].offset[1], this.objects[m].width, this.objects[m].height);
//     }
//   } else if (this.scatter) {
//     for (let m = 0; m < this.objects.length; m++) {
//       let angle = Math.PI * 2 / this.objects.length;
//       let xPos = this.x + cos(angle * m) * this.params.scatterRadius;
//       let yPos = this.y - sin(angle * m) * this.params.scatterRadius;
//       image(this.objects[m].img, xPos, yPos, this.objects[m].width, this.objects[m].height);
//     }
//   } else {
//     for (let m = 0; m < this.objects.length; m++) {
//       image(this.objects[m].img, this.x, this.y, this.objects[m].width, this.objects[m].height);
//     }
//   }
// }
// }

pressed() {
  // Did I click on the rectangle?
  if (this.rollover) {
    this.dragging = true;

    // If so, keep track of relative location of click to corner of rectangle
    this.offsetX = this.x - mouseX;
    this.offsetY = this.y - mouseY;

  }
}

released() {
  // Quit dragging
  this.dragging = false;
}
}

// Click and Drag an object
// Daniel Shiffman <http://www.shiffman.net>


//A Pen by Brian J. Cardiff on CodePen : https://gist.github.com/bcardiff/3b39ba8e2d00fed68435
