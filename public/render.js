// must have scene, camera, renderer
var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;

var local_canvas = document.getElementById("vis-window");

//field of view, aspect ratio, near & far clipping plane
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

//orbital controls
var controls = new THREE.OrbitControls( camera, local_canvas);

//This can be swapped out later for VR
var renderer = new THREE.WebGLRenderer({canvas:local_canvas});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var data;

function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
   Papa.parse(result, {
    header: true,
    dynamicTyping: true,
    complete: function(results) {
    result = results.data;
  }
  });
  return result;
}
function renderCylinders(data){
  
  for (let index = 0; index < data.length-1; index++) {
    var entity_row = data[index];

    //render cylinders
    var cylinderHeight = (entity_row.z2 - entity_row.z1)*10;
    var geometry = new THREE.CylinderBufferGeometry(0.5, 0.5, cylinderHeight);
    //var cylinder_color = new THREE.Color("rgb(255, 0, 0)");
    var material = new THREE.MeshLambertMaterial({color: 0xff0000 });
    var cylinder = new THREE.Mesh(geometry, material);
    //cylinder.material.color.setHex( 0xADD8E6 );
    cylinder.castShadow = true;
    cylinder.receiveShadow = true;

    cylinder.position.x = entity_row.x;
    cylinder.position.y = (entity_row.z2 - entity_row.z1)*5 + entity_row.z1*10;
    cylinder.position.z = entity_row.y;

    cylinder.name = entity_row.name;
    cylinder.starting_date = entity_row.starting_date;
    cylinder.ending_date = entity_row.ending_date;

    cylinder_postion_list.push([
      cylinder.position.x,
      cylinder.position.y,
      cylinder.position.z
    ]);
    minx = Math.min(cylinder.position.x,minx);
    miny = Math.min(entity_row.z1,miny);
    minz = Math.min(cylinder.position.z,minz);
    maxx = Math.max(cylinder.position.x,maxx);
    maxy = Math.max(entity_row.z2,maxy);
    maxz = Math.max(cylinder.position.z,maxz);

    scene.add(cylinder);
    cylinder_list.push(cylinder);
  }

  maxv = Math.max(maxx-minx,maxz-minz);
  maxv = Math.max(maxv*10,maxy);

  cylinder.geometry.parameters.radiusTop = 0.5;

  var time_folder = globalFolder.addFolder("Time");
  time_line = time_folder
  .add(parameters, "time")
  .min(miny)
  .max(miny+1.1*maxv)
  .step(0.011*maxv)
  .name("Time")
  .listen();

  //axis, and grid
  var axis = new THREE.AxesHelper(1.2*maxv);
  axis.position.set(minx*10,miny,minz*10);
  scene.add(axis);
  var gridXY = new THREE.GridHelper(1.1*maxv, 10);
  gridXY.rotation.x = Math.PI/2;
  gridXY.position.set(minx*10+0.55*maxv,miny+0.55*maxv,minz*10);
//   gridXY.setColors( new THREE.Color(0xff0000), new THREE.Color(0xffffff) );
  var gridXZ = new THREE.GridHelper(1.1*maxv, 10);
  gridXZ.rotation.x = Math.PI;
  gridXZ.position.set(minx*10+0.55*maxv,miny,minz*10+0.55*maxv);
  var gridYZ = new THREE.GridHelper(1.1*maxv, 10);
  gridYZ.rotation.x = Math.PI;
  gridYZ.rotation.z = Math.PI/2;
  gridYZ.position.set(minx*10,miny+0.55*maxv,minz*10+0.55*maxv);
  var timeGrid = new THREE.GridHelper(1.1*maxv, 10);
  timeGrid.rotation.x = Math.PI;
  timeGrid.position.set(minx*10+0.55*maxv,miny+0.55*maxv,minz*10+0.55*maxv);

  scene.add(gridXY);
  scene.add(gridXZ);
  scene.add(gridYZ);
  scene.add(timeGrid);

  time_line.onChange(function(value) { 
    parameters.time = miny+0.55*maxv;
    timeGrid.position.y = value;
  });
}

