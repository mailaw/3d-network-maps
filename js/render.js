// must have scene, camera, renderer
var abx = 0, aby = 200, abz = 0;
var scene, camera, renderer, controls;
var timeOpacity;
var gui;
var parameters = {
  radiusTop: 0.2,
  //radiusBottom: 0.5,
  opacity: 0.8,
  time:100,
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
var projector, mouse = {
    x: 0,
    y: 0
  },
  INTERSECTED;
init();
animate();

function init() {
  // SCENE
  scene = new THREE.Scene();
  // CAMERA
  var SCREEN_WIDTH = window.innerWidth,
    SCREEN_HEIGHT = window.innerHeight;
  var VIEW_ANGLE = 45,
    ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT,
    NEAR = 0.1,
    FAR = 20000;
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene.add(camera);
  camera.position.set(0, 150, 400);
//  camera.up = new THREE.Vector3( 1, 0, 0 );
  camera.lookAt(scene.position);

  renderer = new THREE.WebGLRenderer({
    antialias: true
  });
  renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
  document.body.appendChild(renderer.domElement);
  // EVENTS

  /////dat.GUI MENU
  //
  gui = new dat.GUI({ autoPlace: false });
  gui.domElement.id = "gui-position";
  var customContainer = document.getElementById("gui-position");
  customContainer.appendChild(gui.domElement);

  var timeFolder = gui.addFolder("Time");

  timeOpacity = timeFolder
    .add(parameters, "time")
    .min(0)
    .max(200)
    .step(5)
    .name("Time")
    .listen();
  timeFolder.open();

  // CONTROLS
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  // LIGHT
  var light = new THREE.PointLight(0xffffff);
  light.position.set(0, 250, 0);
  scene.add(light);
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
}


var data;


function readEntityData(results) {
  data = results["data"];

  for (let index = 0; index < data.length-1; index++) {
    var entity_row = data[index];

    //render cylinders
    var cylinderHeight = entity_row.z2 - entity_row.z1;
    var cylinderGeometry = new THREE.CylinderBufferGeometry(
      5,
      5,
      cylinderHeight*40
    );
    var cylinderMaterial = new THREE.MeshNormalMaterial();
    var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.x = entity_row.x*40;
    cylinder.position.y = ((entity_row.z2 - entity_row.z1) / 2 + entity_row.z1)*40;
    cylinder.position.z = entity_row.y*40;
    cylinder.name = entity_row.name;
    abx = Math.min(cylinder.position.x,abx);
    aby = Math.min(entity_row.z1,aby);
    abz = Math.min(cylinder.position.z,abz);
    console.log(40*entity_row.z1);
    console.log("aby:"+aby);
    console.log(cylinder.name);
    scene.add(cylinder);
   }

   var axis = new THREE.AxesHelper(400);
   axis.position.set(abx,aby,abz);
   scene.add(axis);
   var gridXY = new THREE.GridHelper(300, 10);
   gridXY.rotation.x = Math.PI/2;
   gridXY.position.set(abx+150,aby+150,abz);
//   gridXY.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
   var gridXZ = new THREE.GridHelper(300, 10);
   gridXZ.rotation.x = Math.PI;
   gridXZ.position.set(abx+150,aby,abz+150);
   var gridYZ = new THREE.GridHelper(300, 10);
   gridYZ.rotation.x = Math.PI;
   gridYZ.rotation.z = Math.PI/2;
   gridYZ.position.set(abx,aby+150,abz+150);
   var timeGrid = new THREE.GridHelper(300, 10);
   timeGrid.rotation.x = Math.PI;
   timeGrid.position.set(abx+150,aby+30,abz+150);
   scene.add(gridXY);
   scene.add(gridXZ);
   scene.add(gridYZ);
   scene.add(timeGrid);

   timeOpacity.onChange(function(value) {
     timeGrid.position.y = value;
   });

}

function readRelationData(results) {
    data = results["data"];

    for (let index = 0; index < data.length-1; index++) {
    var entity_row = data[index];

    //render planes
    var cylinderWidth = Math.sqrt(Math.pow(entity_row.x3-entity_row.x1,2)+Math.pow(entity_row.y3-entity_row.y1,2));
    var cylinderHeight = entity_row.z2-entity_row.z1;
    var planeGeometry = new THREE.PlaneBufferGeometry(
        cylinderWidth,
        cylinderHeight
    );

    var geometry = new THREE.Geometry();

    geometry.vertices.push(
    	new THREE.Vector3( entity_row.x1,  entity_row.z1, entity_row.y1),
    	new THREE.Vector3( entity_row.x2,  entity_row.z2, entity_row.y2),
    	new THREE.Vector3( entity_row.x4,  entity_row.z4, entity_row.y4),
      new THREE.Vector3( entity_row.x3,  entity_row.z3, entity_row.y3)
    );
    geometry.faces.push( new THREE.Face3(0,1,2) );
    geometry.faces.push( new THREE.Face3(0,2,3) );
    geometry.faces.push( new THREE.Face3(2,1,0) );
    geometry.faces.push( new THREE.Face3(3,2,0) );
    geometry.computeBoundingSphere();

    var planeMaterial = new THREE.MeshLambertMaterial( {
						color: 0x1cff44,
						emissive: 0x1cff44,
                        transparent: true,
                        opacity: 0.6,
        
					} );
    var plane = new THREE.Mesh(geometry, planeMaterial);
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

////camera is automatically put at 0,0,0 so this brings it out from where the cube is
//camera.position.set(120, 15, 5,0,0,100);
//camera.lookAt(scene.position);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  update();
//  var axis = new THREE.AxesHelper(200);
//  console.log("ax:"+ax);
//  scene.add(axis);
};

function onDocumentMouseMove(event) {
  // the following line would stop any other event handler from firing
  // (such as the mouse's TrackballControls)
  // event.preventDefault();

  // update the mouse variable
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function update() {
  // find intersections

  // create a Ray with origin at the mouse position
  //   and direction into the scene (camera direction)
  camera.updateMatrixWorld();
  var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
  vector.unproject(camera);
  var ray = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());

  // create an array containing all objects in the scene with which the ray intersects
  var intersects = ray.intersectObjects(scene.children);

  // INTERSECTED = the object in the scene currently closest to the camera
  //    and intersected by the Ray projected from the mouse position

  // if there is one (or more) intersections
  if (intersects.length > 0) {
    // if the closest object intersected is not the currently stored intersection object
    if (intersects[0].object != INTERSECTED) {
      // restore previous intersection object (if it exists) to its original color
      if (INTERSECTED)
//        INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
//      // store reference to closest object as current intersection object
      INTERSECTED = intersects[0].object;
//      // store color of closest object (for later restoration)
//      INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
//      // set a new color for closest object
//      INTERSECTED.material.color.setHex(0xffff00);
      console.log("name:"+intersects[0].object.name);
      document.getElementById("test").innerHTML = intersects[0].object.name;
    }
  } else // there are no intersections
  {
    // restore previous intersection object (if it exists) to its original color
    if (INTERSECTED)
      INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
    // remove previous intersection object reference
    //     by setting current intersection object to "nothing"
    INTERSECTED = null;
  }

   controls.update();
  /* stats.update(); */
}

//function updateTimeGrid() {
//  timeGrid.position.y = parameters.time;
//}

//document.getElementById("test").innerHTML = intersects[0].object.name;