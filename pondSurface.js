
// debug messages
var DEBUG = false;

// pointer to HTML canvas object
var canvas, ctx;

// x, y coordinates of top left corner of HTML canvas object 
var canvasTop, canvasLeft;

// canvas has a 4:3 aspect ratio
// current dimensions = 1024:768
var NUM_ROWS = 12;
var NUM_COLS = 16;
var DRAW_BORDERS = true;

// dot constants
var DOT_RADIUS = 15;
var DOT_COLOR = "000";

var dotMatrix = new Array();

// valid options: "lines", "circle", "square", "crosshair"
var pattern = "crosshair";

// pattern variables
var CIRCLE_MAX_DISPLACEMENT = 300;
var LINE_DISPLACEMENT = 20;
var SQUARE_WIDTH = 3;


function initPond() {

	debug("initPond started");

	// initialize canvas and its context
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	canvasTop = canvas.style.top.match(/\d*/)[0];
	canvasLeft = canvas.style.left.match(/\d*/)[0];

	xSpace = canvas.width / NUM_COLS;
	ySpace = canvas.height / NUM_ROWS;

	for (var x = DRAW_BORDERS ? 0 : 1; x < NUM_COLS + DRAW_BORDERS ? 1 : 0; x++) {
		dotMatrix[x] = new Array();
		for (var y = DRAW_BORDERS ? 0 : 1; y < NUM_ROWS + DRAW_BORDERS ? 1 : 0; y++) {
			dotMatrix[x][y] = new Dot(x * xSpace, y * ySpace, DOT_RADIUS, DOT_COLOR);
			dotMatrix[x][y].draw();
		}
	}

	canvas.addEventListener("mousemove", canvasMouseMove);

	debug("initPond complete");

}

function canvasMouseMove(e) {
	mouseX = e.clientX - canvasLeft + document.body.scrollLeft;
	mouseY = e.clientY - canvasTop + document.body.scrollTop;

	// clear all the dots
	for (var x = DRAW_BORDERS ? 0 : 1; x < NUM_COLS + DRAW_BORDERS ? 1 : 0; x++) {
		for (var y = DRAW_BORDERS ? 0 : 1; y < NUM_ROWS + DRAW_BORDERS ? 1 : 0; y++) {
			dotMatrix[x][y].erase();
		}
	}

	// transform them according to set pattern
	var dot;
	var distance, xDiff, yDiff, columnWidth, rowHeight;
	for (var x = DRAW_BORDERS ? 0 : 1; x < NUM_COLS + DRAW_BORDERS ? 1 : 0; x++) {
		for (var y = DRAW_BORDERS ? 0 : 1; y < NUM_ROWS + DRAW_BORDERS ? 1 : 0; y++) {
			
			dot = dotMatrix[x][y];
			
			xDiff = dot.x0 - mouseX;
			yDiff = dot.y0 - mouseY;
			
			rowHeight = canvas.height / NUM_ROWS / 2;
			columnWidth = canvas.width / NUM_COLS / 2;
			
			if (pattern == "lines") {

				if (dot.x < mouseX) {
					dot.move(dot.x0 - LINE_DISPLACEMENT, dot.y0);
				} else {
					dot.move(dot.x0 + LINE_DISPLACEMENT, dot.y0);
				}

				if (dot.y < mouseY) {
					dot.move(dot.x, dot.y0 - LINE_DISPLACEMENT);
				} else {
					dot.move(dot.x, dot.y0 + LINE_DISPLACEMENT);
				}

				dot.draw();

			} else if (pattern == "circle") {

				distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
				newDistance = distance + Math.min(CIRCLE_MAX_DISPLACEMENT, 25000 / distance);

				dot.move(dot.x0 + (xDiff * (newDistance / distance)) / 10, dot.y0 + (yDiff * (newDistance / distance)) / 10);
				dot.draw();

			} else if (pattern == "square") {

				if (Math.abs(xDiff) > (SQUARE_WIDTH * canvas.width / NUM_COLS) / 2 || Math.abs(yDiff) > (SQUARE_WIDTH * canvas.height / NUM_ROWS) / 2) {
					dot.draw();
				}

			} else if (pattern == "crosshair") {
				
				if (Math.abs(xDiff) < columnWidth && Math.abs(yDiff) < rowHeight) {
					// do nothing
				} else if (Math.abs(xDiff) < columnWidth || Math.abs(yDiff) < rowHeight) {
					dot.draw();
				} else if (Math.abs(xDiff) < columnWidth * 3 && Math.abs(yDiff) < rowHeight * 3) {
					dot.draw();
				}
				
			}
		}
	}
}

// class to store data / methods for dots
function Dot(x0, y0, r, color) {
	
	// initial coordinates
	this.x0 = x0;
	this.y0 = y0;

	// current coordinates
	this.x = x0;
	this.y = y0;

	this.r = r;
	this.color = color;

	// render dot at current location
	this.draw = function() {
		drawCircle(this.x, this.y, this.r, this.color);
	}

	// erase dot
	this.erase = function() {
		drawCircle(this.x, this.y, this.r + 1, "FFF");
	}

	// redraw dot at new coordinates
	this.move = function(x1, y1) {
		this.x = x1;
		this.y = y1;
	}

	// redraw at initial position
	this.reset = function() {
		this.erase();
		this.move(this.x0, this.y0);
		this.draw();
	}

}


  ////////////////////////////////////////////////
 //////////////// DRAWING HELPERS ///////////////
////////////////////////////////////////////////


// draw a circle with center at specified coordinates
// filled in
function drawCircle(x, y, r, color) {
	
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(x, y, r, 0, Math.PI * 2);
	
	ctx.fill();
	ctx.closePath();
	
}


// draw a line from (x0, y0) to (x1, y1) of specified color
function drawLine(x0, y0, x1, y1, color) {

	ctx.beginPath();
	ctx.strokeStyle = color;
	ctx.lineWidth = 1;

	ctx.moveTo(x0, y0);
	ctx.lineTo(x1, y1);

	ctx.stroke();
	ctx.closePath();

}


  ////////////////////////////////////////////////
 ///////////////////// DEBUG ////////////////////
////////////////////////////////////////////////

function debug(message) {
	if (DEBUG) {
		console.log(message);
	}
}