function renderPlanes(data){
  //data = results["data"];

  var material = new THREE.MeshLambertMaterial({
    color: 0x1cff44,
    emissive: 0x1cff44,
    transparent: true,
    opacity: 0.8
  });

  for (let index = 0; index < data.length; index++) {
    var entity_row = data[index];

    var geometry = new THREE.Geometry();

    geometry.vertices.push(
      new THREE.Vector3(entity_row.x1, entity_row.z1*10, entity_row.y1),
      new THREE.Vector3(entity_row.x2, entity_row.z2*10, entity_row.y2),
      new THREE.Vector3(entity_row.x4, entity_row.z4*10, entity_row.y4),
      new THREE.Vector3(entity_row.x3, entity_row.z3*10, entity_row.y3)
    );

    plane_position_list.push([
      entity_row.x1,
      entity_row.z1*10,
      entity_row.y1,
      entity_row.x2,
      entity_row.z2*10,
      entity_row.y2,
      entity_row.x4,
      entity_row.z4*10,
      entity_row.y4,
      entity_row.x3,
      entity_row.z3*10,
      entity_row.y3
    ]);

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
  });
  //updatePlane();

}

function readEntityData(results) {
  data = results["data"];
  sendToBackend(data);
}

function readRelationData(results) {
      data = results["data"];
      sendToBackend(data);
      //load files only once both entity and relationship data have beeen processed
      entityData = loadFile("/static/mock_entity_output.csv");
      relationData = loadFile("/static/mock_relationship_output.csv");
      renderCylinders(entityData);
      renderPlanes(relationData);

}

