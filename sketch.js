// README
/*
Restock the Farmer's Market 
Julian Bi Ying Jiang

INSTRUCTIONS
The goal of the game is to throw all the moldy produce (the fruits and vegetables) into the garbage and restock the bins of produce with fresh produce from the basket. 
Use the mouse to navigate the game. When an aspect is interactable, the hand (controlled by the mouse) will splay open. 
Try to restock the farmer's market without wasting any fresh produce!

VIDEO
<paste video URL here>

RELEASE
I Julian Bi Ying Jiang grant permission to CS105 course staff to use
my Final Project program and video for the purpose of promoting CS105.

BASIC CONCEPTS
- Drawing shapes and using drawing attributes (e.g. fill, stroke, lineCap, ...):
    Used in the drawButton function
- Conditionals: 
    Used in detectBasketButtons function
- User-defined functions:
    A good example is the genBin function
- Loops:
    Used to draw the produce (fruits and veggies) in the bins in the middle.
- Arrays: 
    The basket array is an array of objects. See most of it's use in the drawBasket function and detectBasketButtons function.
- Mouse or keyboard interaction: 
    Mouse interaction used. Look in mouseClicked function.

EXTENDED CONCEPTS
- Remapping with map():
    I used map in the genBin function to map the maximum amount of moldy produce in a bin relative to the MAX_MOLD_PER_BIN ratio out of 100 and MAX_PRODUCE_IN_BIN.
- Objects: 
    All the buttons were objects, all the produce were objects.
- Rectangle or circle hit testing: 
    I used this in the detectButton function to detect if the cursor is hovering over a rectangle button.
- Loading and displaying images: 
    I drew all the images that were used. They were loaded in preload and used throughout the game.


CODING QUALITY AND VISUAL DESIGN
<argue for your coding quality and visual design>
The code is broken down into many functions. 
The variables', constants' and functions' names are clear, descriptive, while staying concise. 
The visuals have a cohesive colour palette, and were hand-drawn by me then loaded in.
The game is a calming sorting activity.
All user-defined functions have a comment header describing their purpose.
*/

// Constants
const MAX_MOLD_PER_BIN = 50; // out of 100

const MAX_PRODUCE_IN_BIN = 64;
const PRODUCE_BIN_ROWS = 8;

const BIN_SIZE = 320; // side length
const BIN_MARGIN = 36;
const BIN_ITEM_SIZE = 70;

const CURSOR_SIZE = 80;

const BUTTON_STROKE = "#945419";
const BUTTON_FILL = "#CC9947";

const DISPLAY_BIN_SIDE = 100;
const DISPLAY_BIN_TEXT_SIZE = 16;
const DISPLAY_BIN_BUTTON_FILL = "#703E36";
const DISPLAY_BIN_BUTTON_STROKE = "#4F2924";

const BASKET_SIZE = 375;
const BASKET_ITEM_SIZE = 80;

const GARBAGE_X = 400;
const GARBAGE_Y = 100;
const GARBAGE_W = 300;
const GARBAGE_H = 120;

const BG_COLOUR = "#FAF1D7";

// Variables
let freshWasted = 0; // fresh produce that was wasted
let moldyLeft = 0;
let openSpots = 0;

let gameGoing = false;
let gameEnded = false;
let newGameInitiated = false;

let viewBasket = false;
let binSelected = -1; // Index of the produce

let produceInBin = [];
let itemInHand;

let basket = [];
let basketButtons = [];
let basketX;
let basketY;

let produceNames = [];
let produceImgs = [];
let displayBinButtons = [];
let produceButtons = [];
let produceMissing = [];
let produceMoldy = [];

let playButton, okButton, doneButton, garbageButton;

let apple, orange, banana, strawberry, kiwi, cherry;
let broccoli, carrot, cucumber, celery, potato, onion;

// Images
let startingScreenImg;

let moldImgs = [];
let binImg;
let displayBinImg;

let noImg;

let basketImg;
let handPointImg, handOpenImg, handGrabImg;

