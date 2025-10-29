import * as THREE from "https://esm.sh/three@0.161.0";
import { OrbitControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js";


let scene, camera, renderer, cube, controls;
let galeriaAbierta = false;
const loader = new THREE.TextureLoader();
let currentFace = 0;

const faceRotations = [
  { x: 0, y: -Math.PI / 2 },
  { x: 0, y: Math.PI / 2 },
  { x: -Math.PI / 2, y: 0 },
  { x: Math.PI / 2, y: 0 },
  { x: 0, y: 0 },
  { x: 0, y: Math.PI }
];

function init() {
  const container = document.getElementById("three-container");
  const canvas = document.getElementById("galeria-canvas");

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0); 

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;

  const light = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(light);

  const thumbs = document.querySelectorAll("#miniaturas img");
  const materials = new Array(6).fill(0).map((_, i) => {
    const img = thumbs[i % thumbs.length];
    return new THREE.MeshBasicMaterial({ map: loader.load(img.src) });
  });

  cube = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.6, 3.6), materials);
  scene.add(cube);

  // Cara inicial
  const frontTexture = loader.load(thumbs[0].src);
  cube.material[4].map = frontTexture;
  cube.material[4].needsUpdate = true;
  cube.rotation.set(0, 0, 0);

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => showImageOnCube(thumb.src));
  });

  window.addEventListener("resize", onWindowResize);
  animate();
}

function showImageOnCube(imgSrc) {
  const tex = loader.load(imgSrc);
  cube.material[currentFace].map = tex;
  cube.material[currentFace].needsUpdate = true;

  const rotation = faceRotations[currentFace];
  gsap.to(cube.rotation, {
    x: rotation.x,
    y: rotation.y,
    duration: 1.2,
    ease: "power2.inOut"
  });

  currentFace = (currentFace + 1) % 6;
}


function animate() {
  requestAnimationFrame(animate);
  if (galeriaAbierta && renderer && scene && camera) {
    controls.update();
    renderer.render(scene, camera);
  }
}

function onWindowResize() {
  const container = document.getElementById("three-container");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// === Mostrar / ocultar galería ===
const galeriaPanel = document.getElementById("galeria-panel");
const btnGaleria = document.getElementById("btnGaleria");
const btnCerrar = document.getElementById("cerrarGaleria");

btnGaleria.addEventListener("click", () => {
  galeriaPanel.style.display = "flex";
  galeriaAbierta = true;
  if (!scene) init();
});

btnCerrar.addEventListener("click", () => {
  galeriaPanel.style.display = "none";
  galeriaAbierta = false;
});
