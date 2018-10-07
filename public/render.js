// must have scene, camera, renderer
var scene = new THREE.Scene();
var aspect = window.innerWidth / window.innerHeight;

//field of view, aspect ratio, near & far clipping plane
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);

//This can be swapped out later for VR
var renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

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

    //add planes
  }

  console.log("DOE STHIS WORK");
}

function handleFileSelect(evt) {
  var file = evt.target.files[0];

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: readEntityData
  });
}

$(document).ready(function() {
  $("#csv-file").change(handleFileSelect);
});

//camera is automatically put at 0,0,0 so this brings it out from where the cube is
camera.position.set(20, 2, 5);
camera.lookAt(scene.position);

var animate = function() {
  requestAnimationFrame(animate);

  var speed = Date.now() * 0.0005;
  camera.position.x = Math.cos(speed) * 10;
  camera.position.z = Math.sin(speed) * 10;

  camera.lookAt(scene.position); //0,0,0
  renderer.render(scene, camera);
};

animate();
