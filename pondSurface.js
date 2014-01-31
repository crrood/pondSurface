

var canvas, ctx;

var canvasTop, canvasLeft;

// canvas has a 4:3 aspect ratio
var NUM_ROWS = 12;
var NUM_COLS = 16;

var DOT_RADIUS = 15;
var DOT_COLOR = "000";

var dotMatrix = new Array();

var pattern = "circle";

function initPond() {

	console.log("initPond started");
	
	// initialize canvas and its context
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");

	canvasTop = canvas.style.top.match(/\d*/)[0];
	canvasLeft = canvas.style.left.match(/\d*/)[0];

	xSpace = canvas.width / NUM_COLS;
	ySpace = canvas.height / NUM_ROWS;

	for (var x = 1; x < NUM_COLS; x++) {
		dotMatrix[x] = new Array();
		for (var y = 1; y < NUM_ROWS; y++) {
			dotMatrix[x][y] = new Dot(x * xSpace, y * ySpace, DOT_RADIUS, DOT_COLOR);
			dotMatrix[x][y].draw();
		}
	}

	canvas.addEventListener("mousemove", canvasMouseMove);

	console.log("initPond complete");

}

function canvasMouseMove(e) {
	//console.log("(" + (e.clientX - canvasLeft) + ", " + (e.clientY - canvasTop) + ")");
	mouseX = e.clientX - canvasLeft;
	mouseY = e.clientY - canvasTop;

	var dot;
	var distance, xDiff, yDiff;
	for (var x = 1; x < dotMatrix.length; x++) {
		for (var y = 1; y < dotMatrix[x].length; y++) {
			
			dot = dotMatrix[x][y];
			dot.reset();
			if (pattern == "lines") {
				if (dot.x < mouseX) {
					dot.move(dot.x0 - 20, dot.y0);
				} else {
					dot.move(dot.x0 + 20, dot.y0);
				}

				if (dot.y < mouseY) {
					dot.move(dot.x, dot.y0 - 20);
				} else {
					dot.move(dot.x, dot.y0 + 20);
				}
			} else if (pattern == "circle") {
				xDiff = dot.x0 - mouseX;
				yDiff = dot.y0 - mouseY;
				distance = Math.sqrt(xDiff * xDiff + yDiff * yDiff);

				newDistance = distance + (25000 / distance);
				dot.move(dot.x0 + (xDiff * (newDistance / distance)) / 10, dot.y0 + (yDiff * (newDistance / distance)) / 10);
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

	// render dot
	this.draw = function() {
		drawCircle(x0, y0, r, color);
	}

	// erase current dot and move to new coordinates
	this.move = function(x1, y1) {
		drawCircle(this.x, this.y, r + 1, "FFF");
		drawCircle(x1, y1, r, color);

		this.x = x1;
		this.y = y1;
	}

	// redraw at initial position
	this.reset = function() {
		this.move(x0, y0);
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