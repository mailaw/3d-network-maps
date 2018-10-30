//global vars
var camera, scene, renderer, local_canvas, controls;
//custom vars
var plane, planeOpacity;
var cylinder, cylinderRadius;

//scene data
var cylinder_list = [];
var cylinder_postion_list = [];

var plane_list = [];
var plane_position_list = [];



var parameters = {
  radiusTop: 0.2,
  //radiusBottom: 0.5,
  opacity: 0.8,
  visible: true,
  scale: 1.0,
  scene_red_channel: 0,
  scene_green_channel: 0,
  scene_blue_channel: 0,
  reset: function() {
    resetPlane();
    resetRadius();
  }
};
var gui;
var data;

$(document).ready(function() {
  $("#entity-csv-file").change(handleEntityFileSelect);
});

$(document).ready(function() {
  $("#relationship-csv-file").change(handleRelationFileSelect);
});

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

function readEntityData(results) {
  data = results["data"];
  //var radiusVar = 0.5;

  for (let index = 0; index < data.length; index++) {
    var entity_row = data[index];

    //render cylinders
    var cylinderHeight = entity_row.z2 - entity_row.z1;
    var geometry = new THREE.CylinderBufferGeometry(0.2, 0.2, cylinderHeight);
    var material = new THREE.MeshNormalMaterial();
    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.position.x = entity_row.x;
    cylinder.position.y = (entity_row.z2 - entity_row.z1) / 2 + entity_row.z1;
    cylinder.position.z = entity_row.y;
    cylinder_postion_list.push([cylinder.position.x, cylinder.position.y, cylinder.position.z]);
    scene.add(cylinder);
    cylinder_list.push(cylinder);
    //console.log(cylinder.geometry.parameters.radiusTop);
  }

  //currently: properly changing and registering
  // cylinderRadius.onChange(function(value) {
  //   cylinder.geometry.parameters.radiusTop = value;
  //   //console.log(cylinder.geometry.parameters.radiusTop);
  // });
  cylinder.geometry.parameters.radiusTop = 0.5;
  //console.log(cylinder.geometry.parameters.radiusTop);
  //updateRadius();
}

function readRelationData(results) {
  data = results["data"];

  var material = new THREE.MeshLambertMaterial({
    color: 0x1cff44,
    emissive: 0x1cff44,
    transparent: true,
    opacity: 0.8
  });

  for (let index = 0; index < data.length; index++) {
    var entity_row = data[index];

    /*is this all old code?
    var cylinderWidth = Math.sqrt(
      Math.pow(entity_row.x3 - entity_row.x1, 2) +
        Math.pow(entity_row.y3 - entity_row.y1, 2)
    );
    var cylinderHeight = entity_row.z2 - entity_row.z1;
    var planeGeometry = new THREE.PlaneBufferGeometry(
      cylinderWidth,
      cylinderHeight
    );*/

    var geometry = new THREE.Geometry();

    geometry.vertices.push(
      new THREE.Vector3(entity_row.x1, entity_row.z1, entity_row.y1),
      new THREE.Vector3(entity_row.x2, entity_row.z2, entity_row.y2),
      new THREE.Vector3(entity_row.x4, entity_row.z4, entity_row.y4),
      new THREE.Vector3(entity_row.x3, entity_row.z3, entity_row.y3)
    );

    plane_position_list.push([entity_row.x1, entity_row.z1, entity_row.y1,
                              entity_row.x2, entity_row.z2, entity_row.y2,
                              entity_row.x4, entity_row.z4, entity_row.y4,
                              entity_row.x3, entity_row.z3, entity_row.y3])

    geometry.faces.push(new THREE.Face3(0, 1, 2));
    geometry.faces.push(new THREE.Face3(0, 2, 3));
    geometry.faces.push(new THREE.Face3(2, 1, 0));
    geometry.faces.push(new THREE.Face3(3, 2, 0));
    geometry.computeBoundingSphere();

    var plane = new THREE.Mesh(geometry, material);
    //plane.position.x = (entity_row.x1+entity_row.x3)/2;
    //plane.position.z = (entity_row.y1+entity_row.y3)/2;
    //plane.position.y = cylinderHeight/2;
    //plane.rotation.y = Math.atan((entity_row.z3 - entity_row.z1)/(entity_row.x3 - entity_row.x1));
    scene.add(plane);
    plane_list.push(plane);
  }

  planeOpacity.onChange(function(value) {
    plane.material.opacity = value;
    //console.log(scene);
  });
  //updatePlane();
}

init();
animate();

