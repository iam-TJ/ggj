// main.js

var debug = true;

/* Writes to the status/log window
 * @message: text of status
 */
function status(message) {
 status_1 = document.getElementById('status-1');
 document.getElementById('status-2').innerHTML = status_1.innerHTML;
 status_1.innerHTML = message;
}


if (debug) console.log("Loading 1.2.3...");
require(["assets/script/paper-full"],
        function(paperscript) {
        if (debug) console.log("Loaded PaperScript");

        game_controller();
        }
);

var done = false; // flag used to indicate each mini-game has completed

// wait for a mini-game to complete before starting the next mini-game
function is_done(next_func) {
  if (!done)
    setTimeout(function() {is_done(next_func)}, 1000);
  else
    setTimeout(next_func, 0);
}

/* Primary control logic for the entire game
 *
 * called after PaperScript has been loaded.
 * responsible for loading and executing each mini-game
 * on-demand (assets and {Java,Paper}Script control logic)
 */
function game_controller() {
  if (debug) console.log("Started Game controller");
  game_intro();
}

function game_intro() {
  done = false;
  require(['assets/script/intro' ], function(intro) { });
  is_done(game_harvest);
}

function game_harvest() {
  require(['assets/script/harvest' ], function(harvest) { done = false; });
  is_done(game_assemble);
}  

function game_assemble() {
  require(['assets/script/assemble' ], function(assemble) { done = false; });
  is_done(game_launch);
}

function game_launch() {
  done = false;
  require(['assets/script/launch' ], function(launch) { });
  is_done(game_land);
}


function game_land() {
  done = false;
  require(['assets/script/land' ], function(land) { });
  is_done(game_avoid);
}


function game_avoid() {
  done = false;
  require(['assets/script/avoid' ], function(avoid) { });
  is_done(game_bonus);
}

function game_bonus() {
  done = false;
  require(['assets/script/bonus' ], function(bonus)  { });
}

function loader() {

 head = document.getElementsByTagName('head')[0];

}

function request_resource(item_ref, object_type, mime_type, callback_function) {
 xhr2 = new XMLHttpRequest();
 xhr2.open('GET', item_ref.uri, true);
 xhr2.responseType = object_type;
 xhr2.onload = function(e) {
  if (this.status == 200) {
   mime_type = this.getResponseHeader("Content-Type");
   if (debug) console.log("received resource " + mime_type);
   switch (mime_type) {
    case 'image/svg+xml':
     if (debug) console.log("Calling callback function");
     callback_function(new Blob([this.response], {type: mime_type}), item_ref);
     break;
    case 'text/plain':
    case 'text/javascript':
     callback_function(new Blob([this.response], {type: mime_type}), item_ref);
     break;
   }
  }
 };

 xhr2.send();
}


/* Request some remote SVG resource
 *
 * resource is loaded asynchronously and your callback_function
 * is called when the request has completed
 *
 * @item_ref: Wrapper object for PaperScript {item: Item; uri: String}
 * @callback_function: prototype is function(blob)
 * @returns: void
 */
function request_resource_svg(item_ref, callback_function) {
 request_resource(item_ref, 'blob', 'svg+xml', callback_function);
}

/* Request some remote text resource
 *
 * resource is loaded asynchronously and your callback_function
 * is called when the request has completed
 *
 * @item_ref: Wrapper object for PaperScript {item: Item; uri: String}
 * @callback_function: prototype is function(DOMString)
 * @returns: void
 */
function request_resource_text(item_ref, callback_function) {
 request_resource(item_ref, 'DOMString', 'text/plain', callback_function);
}

// EOF
