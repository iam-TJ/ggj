// intro.js
// Controls the PaperScript introduction animation

if (debug)console.log("Starting intro...");

var intro_ready = false;
var tool = new paper.Tool();

// objects containing references to PaperScript Items (Layers) loaded from SVGs

// set this to the number of resources to be loaded
var intro_resource_count = 3;

// Reference holders for PaperScript Item/Group/Layers to allow pass-by-reference into callback functions
var meteor = { item: undefined, active: true, uri: "assets/meteor.svg", wobble: 0, wobble_direction: 1, wobble_max: 5, scale_factor: 0.1 };
var earth = { item: undefined, active: true, uri: "assets/earth-01.svg" };
var explosion = {item: undefined, active: true, uri: "assets/explosion.svg", exploded: false, grow: 0, scale_factor: 1.1 };
var path = { item: undefined, active: true };

load_resources();

/* Wait for resources to be loaded before calling init()
 */
function is_ready() {
  if (debug) console.log("is_ready(" + intro_resource_count + ")");
  if (intro_resource_count == 0)
  init();
  else
   setTimeout(is_ready, 1000);
}

/* callback function for main.js::receive_resource() and friends
 * @blob: XmlHttpRequest Blob object
 * @item_ref: PaperScript Item/Group/Layer reference holder
 */
function set_SVG(blob, item_ref) {
  if (debug) console.log("set_SVG() from " + blob.type);
   // convoluted way to convert a Blob to a SVG element that PaperScript can parse 
   var reader = new FileReader();
   reader.addEventListener("loadend", function() {
   if (debug) console.log("FileReader(loadend) " + Object.prototype.toString.call(reader.result));
   // split text into lines in order to
   lines = reader.result.match(/[^\r\n]+/g);
   // remove the first 2 lines (DOCTYPE and <xml>)
   lines.splice(0,2);
   var text  = "";
   for (var i=0; i < lines.length; i++)
     text = text + lines[i] + "\n"; // recombine the text

   // if (debug) console.log(text);
   item_ref.item = paper.project.importSVG(text, { expandShapes: true});
   if (item_ref.item == undefined) 
     console.log("Failed to import SVG " + item_ref.uri);
   else
     item_ref.item.visible = false;
   intro_resource_count--;
  });
   
  reader.readAsText(blob);
}

function load_resources() {
 var canv = document.getElementById('screen');
 paper.setup(canv);
 paper.project.activeLayer.fitBounds(paper.view.bounds);

 if (debug) console.log("Canvas size " + canv.width + "," + canv.height );

 if (meteor.active) request_resource_svg(meteor, set_SVG);
 if (earth.active) request_resource_svg(earth, set_SVG);
 if (explosion.active) request_resource_svg(explosion, set_SVG);

 is_ready();
}

function init() {
 if (debug) console.log("init()");

 if (earth.item) {
   scale_factor = 700/earth.item.bounds.width;
   earth.item.scale(scale_factor);
   earth.item.pivot = [earth.item.bounds.width/2, earth.item.bounds.height/2];
   if (debug) console.log("earth Pivot=" + earth.item.pivot + " Scale=" + scale_factor + " Bounds=" + earth.item.bounds);
   earth.item.position = [ paper.view.bounds.width - earth.item.bounds.width/2 + 50,
                           paper.view.bounds.height - earth.item.bounds.height/2 + 50];
   earth.item.visible = true;
 }

 if (explosion.item) {
  explosion.item.pivot = [explosion.item.bounds.width/2, explosion.item.bounds.height/2];
  explosion.item.scale(0.1);
 }

 path.item = new paper.Path();
 path.item.strokeColor = 'red';
 var start = new paper.Point(50,50);
 path.item.dashArray = [8, 8];
 path.item.strokeWidth = 8;
 path.item.moveTo(start);
 path.item.curveTo(paper.view.bounds.center.multiply(1.08),earth.item.position);
 if (debug) console.log('Path length=' + path.item.length);
 if (meteor.item) {
   meteor.steps = path.item.length;
   meteor.item.scale(meteor.scale_factor);

   meteor.item.pivot = [meteor.item.bounds.width/2, meteor.item.bounds.height/2];
   if (debug) console.log("meteor Pivot=" + meteor.item.pivot + " Scale=" + scale_factor + " Bounds=" + meteor.item.bounds);
   meteor.item.position = [ paper.view.bounds.x + meteor.item.bounds.width/2,
                            paper.view.bounds.y + meteor.item.bounds.height/2];
   meteor.item.visible = true;
   meteor.item.bringToFront();
 }
 
 paper.view.onFrame = intro_onFrame;
 paper.view.draw();
}

function intro_onFrame(event) {
 if (explosion.item && explosion.exploded) {
  explosion.scale_factor *= 1.05;
  explosion.item.scale(explosion.scale_factor);
  explosion.grow++;
  if (explosion.grow > 15) {
    earth.item.visible = false;
    explosion.item.visible = false;
    paper.view.onFrame = null;
    done = true;
  }
 }
 else if (meteor.item) {
   meteor.wobble += meteor.wobble_direction;
   if (meteor.wobble < -meteor.wobble_max || meteor.wobble > meteor.wobble_max)
     meteor.wobble_direction = -meteor.wobble_direction;
   meteor.item.rotate(meteor.wobble_direction);
   if (meteor.steps) {
    loc = path.item.getLocationAt(path.item.length - meteor.steps);
    if (loc) {
     meteor.item.position = loc.point;
     meteor.scale_factor = 1 +  ((1 / path.item.length) );
     meteor.item.scale(meteor.scale_factor);
     meteor.steps = meteor.steps - Math.pow(meteor.scale_factor, 3);
    }
    else { // kah-boom!
     meteor.item.visible = false;
     path.item.visible = false;
     explosion.exploded = true;
     explosion.item.position = earth.item.position;
     explosion.item.visible = true;
     au = new Audio("assets/atomic-bomb.mp3");
     au.play();

    }
   }
  if (earth.item) earth.item.rotate(-1);
 }
}

// EOF