function init() {
  // must have scene, camera, renderer
  scene = new THREE.Scene();
  var aspect = window.innerWidth / window.innerHeight;

  local_canvas = document.getElementById("vis-window");

  //field of view, aspect ratio, near & far clipping plane
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  //camera is automatically put at 0,0,0 so this brings it out from where the cube is
  camera.position.set(120, 15, 5, 0, 0, 100);
  camera.lookAt(scene.position);
  //orbital controls
  controls = new THREE.OrbitControls(camera, local_canvas);

  //This can be swapped out later for VR
  renderer = new THREE.WebGLRenderer({ canvas: local_canvas });
  renderer.setPixelRatio(2); //inscreases internal render resolution

  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  /*test cube
  var cubeGeometry = new THREE.CubeGeometry(100, 100, 100);
  var cubeMaterial = new THREE.MeshLambertMaterial({
    color: 0x1cff44,
    emissive: 0x1cff44,
    transparent: true,
    opacity: 1
  });
  var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  scene.add(cube);*/

  //Creating the dat.GUI
  gui = new dat.GUI();

  var planeFolder = gui.addFolder("Planes");

  planeOpacity = planeFolder
    .add(parameters, "opacity")
    .min(0)
    .max(1)
    .step(0.01)
    .name("Opacity")
    .listen();
  planeFolder.open();

  var cylinderFolder = gui.addFolder("Cylinders");

  cylinderRadius = cylinderFolder
    .add(parameters, "radiusTop")
    .min(0)
    .max(1)
    .step(0.05)
    .name("Radius")
    .listen();

  cylinderFolder.open();

  cylinderRadius.onChange(function(value) {
    for(let i = 0; i < cylinder_list.length; i++){
      cylinder_list[i].geometry = new THREE.CylinderBufferGeometry(value,value,
        cylinder_list[i].geometry.parameters.height);
    }
  });


  var globalFolder = gui.addFolder("Global Options");

  scaleFactor = globalFolder
    .add(parameters, "scale")
    .min(0)
    .max(10)
    .step(0.1)
    .name("Scale")
    .listen();



  scaleFactor.onChange(function(value) {
    //cylinder expansion
    for(let i = 0; i < cylinder_list.length; i++){
      cylinder_list[i].position.x = cylinder_postion_list[i][0] * value;
      cylinder_list[i].position.z = cylinder_postion_list[i][2] * value;
    }

    //plane expansion
    for(let i = 0; i < plane_list.length; i++){
      for(let j = 0; j < 4; j++){
        plane_list[i].geometry.vertices[j].x = plane_position_list[i][j*3] * value;
        plane_list[i].geometry.vertices[j].z = plane_position_list[i][j*3 + 2] * value;
      }
      plane_list[i].geometry.verticesNeedUpdate = true;
    }
  });

  var background_color_folder = globalFolder.addFolder("Background Color");

  scene_red_channel = background_color_folder
    .add(parameters, "scene_red_channel")
    .min(0)
    .max(255)
    .step(1)
    .name("Background Red Channel")
    .listen();

  scene_red_channel.onChange(function(value){
    scene.background = new THREE.Color(parameters.scene_red_channel/255,
                                       parameters.scene_green_channel/255,
                                       parameters.scene_blue_channel/255);
  });

  scene_green_channel = background_color_folder
    .add(parameters, "scene_green_channel")
    .min(0)
    .max(255)
    .step(1)
    .name("Background Green Channel")
    .listen();

  scene_green_channel.onChange(function(value){
    scene.background = new THREE.Color(parameters.scene_red_channel/255,
                                       parameters.scene_green_channel/255,
                                       parameters.scene_blue_channel/255);
  });

  scene_blue_channel = background_color_folder
    .add(parameters, "scene_blue_channel")
    .min(0)
    .max(255)
    .step(1)
    .name("Background Blue Channel")
    .listen();

  scene_blue_channel.onChange(function(value){
    scene.background = new THREE.Color(parameters.scene_red_channel/255,
                                       parameters.scene_green_channel/255,
                                       parameters.scene_blue_channel/255);
  });

  background_color_folder.open();


  globalFolder.open();


  gui.open();
}

function updatePlane() {
  plane.material.opacity = parameters.opacity;
  plane.material.transparent = true;
}
function resetPlane() {
  parameters.opacity = 1;
  parameters.visible = true;
  updatePlane();
}

function updateRadius() {
  cylinder.geometry.parameters.radiusTop = parameters.radiusTop;
  //cylinder.geometry.parameters.radiusBottom = parameters.radiusBottom;
}
function resetRadius() {
  parameters.radiusTop = 0.1;
  //parameters.radiusBottom = 0.1;
  updateRadius();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}