function preload() {
  noImg = loadImage("images/transparentSquare.png");
  
  startingScreenImg = loadImage("images/startingScreen.png");
  
  binImg = loadImage("images/bin.png");
  displayBinImg = loadImage("images/displayBin.png");
  
  produceNames = ["apple", "orange", "banana", "strawberry", "kiwi", "cherry", "broccoli", "carrot", "cucumber", "celery", "potato", "onion"];
  
  produceImgs.length = produceNames.length;
  
  for (let i = 0; i < produceImgs.length; i++) {
    produceImgs[i] = loadImage("images/" + produceNames[i] + ".png");
  }

  basketImg = loadImage("images/basket.png");
  
  // Mold
  moldImgs[0] = loadImage("images/mold/1.png");
  moldImgs[1] = loadImage("images/mold/2.png");
  moldImgs[2] = loadImage("images/mold/3.png");
  
  // Hand
  handPointImg = loadImage("images/handPoint.png");
  handOpenImg = loadImage("images/handOpen.png");
  handGrabImg = loadImage("images/handGrab.png");
}

function setup() {
  createCanvas(800, 800);
  imageMode(CENTER);
  textFont('Verdana');
  initiatePlayButton();
  initiateDoneButton();
  initiateOkButton();
  initiateDisplayBinButtons();
  initiateProduceButtons();
  initiateBasketButtons();
  initiateGarbageButton();
  background(220);
  
  noCursor();
}

/*
  End the game with a message and OK button to return to the starting screen.
*/
function endGame(message) {
  background("#C4FFFA"); 
  image(startingScreenImg, width / 2, height / 2);
  
  fill(0, 125);
  noStroke();
  rectMode(CORNER);
  rect(0, 0, width, height);
  
  textAlign(CENTER, CENTER);
  strokeWeight(4);
  stroke(0);
  fill(255);
  textSize(50);
  
  text(message, width / 2, 320);
  drawButton(okButton);
}

/*
  Initiate the variables and arrays for a new game.
*/
function initiateNewGame() {
  gameEnded = false;

  viewBasket = true;
  binSelected = -1;
  freshWasted = 0; 
  
  createProduce();
  basket.length = produceNames.length;
  for(let i = 0; i < basket.length; i++) {
    basket[i] = {
      name: produceNames[i],
      img: produceImgs[i],
      amount: produceMoldy[i] // amount of the item
    };
  }
  
  openSpots = 0;
  moldyLeft = 0;
  
  for(let i = 0; i < produceMoldy.length; i++) {
    moldyLeft += produceMoldy[i];
  }
  
  initiateHandItem();
}

/*
  Initiate hand object to have no item
*/
function initiateHandItem() {
  itemInHand = {
    name: "none",
    img: noImg,
    moldy: false,
    imgMold: noImg,
    taken: false
  };
}

function draw() {
  background(BG_COLOUR);
  
  if (!gameGoing && !newGameInitiated) {
    drawStartScreen();
  } else if (gameGoing){ 
    if (!newGameInitiated) { 
      initiateNewGame();
      newGameInitiated = true;
    }
    drawStats(30, 50);
    
    if (moldyLeft === 0 && openSpots === 0) {
      doneButton.label = "Done";
    } else {
      doneButton.label = "Retry";
    }
    drawButton(doneButton);
    drawMarket();
    
    if (binSelected >= 0) {
      drawBin();
    }
    if (viewBasket) {
      drawBasket();
    }
  } else {
    drawEndScreen();
  }
  
  drawCursor();
}

/*
  Draw the end screen depending on the player's statistics.
*/
function drawEndScreen() {
  if (moldyLeft === 0 && openSpots === 0) {
    endGame("Done!");
  } else {
    endGame("Try Again...");
  }
  drawStats(width / 2 - 115, 50);
}

/*
  Draw player's statistics at x, y.
*/
function drawStats(x, y) {
  strokeWeight(3);
  fill(BUTTON_FILL);
  stroke(BUTTON_STROKE);
  rectMode(CORNER);
  
  rect(x - 10, y - 20, 230, 100);
  
  textAlign(LEFT, CENTER);
  noStroke();
  fill(255);
  textSize(16);
  
  text("Fresh produce wasted: " + freshWasted, x, y);
  text("Moldy produce: " + moldyLeft, x, y + 30);
  text("Open spots: " + openSpots, x, y + 60);
}

