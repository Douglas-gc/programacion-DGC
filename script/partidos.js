import * as THREE from "https://esm.sh/three@0.161.0";
import { OrbitControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";

let scene, camera, renderer, cube, controls;
let galeriaAbierta = false;

function init() {
  const container = document.getElementById("par-container");
  const canvas = document.getElementById("partidos-canvas");

  // === Escena ===
  scene = new THREE.Scene();

  // === Cámara ===
  camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // === Render ===
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setClearColor(0x000000, 0);

  // === Controles ===
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;

  // === Luz ===
  const light = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(light);

  // === Cubo simple (color) ===
  const geometry = new THREE.BoxGeometry(3, 3, 3);
  const material = new THREE.MeshStandardMaterial({ color: 0x3399ff });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  window.addEventListener("resize", onWindowResize);
  animate();
}

// Rotación automática
function animate() {
  requestAnimationFrame(animate);

  if (galeriaAbierta && renderer && scene && camera) {
    cube.rotation.y += 0.01;
    cube.rotation.x += 0.005;

    controls.update();
    renderer.render(scene, camera);
  }
}

function onWindowResize() {
  const container = document.getElementById("par-container"); // <- typo corregido
  if (!container) return;
  camera.aspect = container.clientWidth / container.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.clientWidth, container.clientHeight);
}

// === Mostrar / ocultar panel ===
const galeriaPanel = document.getElementById("partidos-panel");
const btnCerrar = document.getElementById("cerrarPartidos");

// Solo abrir desde tu botón externo
export function abrirPartidos() {
  galeriaPanel.style.display = "flex";
  galeriaAbierta = true;

  if (!scene) init();
}

// Exportar función de cierre para que otro módulo la invoque y/o para usar internamente
export function cerrarPartidosPanel() {
  galeriaPanel.style.display = "none";
  galeriaAbierta = false;

  // emitir evento global para que index.js (o quien lo importe) pueda restaurar la cámara
  window.dispatchEvent(new Event('partidosClosed'));
}

// Listener local (mantener compatibilidad si se hace click directamente en el botón)
if (btnCerrar) {
  btnCerrar.addEventListener("click", () => {
    cerrarPartidosPanel();
  });
}
