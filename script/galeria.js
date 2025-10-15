import * as THREE from "https://esm.sh/three@0.161.0";
import { OrbitControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, cube, controls;
const loader = new THREE.TextureLoader();
let currentFace = 0; // Comenzar desde la primera cara dinámica

// Rotaciones precisas según la orientación real del cubo
const faceRotations = [
  { x: 0, y: -Math.PI / 2 },  // 0 → Derecha
  { x: 0, y: Math.PI / 2 },   // 1 → Izquierda
  { x: -Math.PI / 2, y: 0 },  // 2 → Arriba
  { x: Math.PI / 2, y: 0 },   // 3 → Abajo
  { x: 0, y: 0 },             // 4 → Frente ✅
  { x: 0, y: Math.PI }        // 5 → Atrás
];

init();
animate();

function init() {
  const container = document.getElementById("three-container");
  const canvas = document.getElementById("three-canvas");

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Controles
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;

  // Luz
  const light = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(light);

  // Miniaturas
  const thumbs = document.querySelectorAll(".miniaturas img");

  // Crear materiales (rellena las 6 caras con las primeras imágenes)
  const materials = new Array(6).fill(0).map((_, i) => {
    const img = thumbs[i % thumbs.length];
    return new THREE.MeshBasicMaterial({ map: loader.load(img.src) });
  });

  cube = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.5, 3.5), materials);
  scene.add(cube);

  // 📸 Mostrar la PRIMERA imagen (thumb[0]) al frente del cubo
  const frontTexture = loader.load(thumbs[0].src);
  cube.material[4].map = frontTexture; // Cara 4 = frente real
  cube.material[4].needsUpdate = true;
  cube.rotation.set(0, 0, 0); // Deja el frente mirando hacia la cámara

  // Eventos: click en miniatura
  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => showImageOnCube(thumb.src));
  });

  window.addEventListener("resize", onWindowResize);
}

function showImageOnCube(imgSrc) {
  const tex = loader.load(imgSrc);

  // Reemplazar textura en la cara actual
  cube.material[currentFace].map = tex;
  cube.material[currentFace].needsUpdate = true;

  // Girar hacia esa cara
  const rotation = faceRotations[currentFace];
  gsap.to(cube.rotation, {
    x: rotation.x,
    y: rotation.y,
    duration: 1.2,
    ease: "power2.inOut"
  });

  // Pasar a la siguiente cara (ciclo infinito)
  currentFace = (currentFace + 1) % 6;
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

function onWindowResize() {
  const container = document.getElementById("three-container");
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}
