import * as THREE from "https://esm.sh/three@0.161.0";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let stadium;

window.addEventListener("load", init);
window.addEventListener("resize", handleResize);

async function init() {
  try {
    setupScene();
    await loadStadium();
    setupLighting();
    setupInteractions();
    hideLoadingScreen();
    animate();
  } catch (error) {
    console.error("Initialization failed:", error);
    hideLoadingScreen();
    showError("Error loading stadium model. Check if irineo.glb exists.");
  }
}

function setupScene() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 50);

  const canvas = document.getElementById("three-canvas");
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // 👉 Controles con el mouse
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = true;
}

function loadStadium() {
  return new Promise((resolve, reject) => {
    updateLoadingProgress(20);

    const loader = new GLTFLoader();
    loader.load(
      "models/estadio2.glb",
      gltf => {
        updateLoadingProgress(60);

        const model = gltf.scene;
        const group = new THREE.Group();

        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        group.add(model);
        group.scale.set(3, 3, 3);
        group.position.set(0,0, 0);

        model.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        stadium = group;
        scene.add(stadium);

        // 👉 Ajustar cámara y controles al centro del modelo
        camera.position.set(center.x + 5, center.y + 10, center.z + 50);
        controls.target.copy(center);
        controls.update();

        updateLoadingProgress(100);
        resolve();
      },
      xhr => {
        const percent = (xhr.loaded / xhr.total) * 40 + 20;
        updateLoadingProgress(Math.min(percent, 60));
      },
      err => reject(err)
    );
  });
}

function setupLighting() {
  const ambient = new THREE.AmbientLight(0xffffff, 3);
  scene.add(ambient);

  const main = new THREE.DirectionalLight(0xffffff, 1.0);
  main.position.set(0, 100, 100);
  main.castShadow = true;
  scene.add(main);

  const side = new THREE.DirectionalLight(0xffffff, 0.3);
  side.position.set(100, 50, 0);
  scene.add(side);
}

function setupInteractions() {
  if (typeof setupNavbar === "function") setupNavbar();
}

function animate() {
  requestAnimationFrame(animate);

  // 👉 Rotación automática del estadio sobre su propio eje Y
  if (stadium) {
    stadium.rotation.y += 0.002; // Ajusta la velocidad cambiando el número
  }

  // Actualiza los controles de OrbitControls
  controls.update();

  renderer.render(scene, camera);
}


function updateLoadingProgress(progress) {
  document.getElementById("loadingProgress").textContent =
    Math.round(progress) + "%";
}

function hideLoadingScreen() {
  const screen = document.getElementById("loadingScreen");
  screen.style.opacity = "0";
  setTimeout(() => (screen.style.display = "none"), 1000);
}

function showError(msg) {
  const text = document.querySelector(".loading-text");
  text.textContent = msg;
  text.style.color = "#ff4444";
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