/*
  Draw a hand that follows the cursor.
*/
function drawCursor() {
  if(gameGoing) {
    image(itemInHand.img, mouseX, mouseY, CURSOR_SIZE, CURSOR_SIZE);
    image(itemInHand.imgMold, mouseX, mouseY, map(3, 1, 5, 0, CURSOR_SIZE), map(3, 1, 5, 0, CURSOR_SIZE));
  }
  if (mouseIsPressed) {
    image(handGrabImg, mouseX + CURSOR_SIZE * 0.25, mouseY + CURSOR_SIZE * 0.25, CURSOR_SIZE, CURSOR_SIZE);
  } else if (detectInteract()){
    image(handOpenImg, mouseX + CURSOR_SIZE * 0.25, mouseY + CURSOR_SIZE * 0.25, CURSOR_SIZE, CURSOR_SIZE);
  } else {
    image(handPointImg, mouseX + CURSOR_SIZE * 0.25, mouseY + CURSOR_SIZE * 0.25, CURSOR_SIZE, CURSOR_SIZE);
  }
}

/*
  Detect when the mouse hovers over an interactable aspect.
  Returns a boolean value.
*/
function detectInteract() {
  if (detectButton(playButton) || 
      detectButton(okButton) || 
      (detectButton(garbageButton) && itemInHand.name !== "none") || 
      detectButton(doneButton)) {
    return true;
  } 

  for (let i = 0; i < displayBinButtons.length; i++) {
    if (detectButton(displayBinButtons[i])) {
      return true;
    }
  }
  for (let k = 0; k < basketButtons.length; k++) {
    if (detectButton(basketButtons[k]) && 
        ((itemInHand.name === "none" && basket[k].amount > 0) || 
         (itemInHand.name !== "none" && basket[k].amount === 0) || 
         (itemInHand.name !== "none" && basket[k].name === itemInHand.name))) {
      return true;
    }
  }
  for (let k = 0; k < produceButtons.length; k++) {
    if (detectButton(produceButtons[k]) && !produceInBin[k].taken && itemInHand.name === "none") {
      return true;
    }
  }
  return false;
}

/*
  Draw the starting screen to begin playing
*/
function drawStartScreen() {
  background("#C4FFFA"); 
  image(startingScreenImg, width / 2, height / 2);
  
  textAlign(CENTER, CENTER);
  strokeWeight(4);
  stroke(0);
  fill(255);
  textSize(50);
  
  text("Farmer's Market", width / 2, 340);
  textSize(30);
  text("Restock the", width / 2, 290);
  
  drawButton(playButton);
}

/*
  Initiate the play button.
*/
function initiatePlayButton() {
  playButton = {
	x: width / 2,
	y: 700,
    fSize: 30, // fontSize
    fillColour: 255,
    strokeColour: 0,
	w: 200,
	h: 60,
    hover: false,
	label: "Play!",
    visible: true
  };
}

/*
  Initiate the ok button.
*/
function initiateOkButton() {
  okButton = {
	x: width / 2,
	y: height - 50,
    fSize: 16, // fontSize
    fillColour: BUTTON_FILL,
    strokeColour: BUTTON_STROKE,
	w: 50,
	h: 30,
    hover: false,
	label: "OK",
    visible: false
  };
}

/*
  Initiate the garbage button.
*/
function initiateGarbageButton() {
  garbageButton = {
	x: GARBAGE_X,
	y: GARBAGE_Y,
    fSize: 1, 
    fillColour: BG_COLOUR,
    strokeColour: BG_COLOUR,
	w: GARBAGE_W,
	h: GARBAGE_H,
    hover: false,
	label: "Back",
    visible: false
  };
}

/*
  Initiate the display bin buttons.
*/
function initiateDisplayBinButtons() {
  displayBinButtons.length = produceNames.length;
  
  let buttonX = 150;
  let buttonY = 100;
  for (let j = 0; j < displayBinButtons.length; j++) {
    if (j === displayBinButtons.length / 2) {
      buttonX = width - 150;
      buttonY = 100;
    }
    buttonY += 100;
    
    displayBinButtons[j] = { 
      x: buttonX,
      y: buttonY,
      fSize: 16, // fontSize
      fillColour: DISPLAY_BIN_BUTTON_FILL,
      strokeColour: DISPLAY_BIN_BUTTON_STROKE,
      w: DISPLAY_BIN_SIDE * 0.85,
      h: DISPLAY_BIN_SIDE * 0.85,
      hover: false,
      label: produceNames[j],
      visible: false
    };
  }
}

