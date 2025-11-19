// historia.js
import * as THREE from "https://esm.sh/three@0.161.0";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, controls;
let historiaGroup;
let animating = false;

export function iniciarHistoria() {
  const panel = document.getElementById("historia-panel");
  const canvas = document.getElementById("historia-canvas");

  panel.style.display = "flex";

  if (animating) return;

  // Escena
  scene = new THREE.Scene();

  // Cámara
  camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(0, 10, 50);

  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, canvas });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.shadowMap.enabled = true;

  // Controles
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enableZoom = true;
  controls.enablePan = true;

  // Luces
  setupLighting();

  // Cargar modelo
  loadHistoriaModel().then(() => {
    animate();
  });

  window.addEventListener("resize", handleResize);
}

function loadHistoriaModel() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      "models/irineo.glb",
      (gltf) => {
        const model = gltf.scene;
        const group = new THREE.Group();

        // Centrar modelo
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        // Escala y elevación
        group.add(model);
        group.scale.set(0.1, 0.1, 0.1);
        group.position.set(0, box.getSize(new THREE.Vector3()).y * 0.5, 0);

        historiaGroup = group;
        scene.add(historiaGroup);

        camera.position.set(0, 10, 50);
        controls.target.set(historiaGroup.position.x, historiaGroup.position.y, historiaGroup.position.z);
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
  scene.add(main);

  const side = new THREE.DirectionalLight(0xffffff, 0.3);
  side.position.set(100, 50, 0);
  scene.add(side);
}

function animate() {
  animating = true;
  requestAnimationFrame(animate);

  if (historiaGroup) historiaGroup.rotation.y += 0.003;

  controls.update();
  renderer.render(scene, camera);
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
