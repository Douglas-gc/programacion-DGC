// ============================
// modelo.js adaptado al panel flotante
// ============================

import * as THREE from "https://esm.sh/three@0.161.0";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let stadium;
let animating = false;

export function iniciarEstadio() {
  const panel = document.getElementById("estadio-panel");
  const canvas = document.getElementById("estadio-canvas");

  // Mostrar el panel (como si fuera una ventana emergente)
  panel.style.display = "flex";

  // Evitar inicializar más de una vez
  if (animating) return;

  // Crear escena
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 10, 50);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = true;

  // Luces
  setupLighting();

  // Cargar modelo
  loadStadium().then(() => {
    hideLoadingScreen();
    animate();
  });

  window.addEventListener("resize", handleResize);
}

function loadStadium() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      "models/estadio.glb",
      (gltf) => {
        const model = gltf.scene;
        const group = new THREE.Group();

        // Calcular el centro del modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center); // centrar el modelo

        group.add(model);
        group.scale.set(0.1, 0.1, 0.1);
        group.position.set(0, 0, 0);

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

        resolve();
      },
      undefined,
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

function animate() {
  animating = true;
  requestAnimationFrame(animate);

  if (stadium) {
    stadium.rotation.y += 0.003;
  }

  controls.update();
  renderer.render(scene, camera);
}

function hideLoadingScreen() {
  const screen = document.getElementById("loadingScreen");
  if (screen) {
    screen.style.opacity = "0";
    setTimeout(() => (screen.style.display = "none"), 1000);
  }
}

function handleResize() {
  const canvas = document.getElementById("estadio-canvas");
  if (camera && renderer && canvas) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
}

export function cerrarEstadio() {
  const panel = document.getElementById("estadio-panel");
  panel.style.display = "none";
  animating = false;
}
// ============================
// Interacción: Botones del Estadio
// ============================

const btnReducir = document.getElementById("btn-reducir");
const infoText = document.getElementById("info-text");
let reducido = false;

if (btnReducir) {
  btnReducir.addEventListener("click", () => {
    if (!stadium) return;

    if (!reducido) {
      // Reducir tamaño y mover a la derecha
      stadium.scale.set(0.05, 0.05, 0.05);
      stadium.position.set(10, 0, 0);

      btnReducir.textContent = "Quitar Información";
      infoText.style.display = "block";
      reducido = true;
    } else {
      // Restaurar tamaño y posición original
      stadium.scale.set(0.1, 0.1, 0.1);
      stadium.position.set(0, 0, 0);

      btnReducir.textContent = "Ver Información";
      infoText.style.display = "none";
      reducido = false;
    }
  });
}