/*
  Initiate the produce (fruits and veggies in the bins) buttons.
*/
function initiateProduceButtons() { 
  produceButtons.length = MAX_PRODUCE_IN_BIN;
  let index = 0;
  let x;
  let y = height / 2 - BIN_SIZE / 2 + BIN_MARGIN;
  for (let r = 0; r < PRODUCE_BIN_ROWS; r++) {
    x = width / 2 - BIN_SIZE / 2 + BIN_MARGIN;
    for (let c = 0; c < PRODUCE_BIN_ROWS; c++) {
      produceButtons[index] = {
        x: x,
        y: y,
        fSize: 1, // fontSize
        fillColour: DISPLAY_BIN_BUTTON_FILL,
        strokeColour: DISPLAY_BIN_BUTTON_STROKE,
        w: BIN_ITEM_SIZE / 2,
        h: BIN_ITEM_SIZE / 2,
        hover: false,
        label: "",
        visible: false
      };
      x += BIN_ITEM_SIZE / 2;
      index++;
    }
    y += BIN_ITEM_SIZE / 2;
  }
}

/*
  Initiate the done/retry button.
  This button ends the game when clicked.
*/
function initiateDoneButton() {
  doneButton = {
	x: width - 100,
	y: 80,
    fSize: 20, // fontSize
    fillColour: BUTTON_FILL,
    strokeColour: BUTTON_STROKE,
	w: 70,
	h: 50,
    hover: false,
	label: "Done",
    visible: false
  };
}

/*
  Initiates the basket items buttons.
*/
function initiateBasketButtons() {
  basketButtons.length = basket.length;
  
  basketX = width / 2;
  basketY = height - 175;
  
  let x;
  let y = basketY - BASKET_SIZE / 2 + 150;
  let index = 0;
  
  // items
  for (let r = 0; r < 3; r++) {
    x = basketX - BASKET_SIZE / 2 + 100; 
    for (let c = 0; c < 4; c++) {
      basketButtons[index] = {
        x: x,
        y: y,
        fSize: 12, // fontSize
        fillColour: DISPLAY_BIN_BUTTON_FILL,
        strokeColour: DISPLAY_BIN_BUTTON_STROKE,
        w: BASKET_ITEM_SIZE / 2,
        h: BASKET_ITEM_SIZE / 2,
        hover: false,
        label: "",
        visible: false
      };
      x += BASKET_ITEM_SIZE * 0.75;
      index++;
    }
    y += BASKET_ITEM_SIZE * 0.8;
  }
}

/*
  Draw button with the button object's properties.
*/
function drawButton(button) {
  button.visible = true;
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  
  textSize(button.fSize);
  fill(button.fillColour);
  stroke(button.strokeColour);
  rect(button.x, button.y, button.w, button.h);
  noStroke();
  fill(button.strokeColour);
  text(button.label, button.x, button.y);
}

/*
  Detect when cursor hovers over the button and changes colours of the button accordingly.
  Return boolean value.
*/
function detectButton(button) {
  if (mouseX >= button.x - button.w / 2 && 
     mouseX <= button.x + button.w / 2 &&
     mouseY >= button.y - button.h / 2 &&
     mouseY <= button.y + button.h / 2 && button.visible) { // hover
    if (!button.hover) {
      let tempColour = button.strokeColour;
      button.strokeColour = button.fillColour;
      button.fillColour = tempColour;
      button.hover = true;
    }
    return true;
  } else {
    if (button.hover && button.visible) {
      let tempColour = button.strokeColour;
      button.strokeColour = button.fillColour;
      button.fillColour = tempColour;
    }
    button.hover = false;
    return false;
  }
}

/*
  Draw the market layout with display bins and garbage.
*/
function drawMarket() {
  let x = 150;
  let y = 100;
  for (let i = 0; i < produceNames.length; i++) {
    if (i === produceNames.length / 2) { 
      x = width - 150;
      y = 100;
    }
    y += 100;
    drawDisplayBin(i, x, y);
  }
  drawGarbage();
}

