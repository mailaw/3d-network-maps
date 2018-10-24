var camera, scene, renderer, local_canvas, controls;
var mesh, color;
function init() {
  // must have scene, camera, renderer
  scene = new THREE.Scene();
  var aspect = window.innerWidth / window.innerHeight;

  local_canvas = document.getElementById("vis-window");

  //field of view, aspect ratio, near & far clipping plane
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

  //orbital controls
  controls = new THREE.OrbitControls(camera, local_canvas);

  //This can be swapped out later for VR
  renderer = new THREE.WebGLRenderer({ canvas: local_canvas });

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  //presets for variables that GUI will cchange
  var options = {
    material: {
      opacity: 0.8,
      transparent: true
    },
    radiusTop: 0.1,
    radiusBottom: 0.1,
    boxOpacity: 0.8
  };

  //Creating the dat.GUI
  gui = new dat.GUI();

  var cylinderControl = gui.addFolder("Cylinders");
  cylinderControl
    .add(options, "boxOpacity", 0, 1)
    .name("Opacity")
    .onChange(function() {
      cubeMaterial.opacity = options.boxOpacity;
      //options.boxOpacity = this.opacity;
      console.log("hey opacity", options.boxOpacity);
    });

  /* cylinderControl
  .add(options.material, "opacity", 0, 1)
  .name("OpacityWListen")
  .listen(); */

  //test cube
  var cubeGeometry = new THREE.CubeGeometry(100, 100, 100);
  var cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0x1cff44,
    emissive: 0x1cff44,
    transparent: true,
    opacity: options.boxOpacity
  });
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  scene.add(cube);
}

var data;
function readEntityData(results) {
  data = results["data"];

  for (let index = 0; index < data.length; index++) {
    var entity_row = data[index];

    //render cylinders
    var cylinderHeight = entity_row.z2 - entity_row.z1;
    var cylinderGeometry = new THREE.CylinderBufferGeometry(
      0.2,
      0.2,
      cylinderHeight
    );
    var cylinderMaterial = new THREE.MeshNormalMaterial();
    var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.x = entity_row.x;
    cylinder.position.y = (entity_row.z2 - entity_row.z1) / 2 + entity_row.z1;
    cylinder.position.z = entity_row.y;
    scene.add(cylinder);
  }
}

function readRelationData(results) {
  data = results["data"];

  for (let index = 0; index < data.length; index++) {
    var entity_row = data[index];

    //render planes
    var cylinderWidth = Math.sqrt(
      Math.pow(entity_row.x3 - entity_row.x1, 2) +
        Math.pow(entity_row.y3 - entity_row.y1, 2)
    );
    var cylinderHeight = entity_row.z2 - entity_row.z1;
    var planeGeometry = new THREE.PlaneBufferGeometry(
      cylinderWidth,
      cylinderHeight
    );

    var geometry = new THREE.Geometry();

    geometry.vertices.push(
      new THREE.Vector3(entity_row.x1, entity_row.z1, entity_row.y1),
      new THREE.Vector3(entity_row.x2, entity_row.z2, entity_row.y2),
      new THREE.Vector3(entity_row.x4, entity_row.z4, entity_row.y4),
      new THREE.Vector3(entity_row.x3, entity_row.z3, entity_row.y3)
    );
    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(0, 2, 3));
    geometry.faces.push(new THREE.Face3(2, 1, 0));
    geometry.faces.push(new THREE.Face3(3, 2, 0));
    geometry.computeBoundingSphere();

    var planeMaterial = new THREE.MeshLambertMaterial({
      color: 0x1cff44,
      emissive: 0x1cff44,
      transparent: true,
      opacity: 0.6
    });
    var plane = new THREE.Mesh(geometry, planeMaterial);
    //plane.position.x = (entity_row.x1+entity_row.x3)/2;
    //plane.position.z = (entity_row.y1+entity_row.y3)/2;
    //plane.position.y = cylinderHeight/2;
    //plane.rotation.y = Math.atan((entity_row.z3 - entity_row.z1)/(entity_row.x3 - entity_row.x1));
    scene.add(plane);
  }
}

function handleEntityFileSelect(evt) {
  var file = evt.target.files[0];

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: readEntityData
  });
}

function handleRelationFileSelect(evt) {
  var file = evt.target.files[0];

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: readRelationData
  });
}

$(document).ready(function() {
  $("#entity-csv-file").change(handleEntityFileSelect);
});

$(document).ready(function() {
  $("#relationship-csv-file").change(handleRelationFileSelect);
});

init();

//camera is automatically put at 0,0,0 so this brings it out from where the cube is
camera.position.set(120, 15, 5, 0, 0, 100);
camera.lookAt(scene.position);
controls.update();

var animate = function() {
  requestAnimationFrame(animate);

  //var speed = (Date.now() * 0.0005) / 2;
  //camera.position.x = Math.cos(speed) * 10;
  //camera.position.z = Math.sin(speed) * 10;

  //camera.lookAt(scene.position); //0,0,0
  controls.update();
  renderer.render(scene, camera);
};

animate();
