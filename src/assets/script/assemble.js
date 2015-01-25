// assemble.js
// Build the Rocket Ship in a 2D Isometric space

if (debug) console.log("Starting Assembly...");

var tool = new paper.Tool();

var ass_resource_count = 1;

var crane_base = { item: undefined, active: true, uri: "assets/crane-01.svg" };

function run() {
 load_resources();
}

// Wait for resources to be loaded before calling init()
function is_ready() {
  if (debug) console.log("is_ready(" + ass_resource_count + ")");
  if (ass_resource_count == 0)
   init();
  else
   setTimeout(is_Ready, 1000);
}


function set_SVG(blob, item_ref) {
}


function load_resources() {
  var canv = document.getElementById('screen');
  paper.setup(canv);
  paper.project.activeLayer.fitBounds(paper.view.bounds);

  if (debug) console.log("Canvas size " + canv.width + "," + canv.height );

  if (crane_base.active) request_resource_svg(crane_base, set_SVG);
  
  is_ready();
}



function init() {
  if (debug) console.log("assembly init()");
}