/*
  Draw display bin with an image of the item on it and the name of the item at x, y.
*/
function drawDisplayBin(itemIndex, x, y) {
  drawButton(displayBinButtons[itemIndex]);
  
  textAlign(CENTER, CENTER);
  textSize(16);
  fill(255);
  noStroke();
  
  image(displayBinImg, x, y, DISPLAY_BIN_SIDE, DISPLAY_BIN_SIDE);
  text(produceNames[itemIndex], x, y - map(1, 0, 2, 0, DISPLAY_BIN_SIDE / 2));
  image(produceImgs[itemIndex], x, y + map(3, 1, 10, 0, DISPLAY_BIN_SIDE / 2), DISPLAY_BIN_SIDE * 0.75, DISPLAY_BIN_SIDE * 0.75);
}

/*
  Generate a new bin of produce with mold.
*/
function genBin(index) {
  let produce = [];
  produce.length = MAX_PRODUCE_IN_BIN;
  let moldCount = 0;
  for (let i = 0; i < produce.length; i++) {
    produce[i] = {
      name: produceNames[index],
      img: produceImgs[index],
      moldy: false,
      imgMold: noImg,
      taken: false // picked up out of the bin alr or not
    };
    if (moldCount < map(MAX_MOLD_PER_BIN, 0, 100, 0, MAX_PRODUCE_IN_BIN) && (random([1, 2, 3, 4, 5]) === 2)) {
      produce[i].moldy = true;
      produce[i].imgMold = random(moldImgs);
      moldCount++;
    }
  }
  produceMoldy[index] = moldCount;
  return produce;
}

/*
  Calls genBin function to create all produce objects.
*/
function createProduce() {
  apple = genBin(0);
  orange = genBin(1);
  banana = genBin(2);
  strawberry = genBin(3);
  kiwi = genBin(4);
  cherry = genBin(5);
  broccoli = genBin(6);
  carrot = genBin(7);
  cucumber = genBin(8);
  celery = genBin(9);
  potato = genBin(10);
  onion = genBin(11);
}

/*
  Draw the produce bin.
*/
function drawBin() {
  produceInBin = produceBinSelected();
  image(binImg, width / 2, height / 2, BIN_SIZE, BIN_SIZE);
  
  let x;
  let y = height / 2 - BIN_SIZE / 2 + BIN_MARGIN;
  let moldSize = map(3, 1, 5, 0, BIN_ITEM_SIZE);
  
  for (let i = 0; i < produceInBin.length; i++) {
    image(produceInBin[i].img, produceButtons[i].x, produceButtons[i].y, BIN_ITEM_SIZE, BIN_ITEM_SIZE);
    if (!produceInBin[i].taken && produceInBin[i].moldy) {
      image(produceInBin[i].imgMold, produceButtons[i].x, produceButtons[i].y, moldSize, moldSize);
    }
    produceButtons[i].visible = true;
  }
}

/*
  Draw the garbage box.
*/
function drawGarbage() {
  garbageButton.visible = true;
  
  image(displayBinImg, GARBAGE_X, GARBAGE_Y, GARBAGE_W, GARBAGE_H);
  textAlign(CENTER, CENTER);
  textSize(16);
  fill(255);
  noStroke();
  
  text("GARBAGE", GARBAGE_X, GARBAGE_Y / 2 + 20);
}

/*
  Return the array of the produce bin selected.
*/
function produceBinSelected() {
  if (binSelected === 0) {
    return apple;
  } else if (binSelected === 1) {
    return orange;
  } else if (binSelected === 2) {
    return banana;
  } else if (binSelected === 3) {
    return strawberry;
  } else if (binSelected === 4) {
    return kiwi;
  } else if (binSelected === 5) {
    return cherry;
  } else if (binSelected === 6) {
    return broccoli;
  } else if (binSelected === 7) {
    return carrot;
  } else if (binSelected === 8) {
    return cucumber;
  } else if (binSelected === 9) {
    return celery;
  } else if (binSelected === 10) {
    return potato;
  } else if (binSelected === 11) {
    return onion;
  }
}

