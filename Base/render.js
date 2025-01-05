"use strict"

var gl;
var program;
// --- Schritt 2 ---
var vao;
var canvas;
// -----------------

var mouseStartX = 0;
var mouseStartY = 0;

var mouseAbsoluteX = 0;
var mouseAbsoluteY = 0;

var mouseRelativeX = 0;
var mouseRelativeY = 0;

var mousePressed = false;



function render(timestamp, previousTimestamp) {
	// set time uniform
	var iTime = gl.getUniformLocation(program, "iTime");
	gl.uniform1f(iTime, timestamp / 1000.0); // convert to seconds

	// --- Schritt 5 ---
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(program);
	
	gl.bindVertexArray(vao);
	gl.drawArrays(gl.TRIANGLES, 0, 6);	
	// -----------------

	window.requestAnimFrame(function (time) {		
		render(time, timestamp);
	});
}
// -----------------

// --- Schritt 2 ---
function createGeometry()
{
	var vertices = [];
	vertices.push(vec3(-1.0, -1.0,  -1.0)); // ul
	vertices.push(vec3( 1.0, -1.0,  -1.0)); // ur
	vertices.push(vec3(-1.0,  1.0,  -1.0)); // ol

	vertices.push(vec3( 1.0, -1.0,  -1.0)); // ur
	vertices.push(vec3( 1.0,  1.0,  -1.0)); // or	
	vertices.push(vec3(-1.0,  1.0,  -1.0)); // ol
	
	// VertexArrayObject erzeugen
	// Nur VertexArrayObjects können gerendert werden
	vao = gl.createVertexArray(); // globale Variable für das spätere rendern
	gl.bindVertexArray(vao);

	// VertexBufferObject erzeugen
	var vbo = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

	// Hochladen der Daten auf GPU
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);	

	// Binden des aktuellen VBO an ein Attribut im VAO
	gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
	gl.enableVertexAttribArray(0);

	// --- Schritt 6 ---
	var colors = [];
	colors.push(vec2(0.0, 0.0)); // ul
	colors.push(vec2(1.0, 0.0)); // ur
	colors.push(vec2(0.0, 1.0)); // ol

	colors.push(vec2(1.0, 0.0)); // ur
	colors.push(vec2(1.0, 1.0)); // or	
	colors.push(vec2(0.0, 1.0)); // ol

	var vboColor = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vboColor);

	// Hochladen der Daten auf GPU
	gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);	

	gl.vertexAttribPointer(1, 2, gl.FLOAT, gl.FALSE, 0, 0);
	gl.enableVertexAttribArray(1);
	// -----------------	
}

function setupMouseEvents(){
	canvas.addEventListener('mousedown', function(event) {
		var rect = canvas.getBoundingClientRect();
		mouseStartX = event.clientX - rect.left;
		mouseStartY = event.clientY - rect.top;
		mousePressed = true;
	});

	window.addEventListener('mouseup', function(event) {
		mousePressed = false;		
		var iMouse = gl.getUniformLocation(program, "iMouse");
		gl.uniform3f(iMouse, 0, 0, 0.0);

		mouseAbsoluteX = mouseAbsoluteX + mouseRelativeX;
		mouseAbsoluteY = mouseAbsoluteY + mouseRelativeY;

		var iMouse = gl.getUniformLocation(program, "iMouse");
		gl.uniform3f(iMouse, mouseAbsoluteX, mouseAbsoluteY, 0.0);
	});

	canvas.addEventListener('mousemove', function(event) {
		if (mousePressed) {
			var rect = canvas.getBoundingClientRect();
			var mouseX = event.clientX - rect.left;
			var mouseY = event.clientY - rect.top;
			mouseRelativeX = mouseX - mouseStartX;
			mouseRelativeY = mouseY - mouseStartY;
			//console.log("Relative Mouse X: " + relativeX + ", Relative Mouse Y: " + relativeY);

			var iMouse = gl.getUniformLocation(program, "iMouse");
			gl.uniform3f(iMouse, mouseAbsoluteX + mouseRelativeX, mouseAbsoluteY + mouseRelativeY, mousePressed ? 1.0 : 0.0);
		}
	});
}

window.onload = function init() {

	canvas = document.getElementById('rendering-surface');	
	gl = WebGLUtils.setupWebGL( canvas ); // canvas.getContext("webgl2");
	setupMouseEvents();
	
	// --- Schritt 1 ---	
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	// -----------------

	// --- Schritt 4 ---
	program = initShaders(gl, "vertex-shader","fragment-shader");

	gl.useProgram(program);
	// get uniform location of iResolution and set width and height of canvas
	var iResolution = gl.getUniformLocation(program, "iResolution");
	gl.uniform3f(iResolution, canvas.width, canvas.height, 1.0);	

	// -----------------

	// --- Schritt 2 ---
	createGeometry();
	// -----------------

	render(0,0);
}

