// ============================
// historia.js COMPLETO Y CORREGIDO
// ============================

import * as THREE from "https://esm.sh/three@0.161.0";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let stadium;
let animating = false;

// NUEVO: guardar escala original
let escalaOriginal = new THREE.Vector3(1, 1, 1);

export function iniciarHistoria() {
  const panel = document.getElementById("historia-panel");
  const canvas = document.getElementById("historia-canvas");

  panel.style.display = "flex";

  if (animating) return;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    50,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.set(1.8, 0, 1.5);
  camera.lookAt(0, 0, 0);


  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = true;

  setupLighting();

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
      "models/irineo.glb",
      (gltf) => {
        const model = gltf.scene;
        const group = new THREE.Group();

        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        group.add(model);

        // ESCALA INICIAL DEL MODELO
        group.scale.set(2, 2, 2);

        // GUARDAR ESCALA ORIGINAL
        escalaOriginal.copy(group.scale);

        group.position.set(0, 0, 0);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        stadium = group;
        scene.add(stadium);
        // Enderezar
        stadium.rotation.set(0, 0, 0);
        
      
        //camera.position.set(1.5, 1.5, 1.5);

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
  const canvas = document.getElementById("historia-canvas");
  if (camera && renderer && canvas) {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }
}

export function cerrarHistoria() {
  const panel = document.getElementById("historia-panel");
  panel.style.display = "none";
  animating = false;
}

// ============================
// Interacción: Botón "Ver Información"
// ============================

const btnReducir = document.getElementById("btn-reducir-historia");
const infoText = document.getElementById("info-text-historia");
let reducido = false;

if (btnReducir) {
  btnReducir.addEventListener("click", () => {
    if (!stadium) return;

    if (!reducido) {
      // Reducir modelo
      stadium.scale.set(
        escalaOriginal.x * 0.5,
        escalaOriginal.y * 0.5,
        escalaOriginal.z * 0.5
      );

      stadium.position.set(1.3, 0.1, 0);

      btnReducir.textContent = "Quitar Información";
      infoText.style.display = "block";
      reducido = true;

    } else {
      // Restaurar EXACTAMENTE la escala inicial
      stadium.scale.copy(escalaOriginal);
      stadium.position.set(0, 0, 0);

      btnReducir.textContent = "Ver Información";
      infoText.style.display = "none";
      reducido = false;
    }
  });
}