/*
  Draw the basket with the items within.
*/
function drawBasket() {  
  basketX = width / 2;
  basketY = height - 150;
  
  image(basketImg, basketX, basketY, BASKET_SIZE, BASKET_SIZE);
  
  fill(255);
  stroke(0);
  strokeWeight(3);
  textSize(20);
  textAlign(CENTER, CENTER);
  
  for (let i = 0; i < basketButtons.length; i++) { 
    if (basket[i].name !== "none") {
      image(basket[i].img, basketButtons[i].x, basketButtons[i].y, BASKET_ITEM_SIZE, BASKET_ITEM_SIZE);
      basketButtons[i].visible = true;
    } else {
      basketButtons[i].visible = false;
    }
    if (basket[i].amount > 1) {
      text(basket[i].amount, basketButtons[i].x, basketButtons[i].y + 10);
    }
  }
}

function mouseClicked() {
  if (detectButton(playButton)) {
    gameGoing = true;
    playButton.visible = false;
  }
  
  if (detectButton(doneButton)) {
    for (let i = 0; i < displayBinButtons.length; i++) {
      displayBinButtons[i].visible = false;
    }
    for (let i = 0; i < basketButtons.length; i++) {
      basketButtons[i].visible = false;
    }
    for (let i = 0; i < produceButtons.length; i++) {
      produceButtons[i].visible = false;
    }
    garbageButton.visible = false;
    
    gameGoing = false;
  } 
  
  if (detectButton(okButton)) {
    gameGoing = false;
    newGameInitiated = false;
  } 
  
  for (let k = 0; k < displayBinButtons.length; k++) {
    if (detectButton(displayBinButtons[k])) {
      if (k === binSelected) {
        binSelected = -1; // exit from bin if reselected
      } else {
        binSelected = k;
      }
    }
  }
  detectBasketButtons();
  detectProduceButtons();
  detectGarbageButton();
}

/*
  Detect interaction with the garbage.
  Throws away item in hand.
*/
function detectGarbageButton() {
  if (detectButton(garbageButton) && itemInHand.name !== "none") {
    if (!itemInHand.moldy){
      freshWasted++;
    } else {
      moldyLeft--;
    }
    itemInHand.name = "none";
    itemInHand.img = noImg;
    itemInHand.imgMold = noImg;
    itemInHand.moldy = false;
  }
}

/*
  Detect interaction with the basket items buttons.
*/
function detectBasketButtons() {
  for (let k = 0; k < basketButtons.length; k++) {
    if(detectButton(basketButtons[k])) {
      if(itemInHand.name === "none" && basket[k].amount > 0) { 
          // taking 1 item from the basket
        itemInHand.name = basket[k].name;
        itemInHand.img = basket[k].img;
        itemInHand.taken = true;
        basket[k].amount--;
        if(basket[k].amount === 0) {
          basket[k].img = noImg;
        }
      } else if ((itemInHand.name !== "none" && basket[k].amount === 0) || 
                 (basket[k].name === itemInHand.name && !itemInHand.moldy)) {
          // putting an item into the basket
        basket[k].amount++;
        basket[k].name = itemInHand.name;
        basket[k].img = itemInHand.img;
        itemInHand.name = "none";
        itemInHand.img = noImg;
      }
    }
  }
}

/*
  Detect interaction with the produce buttons.
*/
function detectProduceButtons() {
  for (let k = 0; k < produceButtons.length; k++) {
    if (detectButton(produceButtons[k])) {
      print("clicked produce: " + produceNames[binSelected] + k);
      if (itemInHand.name === "none" && !produceInBin[k].taken) {
          // taking from bin
        openSpots++;
        itemInHand = {
          name: produceNames[binSelected],
          img: produceImgs[binSelected],
          moldy: produceInBin[k].moldy,
          imgMold: produceInBin[k].imgMold,
          taken: true
        };
        produceInBin[k].img = noImg;
        produceInBin[k].moldy = false;
        produceInBin[k].imgMold = noImg;
        produceInBin[k].taken = true;
        print("picked up from bin: " + itemInHand.name);
      } else if (produceInBin[k].taken && itemInHand.name === produceInBin[k].name) {
          // putting in bin
        openSpots--;
        produceInBin[k].img = itemInHand.img;
        produceInBin[k].moldy = itemInHand.moldy;
        produceInBin[k].imgMold = itemInHand.imgMold;
        produceInBin[k].taken = false;
        print("put in bin: " + produceInBin[k].name);
        itemInHand.name = "none";
        itemInHand.moldy = false;
        itemInHand.img = noImg;
        itemInHand.imgMold = noImg;
      }
    }
  }
}
