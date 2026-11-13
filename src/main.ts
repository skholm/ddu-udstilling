import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";

//set up scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	0.1,
	100,
);

//set up camera position
camera.position.set(0, 0, 10);

//set up renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
//add the renderer to the DOM
const canvas = document.body.appendChild(renderer.domElement);
//set up webxr
renderer.xr.enabled = true;
document.body.appendChild(VRButton.createButton(renderer));

//set up orbit controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

//test object
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

//set up animation loop

//animation loop
function update() {}

function render() {
	renderer.render(scene, camera);
}
function gameLoop() {
	update();
	render();
}
renderer.setAnimationLoop(gameLoop); //used instead of requestAnimationFrame for WebXR compatibility
