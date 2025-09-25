// ============================
// modelo.js (ES Module)
// ============================

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
    showError("Error loading stadium model. Check if estadio2.glb exists.");
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

  const canvasContainer = document.getElementById("scene-container");
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas: document.getElementById("three-canvas") });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
      (gltf) => {
        updateLoadingProgress(60);

        const model = gltf.scene;
        const group = new THREE.Group();

        // Calcular el centro del modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center); // mover el modelo para centrarlo en el grupo

        group.add(model);
        group.scale.set(0.1, 0.1, 0.1);
        group.position.set(0, 0, 0); // opcional, lo puedes mover en la escena

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        stadium = group;
        scene.add(stadium);

        // Ajustar cámara y controles
        camera.position.set(0, 5, 20); 
        controls.target.set(0, 0, 0);
        controls.update();

        updateLoadingProgress(100);
        resolve();
      },
      (xhr) => {
        const percent = (xhr.loaded / xhr.total) * 40 + 20;
        updateLoadingProgress(Math.min(percent, 60));
      },
      (err) => reject(err)
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

//parte del boton
const btnReducir = document.getElementById("btn-reducir");
const infoText = document.getElementById("info-text");
let reducido = false; // estado inicial

btnReducir.addEventListener("click", () => {
  if (!stadium) return;

  if (!reducido) {
    // Reducir tamaño y mover a la derecha
    stadium.scale.set(0.05, 0.05, 0.05);
    stadium.position.set(10, 0, 0);

    btnReducir.textContent = "Quitar Informacion";
    infoText.style.display = "block"; // mostrar texto
    reducido = true;
  } else {
    // Restaurar tamaño y posición original
    stadium.scale.set(0.1, 0.1, 0.1);
    stadium.position.set(0, 0, 0);

    btnReducir.textContent = "Ver informacion";
    infoText.style.display = "none"; // ocultar texto
    reducido = false;
  }
});


// ============================
// Animación y utilidades
// ============================
function animate() {
  requestAnimationFrame(animate);

  if (stadium) {
    stadium.rotation.y += 0.003; // velocidad de rotación
  }

  controls.update();
  renderer.render(scene, camera);
}

function updateLoadingProgress(progress) {
  const el = document.getElementById("loadingProgress");
  if (el) el.textContent = Math.round(progress) + "%";
}

function hideLoadingScreen() {
  const screen = document.getElementById("loadingScreen");
  screen.style.opacity = "0";
  setTimeout(() => (screen.style.display = "none"), 1000);
}

function showError(msg) {
  const text = document.querySelector(".loading-text");
  if (text) {
    text.textContent = msg;
    text.style.color = "#ff4444";
  }
}

function handleResize() {
  if (camera && renderer) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}
