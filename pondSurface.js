
  ////////////////////////////////////////////////
 //////////////// GLOBAL VARIABLES //////////////
////////////////////////////////////////////////

// debug messages
var DEBUG = false;

// pointer to HTML canvas object
var canvas, ctx;

// x, y coordinates of top left corner of HTML canvas object 
var canvasTop, canvasLeft;

// 2d array to hold individual dot state
var dotMatrix = new Array();
var numRows, numCols;

// global variables
var Globals = {

	// contours of base matrix
	dotSpacing : 60,
	dotRadius : 17,
	dotColor : "000",
	drawBorders : true,
	
	// valid options: "line", "hill", "square", "crosshair", "rainbow"
	pattern : "rainbow",
	
	// rainbow variables
	rainbowWavelength : 25,

	// square variables
	squareWidth : 5,

	// hill variables
	hillMaxDisplacement : 300,
	hillWidth : 25000,
	hillHeight : 10,
	
	// line variables
	lineDisplacement : 50

};


  ////////////////////////////////////////////////
 /////////////////// INITIALIZE /////////////////
////////////////////////////////////////////////
function initPond() {

	debug("initPond started");

	// initialize canvas and its context
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	// get top / left coordinate of canvas to adjust for in mouseMove method
	// regular expression checks if the coordinates were already set in html
	canvasTop = canvas.style.top.match(/\d*/)[0] == "" ? 0 : canvas.style.left.match(/\d*/)[0];
	canvasLeft = canvas.style.left.match(/\d*/)[0] == "" ? 0 : canvas.style.left.match(/\d*/)[0];

	// set canvas.width for relative canvas (ie 100%)
	if (canvas.style.width.match(/%/) != null) {
		// regular expression to eliminate "%" character
		canvas.width = window.innerWidth * (canvas.style.width.match(/.*[^%]/) / 100);
		canvas.height = window.innerHeight * (canvas.style.height.match(/.*[^%]/) / 100);
	}

	numRows = canvas.height / Globals["dotSpacing"];
	numCols = canvas.width / Globals["dotSpacing"];

	// render dot matrix
	for (var x = Globals["drawBorders"] ? 0 : 1; x < numCols + Globals["drawBorders"] ? 1 : 0; x++) {
		dotMatrix[x] = new Array();
		for (var y = Globals["drawBorders"] ? 0 : 1; y < numRows + Globals["drawBorders"] ? 1 : 0; y++) {
			dotMatrix[x][y] = new Dot(x * Globals["dotSpacing"], y * Globals["dotSpacing"], Globals["dotRadius"], Globals["dotColor"]);
			dotMatrix[x][y].draw();
		}
	}

	// detect mouse movement and react patterns
	canvas.addEventListener("mousemove", canvasMouseMove);

	debug("initPond complete");

}


  ////////////////////////////////////////////////
 ///////////////// HTML INTERFACE ///////////////
////////////////////////////////////////////////

function setPattern(newPattern) {
	// clear all the dots
	for (var x = Globals["drawBorders"] ? 0 : 1; x < numCols + Globals["drawBorders"] ? 1 : 0; x++) {
		for (var y = Globals["drawBorders"] ? 0 : 1; y < numRows + Globals["drawBorders"] ? 1 : 0; y++) {
			dotMatrix[x][y].reset();
		}
	}

	Globals["pattern"] = newPattern;
}

function setParameter(parameter, value) {
	Globals[parameter] = value;
	debug(parameter + " changed to " + Globals[parameter]);
}

function getParameter(parameter) {
	return Globals[parameter];
}

  ////////////////////////////////////////////////
 /////////////// MAIN PROGRAM LOOP //////////////
////////////////////////////////////////////////
function canvasMouseMove(e) {
	mouseX = e.clientX - canvasLeft + document.body.scrollLeft;
	mouseY = e.clientY - canvasTop + document.body.scrollTop;

	// clear all the dots
	for (var x = Globals["drawBorders"] ? 0 : 1; x < numCols + Globals["drawBorders"] ? 1 : 0; x++) {
		for (var y = Globals["drawBorders"] ? 0 : 1; y < numRows + Globals["drawBorders"] ? 1 : 0; y++) {
			dotMatrix[x][y].erase();
		}
	}

	// transform them according to set pattern
	var dot;
	var distance, xDiff, yDiff;
	var r, g, b;

	var rowHeight = canvas.height / numRows / 2;
	var columnWidth = canvas.width / numCols / 2;

	for (var x = Globals["drawBorders"] ? 0 : 1; x < numCols + Globals["drawBorders"] ? 1 : 0; x++) {
		for (var y = Globals["drawBorders"] ? 0 : 1; y < numRows + Globals["drawBorders"] ? 1 : 0; y++) {
			
			dot = dotMatrix[x][y];
			
			xDiff = dot.x0 - mouseX;
			yDiff = dot.y0 - mouseY;
			
			switch (Globals["pattern"]) {

			case "line":

				if (dot.x < mouseX) {
					dot.move(dot.x0 - Globals["lineDisplacement"], dot.y0);
				} else {
					dot.move(dot.x0 + Number(Globals["lineDisplacement"]), dot.y0);
				}

				if (dot.y < mouseY) {
					dot.move(dot.x, dot.y0 - Globals["lineDisplacement"]);
				} else {
					dot.move(dot.x, dot.y0 + Number(Globals["lineDisplacement"]));
				}

				dot.draw();
				break;

			case "hill":

				distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
				newDistance = distance + Math.min(Globals["hillMaxDisplacement"], Globals["hillWidth"] / distance);

				dot.move(dot.x0 + (xDiff * (newDistance / distance)) / Globals["hillHeight"], dot.y0 + (yDiff * (newDistance / distance)) / Globals["hillHeight"]);
				dot.draw();

			case "square":

				if (Math.abs(xDiff) > (Globals["squareWidth"] * canvas.width / numCols) / 2 || Math.abs(yDiff) > (Globals["squareWidth"] * canvas.height / numRows) / 2) {
					dot.draw();
				}
				break;

			case "crosshair":
				
				if (Math.abs(xDiff) < columnWidth && Math.abs(yDiff) < rowHeight) {
					// do nothing
				} else if (Math.abs(xDiff) < columnWidth || Math.abs(yDiff) < rowHeight 
					|| (Math.abs(xDiff) < columnWidth * 3 && Math.abs(yDiff) < rowHeight * 3)) {
					dot.draw();
				}
				break;

			case "rainbow":

				// this formula determines the shape of the rainbow
				// larger denominator = longer wavelength
				i = Math.sqrt(xDiff * xDiff + yDiff * yDiff) / Globals["rainbowWavelength"];

				// convert iterator to RGB values
				r = Math.floor(Math.sin(i * Math.PI * 2 / dotMatrix.length) * 127 + 128);
				g = Math.floor(Math.sin(i * Math.PI * 2 / dotMatrix.length + 2) * 127 + 128);
				b = Math.floor(Math.sin(i * Math.PI * 2 / dotMatrix.length + 4) * 127 + 128);

				dot.color = "rgb(" + r + "," + g + "," + b + ")";
				dot.draw();

				break;

			}
		}
	}
}


  ////////////////////////////////////////////////
 //////////////////// CLASSES ///////////////////
////////////////////////////////////////////////
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

	// redraw at initial position in black
	this.reset = function() {
		this.erase();
		this.move(this.x0, this.y0);
		this.color = Globals["dotColor"];
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