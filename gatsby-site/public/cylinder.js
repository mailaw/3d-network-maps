let csvToJson = require('convert-csv-to-json')

let json = csvToJson.getJsonFromCsv('mock_entity_output.csv')
for (let i = 0; i < json.length; i++) {
  console.log(json[i])
  console.log('HEYYYYYYYYY LOADING')
}

// must have scene, camera, renderer
var scene = new THREE.Scene()
var aspect = window.innerWidth / window.innerHeight

//field of view, aspect ratio, near & far clipping plane
var camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)

//This can be swapped out later for VR
var renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

var cylinderGeometry = new THREE.CylinderBufferGeometry(2, 2, 8, 10)
var cylinderMaterial = new THREE.MeshNormalMaterial()
var cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial)

var lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
var lineGeometry = new THREE.Geometry()
lineGeometry.vertices.push(new THREE.Vector3(-10, 0, 0))
lineGeometry.vertices.push(new THREE.Vector3(0, 5, 0))
lineGeometry.vertices.push(new THREE.Vector3(3, 0, 0))
lineGeometry.vertices.push(new THREE.Vector3(10, 0, 0))

//mesh takes geometry & applies a meterial to it
var mesh = new THREE.Mesh(geometry, material)
var cube = new THREE.Mesh(geometry, material)
var line = new THREE.Line(lineGeometry, lineMaterial)
scene.add(cylinder)
scene.add(line)

//camera is automatically put at 0,0,0 so this brings it out from where the cube is
camera.position.z = 15

var animate = function() {
  requestAnimationFrame(animate)
  cylinder.rotation.x += 0.05
  renderer.render(scene, camera)
}

animate()
