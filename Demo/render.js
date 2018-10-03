// must have scene, camera, renderer
var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;

//field of view, aspect ratio, near & far clipping plane
var camera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 );

//This can be swapped out later for VR
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshNormalMaterial();


var cylinderGeometry = new THREE.CylinderBufferGeometry( 2, 2, 8, 10 );
var cylinderMaterial = new THREE.MeshNormalMaterial();
var cylinder = new THREE.Mesh( cylinderGeometry, cylinderMaterial );


var lineMaterial = new THREE.LineBasicMaterial ({ color: 0xffffff});
var lineGeometry = new THREE.Geometry();
lineGeometry.vertices.push(new THREE.Vector3(-20,0,0));
lineGeometry.vertices.push(new THREE.Vector3(-8,0,0));
lineGeometry.vertices.push(new THREE.Vector3(0,3,0));
lineGeometry.vertices.push(new THREE.Vector3(3,0,0));
lineGeometry.vertices.push(new THREE.Vector3(10,0,0));

var line1Material = new THREE.LineBasicMaterial({color: 0xffffff});
var line1Geometry = new THREE.Geometry();
line1Geometry.vertices.push(new THREE.Vector3(-10,0,10));
line1Geometry.vertices.push(new THREE.Vector3(-10,10,10));
line1Geometry.vertices.push(new THREE.Vector3(10,0,0));

var torusgeometry = new THREE.TorusKnotGeometry( 2,5,5,2 );
var torusmaterial = new THREE.MeshNormalMaterial();
var torusKnot = new THREE.Mesh( torusgeometry, torusmaterial );
scene.add( torusKnot );

var torus1geometry = new THREE.TorusKnotGeometry( 5,2,8,5 );
var torus1material = new THREE.MeshNormalMaterial();
var torus1Knot = new THREE.Mesh( torus1geometry, torus1material );
scene.add( torus1Knot );

//mesh takes geometry & applies a meterial to it
var mesh = new THREE.Mesh ( geometry, material);
var cube = new THREE.Mesh( geometry, material );
var line = new THREE.Line( lineGeometry, lineMaterial );
var line1 = new THREE.Line( line1Geometry, line1Material );

scene.add( cylinder );
scene.add( cube );
scene.add( mesh );
scene.add( line );
scene.add( line1 );


//camera is automatically put at 0,0,0 so this brings it out from where the cube is
camera.position.z = 15;

var animate = function () {
  requestAnimationFrame( animate );
  mesh.position.x = 5
  mesh.rotation.x += 0.05;
  cube.position.x = -5;
  cube.position.y += meter.volume*0.5;
  cube.rotation.x += 0.1;
  cube.rotation.y += 0.1;
  torusKnot.position.x = 10;
  torus1Knot.position.x = -18 + (meter.volume*20) ;
  torusKnot.rotation.x += 0.5*meter.volume;
  torus1Knot.rotation.x += 0.01;
  cylinder.rotation.x += 0.5*meter.volume;
  line.rotation.x += 0.05;
  renderer.render( scene, camera );
};

animate();


/*
The MIT License (MIT)
Copyright (c) 2014 Chris Wilson
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH=500;
var HEIGHT=50;
var rafID = null;

window.onload = function() {

    // grab our canvas
	canvasContext = document.getElementById( "meter" ).getContext("2d");
	
    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
	
    // grab an audio context
    audioContext = new AudioContext();

    // Attempt to get audio input
    try {
        // monkeypatch getUserMedia
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;

        // ask for an audio input
        navigator.getUserMedia(
        {
            "audio": {
                "mandatory": {
                    "googEchoCancellation": "false",
                    "googAutoGainControl": "false",
                    "googNoiseSuppression": "false",
                    "googHighpassFilter": "false"
                },
                "optional": []
            },
        }, gotStream, didntGetStream);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }

}


function didntGetStream() {
    alert('Stream generation failed.');
}

var mediaStreamSource = null;

function gotStream(stream) {
    // Create an AudioNode from the stream.
    mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);

    // kick off the visual updating
    drawLoop();
}

function drawLoop( time ) {
    // clear the background
    
    canvasContext.clearRect(0,0,WIDTH,HEIGHT);

    // check if we're currently clipping
    if (meter.checkClipping())
        canvasContext.fillStyle = "red";
    else
        canvasContext.fillStyle = "green";

    // draw a bar based on the current volume
    canvasContext.fillRect(0, 0, meter.volume*WIDTH*1.4, HEIGHT);
    /*
    var geometry = new THREE.BoxGeometry( 1, 1, 1 );
    var material = new THREE.MeshNormalMaterial();
    var cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
    cube.position.x = 0;
    cube.position.y = 8;
    
    var torusgeometry = new THREE.TorusKnotGeometry( 2,5,5,2 );
    var torusmaterial = new THREE.MeshNormalMaterial();
    var torusKnot = new THREE.Mesh( torusgeometry, torusmaterial );
    scene.add( torusKnot );
    torusKnot.position.x = -15;
    torusKnot.position.y = -10;

    
    var rotate = function(){
        requestAnimationFrame( rotate );
        cube.rotation.y = THREE.Math.degToRad(meter.volume*10000);
        //torusKnot.position.x += meter.volume*20;
        renderer.render( scene, camera );

    }
    rotate(); */
    // camera.position.z = 10*meter.volume*WIDTH;

    // set up the next visual callback
    rafID = window.requestAnimationFrame( drawLoop );
}