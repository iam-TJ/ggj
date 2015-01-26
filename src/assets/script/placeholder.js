// harvest.js

if (debug) console.log("Starting harvest...");

var canv = document.getElementById('screen');
canv.style.backgroundColor = 'white';
canv.width = 800;
canv.height = 600;
paper.setup(canv);
paper.project.activeLayer.fitBounds(paper.view.bounds);

if (debug) console.log("Canvas size " + canv.width + "," + canv.height );


var frameNo = 0;
var direction=1;
var directionFreq = 10;
var dropSpeed = 10;
var currentLevel, currentPoints, currentSpeed, score, lives;
var scoreDisplay = new paper.PointText(new paper.Point(20, 50));
var livesDisplay = new paper.PointText(new paper.Point(20, 30));
var playDisplay = new paper.PointText(new paper.Point(400, 300));
var bottom = paper.Path.Line(new paper.Point(0, 600), new paper.Point(800, 600));
bottom.strokeColor = 'black';
var running = 0;
var maxX = 800;
var maxY = 600;
var waitNextLevel=1;
var rectangle = new paper.Path.Rectangle({
  from: [760, 585],
  to: [780, 580]
});

var maxScore = 290;
var oilerSpeed, noDrops, maxDrops;
var dropBatch = 5;
var oilerBatch = 5;

var dropRaster = new paper.Raster({source: 'drop', position: paper.view.center});
dropRaster.scale(0.1);
dropRaster.visible = false;


function init(){
  playDisplay.justification = 'center';
  playDisplay.fillColor = 'black';
  lives = 3;
  score = 0;
  Player.item.position = paper.view.bounds.center.add(new paper.Point(0, 210));
  Oiler.item.position = paper.view.bounds.center.subtract(new paper.Point(0, 250));
  currentLevel = 1;
  currentSpeed = 1;
  currentPoints = 1;
  oilerSpeed = oilerBatch;
  noDrops = 0;
  maxDrops=dropBatch;
  scoreDisplay.fillColor = 'black';
  livesDisplay.fillColor = 'black';
  playDisplay.content = 'Press space to start.'
  drawScore();
}

function resetLevel(){
  for (var i = 0; i < Drops.drops.length; i++) {
    Drops.drops[i].remove();
  }
  while(Drops.drops.length > 0){
    Drops.drops.splice(0, 1);
  }
  currentLevel = 1;
  maxDrops = currentLevel*dropBatch;
  oilerSpeed = currentLevel*oilerBatch;
}

function setNextLevel(){
  running = 0;
  currentLevel++;
  maxDrops = currentLevel*dropBatch;
  oilerSpeed = currentLevel*oilerBatch;
  waitNextLevel=1;
}

function drawScore(){
  scoreDisplay.content = 'Score: ' + score.toString();
  livesDisplay.content = 'Lives: ' + lives.toString();
  rectangle.remove();
  rectangle = new paper.Path.Rectangle({
    from: [760, 585-((score+1)*2)],
    to: [780, 580]
  });
  rectangle.strokeColor = 'black';
}

function onFrame() {
  //End Game
  if(lives == 0){
    playDisplay.content = 'Game Over. Please press space to play again.'
  }
  if(score>=maxScore){
    score = maxScore;
    running = 0;
    playDisplay.content = 'Success! You have enough fuel! Press space to play again'
  }
  if(waitNextLevel && lives!=0 && score!=0)
    playDisplay.content = 'Press space for next level'
  else if(running == 0 && lives!=0 && score!=0)
    playDisplay.content = 'Press space for next life'
  
  //Restart Game
  if (paper.Key.isDown('space') && running == 0 ) {
    if(!waitNextLevel)
      resetLevel();
      
    if(lives==0 || score == maxScore){
      paper.view.onFrame = null;
      done = true;
      return;
    }
    playDisplay.content = '';
    noDrops=0;
    running=1;
    waitNextLevel=0;
  }
  if(running == 1){
    frameNo++;
    if (paper.Key.isDown('left')) {
      Player.moveLeft();
    }
    if (paper.Key.isDown('right')) {
      Player.moveRight();
    }
    if(frameNo % dropSpeed == 0){
      if(noDrops < maxDrops){
        Oiler.dropOil();
        noDrops++;
      }
    }
    if(frameNo % directionFreq == 0){
      Oiler.changeDirection();
    }
    Oiler.move();
    Drops.moveDrops();
    Player.checkCollisions();
    drawScore();
  }

}

var Drops = new function(){
  var speed = new paper.Point(0, 7);
  var drops = [];
  return{
    drops: drops,
    makeDrop: function(position){
      var img = dropRaster.clone();
      img.position = position;
      img.visible = true;
      drops.push(new paper.Group(img));
    }, 
    moveDrops: function(){
      var i;
      for (i=0; i<drops.length; i++){
        if(drops[i] !=null){
          drops[i].position = drops[i].position.add(speed);
        }
      }
    }
  }
}

var Oiler = new function (){
  var oilerRaster = new paper.Raster('oiler');
  oilerRaster.scale(0.2);
  var group = new paper.Group(oilerRaster);
  group.position = paper.view.bounds.center.subtract( new paper.Point(0, 250));
  
  return {
    item: group,				
    dropOil: function() {
      Drops.makeDrop(new paper.Point(group.position.x+30, group.position.y+25));
    }, 
    move: function(){
      group.position = group.position.add( new paper.Point(direction*oilerSpeed , 0)); //
      keepInView(group, 30);
    },
    changeDirection: function(){
      direction = (Math.random()*2)-1;
    }
   }
}

var Player = new function() {
  var speed = new paper.Point([10, 0]);
  var path = paper.Path.Circle(new paper.Point(0, 0), 20);
  path.closed = true;
  path.strokeColor = 'black';
  var playerRaster = new paper.Raster('ship');
  playerRaster.scale(0.2);
  var group = new paper.Group(path, playerRaster);
  group.position = paper.view.bounds.center.add( new paper.Point(0, 210));
  return {
    item: group,

    moveLeft: function() {
      group.position = group.position.subtract( speed);
      keepInView(group, 0);
    },
    
    moveRight: function() {
      group.position = group.position.add( speed);
      keepInView(group, 0);
    },
    checkCollisions: function() {
      for (var i = 0; i < Drops.drops.length; i++) {
        var drop = Drops.drops[i];
        if(drop.bounds.intersects(this.item.bounds)){
          Drops.drops[i].remove();
          Drops.drops.splice(i, 1);
          score+= currentLevel;
          if((noDrops == maxDrops) && (Drops.drops.length == 0)){
            setNextLevel();
          }
        } 
        if(drop.position.y > 600){
          Drops.drops[i].remove();
          Drops.drops.splice(i, 1);
          running=0;
          lives--;
        }
      }
    }
  }
}

function keepInView(item, xOffset) {
  var position = item.position;
  if (position.x > (maxX - xOffset)) {
    position.x = (maxX - xOffset);
  }
  if (position.x <= 0) {
    position.x = 0;
  }
}

paper.view.onFrame = onFrame;
init();

