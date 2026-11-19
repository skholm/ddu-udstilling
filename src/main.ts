import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRButton } from "three/addons/webxr/VRButton.js";
import { XRControllerModelFactory } from "three/addons/webxr/XRControllerModelFactory.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

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




//add controllers
const textureLoader = new THREE.TextureLoader();
const customTexture = textureLoader.load('public/textures/nextControllerBoth_color1k.png');
// glTF models expect flipY to be false
customTexture.flipY = false;
customTexture.colorSpace = THREE.SRGBColorSpace;



const controllerModelFactory = new XRControllerModelFactory();

for (let index = 0; index < 2; index += 1) {
	const controller = renderer.xr.getController(index);
	controller.addEventListener("connected", (event) => {
		controller.userData.inputSource = (event as THREE.Event & { data: XRInputSource }).data;
	});
	scene.add(controller);

	const controllerGrip = renderer.xr.getControllerGrip(index);
	let controllerModel = controllerModelFactory.createControllerModel(controllerGrip);
	/*
	// Apply the custom texture to the controller model's material
	if (controllerModel && controllerModel.children.length > 0) {
		controllerModel.traverse((child) => {
			if ((child as THREE.Mesh).isMesh) {
				const mesh = child as THREE.Mesh;
				if (mesh.material instanceof THREE.Material) {
					(mesh.material as THREE.MeshStandardMaterial).map = customTexture;
					(mesh.material as THREE.MeshStandardMaterial).needsUpdate = true;

				}
			}
		}
	);}*/

	controllerGrip.add(
controllerModel
	);
	scene.add(controllerGrip);
}



var buttonList: { buttonInteraction: THREE.Mesh; button: THREE.Mesh; buttonBase: THREE.Mesh; pressed: boolean }[] = [];
function newButton(position: THREE.Vector3) {


const buttonGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
const buttonMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
button.position.set(position.x, position.y, position.z);
scene.add(button);

const buttonInteractionGeometry = buttonGeometry.clone();
const buttonInteractionMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff, transparent: true, opacity: 0.1 });
const buttonInteraction = new THREE.Mesh(buttonInteractionGeometry, buttonInteractionMaterial);
buttonInteraction.position.set(position.x, position.y, position.z);
scene.add(buttonInteraction);



const buttonBaseGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.1, 32);
const buttonBaseMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const buttonBase = new THREE.Mesh(buttonBaseGeometry, buttonBaseMaterial);
buttonBase.position.set(position.x, position.y - 0.1, position.z);
scene.add(buttonBase);


buttonList.push({buttonInteraction, button, buttonBase, pressed: false});
//add text to button
const loader = new FontLoader();
loader.load('public/fonts/Roboto_Regular.typeface.json', function (font) {
	const textGeometry = new TextGeometry('Press', {
		font: font,
		size: 10.1,
		depth: 0.2,
	});
	const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
	const textMesh = new THREE.Mesh(textGeometry, textMaterial);
	textMesh.position.set(position.x - 0.15, position.y - 0.05, position.z + 0.05);
	scene.add(textMesh);
});


return button;

}
newButton(new THREE.Vector3(0.5, 1, 0));



//set up animation loop

//animation loop
function update() {
	if (loadedSkybox === null) {
		//initialize skybox, if development environment, prompt for skybox name, otherwise load default skybox
		if (
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1" ||
			window.location.hostname === "node"
		) {
			const skyboxName =
				prompt("Enter skybox name (default = test):", "test") || "test";
			loadSkybox(skyboxName);
		} else {
			loadSkybox("test");
		}
	}

	//if controller is connected
	if (renderer.xr.isPresenting) {
		for (let index = 0; index < 2; index += 1) {
			const controller = renderer.xr.getController(index);
			if (controller) {
				const controllerPosition = new THREE.Vector3();
				controller.getWorldPosition(controllerPosition);

				//check if controller is touching any buttons
				for (const buttonMeshes of buttonList) {
					const buttonPosition = new THREE.Vector3();

					const button = buttonMeshes.buttonInteraction;
					const cosmeticButton = buttonMeshes.button;

					button.getWorldPosition(buttonPosition);
					const distance = controllerPosition.distanceTo(buttonPosition);

					if (distance < 0.3) {
						//is touching button

						const inputSource = controller.userData.inputSource as XRInputSource | undefined;
						const trigger = inputSource?.gamepad?.buttons[0];
						if (trigger?.pressed != buttonMeshes.pressed) {
						if (trigger?.pressed === true) {
							//move cosmetic button down
							cosmeticButton.position.set(buttonPosition.x, buttonPosition.y - 0.05, buttonPosition.z);
						buttonMeshes.pressed = true
						} else {
							//move cosmetic button up
							cosmeticButton.position.set(buttonPosition.x, buttonPosition.y, buttonPosition.z);
						buttonMeshes.pressed = false
						}}
						

					}
				}
			}
		}
	}

}

function render() {
	renderer.render(scene, camera);
}
function gameLoop() {
	update();
	render();
}
renderer.setAnimationLoop(gameLoop); //used instead of requestAnimationFrame for WebXR compatibility
let loadedSkybox: string | null = null;
function loadSkybox(skyboxName: string) {
	let loader = new THREE.CubeTextureLoader();
	switch (skyboxName) {
		case "test":
		case "test2":
			loader.setPath("public/skyboxes/" + skyboxName + "/");
			loadedSkybox = skyboxName;
			break;
		default:
			throw new Error("Skybox not found");
	}
	loader.load(
		["px.png", "nx.png", "py.png", "ny.png", "pz.png", "nz.png"],
		function (texture) {
			scene.background = texture;
			console.log("Skybox loaded: " + skyboxName);
		},
	);
}
