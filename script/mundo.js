// ============================
// modelo.js (ES Module)
// ============================
import * as THREE from "https://esm.sh/three@0.161.0";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/PointerLockControls.js";

let scene, camera, renderer, controls;
let stadium;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
//velocidad de movimineto
const speed = 2.0;

// Inicializar
window.addEventListener("load", init);
window.addEventListener("resize", onResize);

async function init() {
  setupScene();
  await loadStadium();
  setupLighting();
  setupControls();
  animate();
}

function setupScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x20232a);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  //para controlar donde apresco
  camera.position.set(3, 0.3, 0);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas: document.getElementById("three-canvas")
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
}

function loadStadium() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      "models/estadio.glb",
      (gltf) => {
        stadium = gltf.scene;
        stadium.scale.set(0.1, 0.1, 0.1);
        scene.add(stadium);
        resolve();
      },
      undefined,
      (err) => reject(err)
    );
  });
}

function setupLighting() {
  scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(10, 50, 10);
  dirLight.castShadow = true;
  scene.add(dirLight);
}

function setupControls() {
  controls = new PointerLockControls(camera, document.body);

  const instructions = document.getElementById("instructions");
  instructions.addEventListener("click", () => {
    controls.lock();
  });

  controls.addEventListener("lock", () => {
    instructions.style.display = "none";
  });

  controls.addEventListener("unlock", () => {
    instructions.style.display = "";
  });

  const onKeyDown = (event) => {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW": moveForward = true; break;
      case "ArrowLeft":
      case "KeyA": moveLeft = true; break;
      case "ArrowDown":
      case "KeyS": moveBackward = true; break;
      case "ArrowRight":
      case "KeyD": moveRight = true; break;
    }
  };

  const onKeyUp = (event) => {
    switch (event.code) {
      case "ArrowUp":
      case "KeyW": moveForward = false; break;
      case "ArrowLeft":
      case "KeyA": moveLeft = false; break;
      case "ArrowDown":
      case "KeyS": moveBackward = false; break;
      case "ArrowRight":
      case "KeyD": moveRight = false; break;
    }
  };

  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  scene.add(controls.getObject());
}

function animate() {
  requestAnimationFrame(animate);

  const delta = 0.05; // frame-step
  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if (moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
  if (moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