function sendToBackend(file){
    var struct = [];
    for (let index = 0; index < data.length; index++) {
      struct.push(file[index]);
    }
    $.ajax({
            type: 'POST',
            url: '/execute',
            data: {d: JSON.stringify(struct)},
            dataType: "jsonp",
            success: function(data) {
                console.log(data);
            },
        });
        
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

 function init() {
  // Note: must have scene, camera, renderer

  //SCENE
  scene = new THREE.Scene();
  scene.background = new THREE.Color().setHSL(0.6, 0, 1);
  scene.fog = new THREE.Fog(scene.background, 1, 5000);
  var aspect = window.innerWidth / window.innerHeight;

  local_canvas = document.getElementById("vis-window");

  //CAMERA
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  //camera is automatically put at 0,0,0 so this brings it out from where the cube is
  camera.position.set(30, 15, 0);
  camera.lookAt(scene.position);
  scene.add(camera);

  // Orbital Controls
  controls = new THREE.OrbitControls(camera, local_canvas);
//  controls.autoRotate = true;
  //RENDERER
  //This can be swapped out later for VR
  renderer = new THREE.WebGLRenderer({ canvas: local_canvas });
  //renderer.setPixelRatio(2); //inscreases internal render resolution
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.BasicShadowMap;

  document.body.appendChild(renderer.domElement);

  //MOUSE
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);

  // LIGHTS
  /*helper to see direction of light
  var helper = new THREE.CameraHelper(camera);
  scene.add(helper);*/
  //light for hemispherical illumination
  var amblientLight = new THREE.AmbientLight( 0x404040, 3 ); // soft white light
  scene.add( amblientLight);
  //light attatched to camera
  var light = new THREE.PointLight(0xffffff,0.8, 90);
  light.position.set(10,6,-3);
  light.castShadow = true;
  light.shadow.camera.near = 50;
  light.shadow.camera.far = 550;
  camera.add(light);
  //add light to follow the camera 
  scene.add( camera );

  //Client requested to be commented out & left for future dev
  /* GROUND
  var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
  var groundMat = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    specular: 0x050505
  });
  groundMat.color.setHSL(0.095, 1, 0.75);
  var ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -33;
  scene.add(ground);
  ground.receiveShadow = true; */

  //dat.GUI MENU
  gui = new dat.GUI({ autoPlace: false });
  gui.domElement.id = "gui-position";
  var customContainer = document.getElementById("gui-position");
  customContainer.appendChild(gui.domElement);

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

  //cylinder color control
  cylinder_red_channel = cylinderFolder
    .add(parameters, "cylinder_red_channel")
    .min(0)
    .max(255)
    .step(1)
    .name("Red")
    .listen();

    cylinder_red_channel.onChange(function(value) {
      for (let i = 0; i < cylinder_list.length; i++) {
        cylinder_list[i].material.color.setRGB(
          parameters.cylinder_red_channel / 255,
          parameters.cylinder_green_channel / 255,
          parameters.cylinder_blue_channel / 255
        );
      }
  });

  cylinder_green_channel = cylinderFolder
    .add(parameters, "cylinder_green_channel")
    .min(0)
    .max(255)
    .step(1)
    .name("Green")
    .listen();

    cylinder_green_channel.onChange(function(value) {
      for (let i = 0; i < cylinder_list.length; i++) {
        cylinder_list[i].material.color.setRGB(
          parameters.cylinder_red_channel / 255,
          parameters.cylinder_green_channel / 255,
          parameters.cylinder_blue_channel / 255
        );
      }
  });

  cylinder_blue_channel = cylinderFolder
    .add(parameters, "cylinder_blue_channel")
    .min(0)
    .max(255)
    .step(1)
    .name("Blue")
    .listen();

    cylinder_blue_channel.onChange(function(value) {
      for (let i = 0; i < cylinder_list.length; i++) {
        cylinder_list[i].material.color.setRGB(
          parameters.cylinder_red_channel / 255,
          parameters.cylinder_green_channel / 255,
          parameters.cylinder_blue_channel / 255
        );
      }
  });

  cylinderRadius = cylinderFolder
    .add(parameters, "radiusTop")
    .min(0)
    .max(1)
    .step(0.05)
    .name("Radius")
    .listen();

  cylinderFolder.open();

  cylinderRadius.onChange(function(value) {
    for (let i = 0; i < cylinder_list.length; i++) {
      cylinder_list[i].geometry = new THREE.CylinderBufferGeometry(
        value*2,
        value*2,
        cylinder_list[i].geometry.parameters.height
      
      );
    }
  });

  globalFolder = gui.addFolder("Global Options");

  scaleFactor = globalFolder
    .add(parameters, "scale")
    .min(0)
    .max(10)
    .step(0.1)
    .name("Scale")
    .listen();

  scaleFactor.onChange(function(value) {
    //cylinder expansion
    for (let i = 0; i < cylinder_list.length; i++) {
      cylinder_list[i].position.x = cylinder_postion_list[i][0] * value;
      cylinder_list[i].position.z = cylinder_postion_list[i][2] * value;
    }

    //plane expansion
    for (let i = 0; i < plane_list.length; i++) {
      for (let j = 0; j < 4; j++) {
        plane_list[i].geometry.vertices[j].x =
          plane_position_list[i][j * 3] * value;
        plane_list[i].geometry.vertices[j].z =
          plane_position_list[i][j * 3 + 2] * value;
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
    .name("Red Channel")
    .listen();

  scene_red_channel.onChange(function(value) {
    scene.background = new THREE.Color(
      parameters.scene_red_channel / 255,
      parameters.scene_green_channel / 255,
      parameters.scene_blue_channel / 255
    );
  });

  scene_green_channel = background_color_folder
    .add(parameters, "scene_green_channel")
    .min(0)
    .max(255)
    .step(1)
    .name("Green Channel")
    .listen();

  scene_green_channel.onChange(function(value) {
    scene.background = new THREE.Color(
      parameters.scene_red_channel / 255,
      parameters.scene_green_channel / 255,
      parameters.scene_blue_channel / 255
    );
  });

  scene_blue_channel = background_color_folder
    .add(parameters, "scene_blue_channel")
    .min(0)
    .max(255)
    .step(1)
    .name("Blue Channel")
    .listen();

  scene_blue_channel.onChange(function(value) {
    scene.background = new THREE.Color(
      parameters.scene_red_channel / 255,
      parameters.scene_green_channel / 255,
      parameters.scene_blue_channel / 255
    );
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
  parameters.radiusTop = 0.5;
  //parameters.radiusBottom = 0.1;
  updateRadius();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
  update();
}
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
       //INTERSECTED.material.color.setHex(INTERSECTED.currentHex);
      // store reference to closest object as current intersection object
      INTERSECTED = intersects[0].object;
      // store color of closest object (for later restoration)
      //INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
      // set a new color for closest object
      // INTERSECTED.material.color.setHex(0xffff00);
      //console.log("name:"+intersects[0].object.name);

      document.getElementById("display_name").innerHTML = intersects[0].object.name;
      document.getElementById("display_starting").innerHTML = intersects[0].object.starting_date;
      document.getElementById("display_ending").innerHTML = intersects[0].object.ending_date;
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
}