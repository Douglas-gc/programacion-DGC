import * as THREE from "https://esm.sh/three@0.161.0";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";
import { Sky } from "https://esm.sh/three@0.161.0/examples/jsm/objects/Sky.js";
import { PointerLockControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/PointerLockControls.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js";

let scene, camera, renderer, controls;
let stadium;

let initialCameraPos = new THREE.Vector3();
let initialCameraRot = new THREE.Euler();

// Movimiento
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
const speed = 90.0; // velocidad de movimiento

// Música
const audioElement = document.getElementById("bgMusic");
let btnMusic;

window.addEventListener("load", init);
window.addEventListener("resize", handleResize);

async function init() {
  try {
    setupScene();
    await loadStadium();
    setupLighting();
    setupControls();
    hideLoadingScreen();
    animate();
  } catch (error) {
    console.error("Initialization failed:", error);
    hideLoadingScreen();
    showError("Error loading stadium model. Check if estadio.glb exists.");
  }
}

// --------------------------------------------------------------------
// CONFIGURACIÓN DE ESCENA
// --------------------------------------------------------------------
function setupScene() {
  scene = new THREE.Scene();

  // CIELO NOCTURNO
  const sky = new Sky();
  sky.scale.setScalar(50000);
  scene.add(sky);

  const skyUniforms = sky.material.uniforms;
  skyUniforms["turbidity"].value = 1;
  skyUniforms["rayleigh"].value = 0.1;
  skyUniforms["mieCoefficient"].value = 0.0005;
  skyUniforms["mieDirectionalG"].value = 0.9;

  const sun = new THREE.Vector3();
  sun.setFromSphericalCoords(1, THREE.MathUtils.degToRad(-3), THREE.MathUtils.degToRad(0));
  skyUniforms["sunPosition"].value.copy(sun);

  scene.background = new THREE.Color(0x000010);

  // ESTRELLAS
  const starGeometry = new THREE.BufferGeometry();
  const starCount = 2000;
  const starPositions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 1000;
    starPositions[i * 3] = (Math.random() - 0.5) * r * 2;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * r * 2;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * r * 2;
  }
  starGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({ size: 1.2, sizeAttenuation: true, color: 0xffffff });
  scene.add(new THREE.Points(starGeometry, starMaterial));

  // CÁMARA
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 1.6, 5);
  // PUNTO A DONDE MIRAR
  camera.lookAt(100, 2, 0);
  const canvas = document.getElementById("three-canvas");
  renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

//inicio
  camera.position.set(0, 1.6, 5);
camera.lookAt(100, 2, 0);

// Guardar posición y rotación inicial
initialCameraPos.copy(camera.position);
initialCameraRot.copy(camera.rotation);
//fin

}

// --------------------------------------------------------------------
// CARGA DEL ESTADIO
// --------------------------------------------------------------------
function loadStadium() {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load(
      "models/estadio.glb",
      (gltf) => {
        const model = gltf.scene;
        const group = new THREE.Group();

        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.sub(center);

        group.add(model);
        group.scale.set(3, 3, 3);
        group.position.set(0, 0, 0);

        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        stadium = group;
        scene.add(stadium);

        // Posición inicial de cámara
        camera.position.set(center.x+(-237.5), center.y + (-45), center.z + 40);
        // Guardar como posición inicial
        initialCameraPos.copy(camera.position);
        initialCameraRot.copy(camera.rotation);
        resolve();
      },
      undefined,
      (err) => reject(err)
    );
  });
}

// --------------------------------------------------------------------
// ILUMINACIÓN
// --------------------------------------------------------------------
function setupLighting() {
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const main = new THREE.DirectionalLight(0xffffff, 0.5);
  main.position.set(0, 200, 200);
  main.castShadow = true;
  main.shadow.mapSize.set(2048, 2048);
  scene.add(main);
}

// --------------------------------------------------------------------
// CONTROLES FPS Y MÚSICA
// --------------------------------------------------------------------
function setupControls() {
  controls = new PointerLockControls(camera, renderer.domElement);

  // Instrucciones para click
  const instructions = document.createElement("div");
  instructions.id = "instructions";
  instructions.innerHTML = "<p>Haz click para explorar el estadio</p><p>WASD para moverte</p>";

  instructions.style.position = "absolute";
  instructions.style.bottom = "20px";
  instructions.style.right = "20px";
  instructions.style.left = "auto";
  instructions.style.top = "auto";
  instructions.style.transform = "none";

  instructions.style.background = "rgba(0,0,0,0.7)";
  instructions.style.color = "#fff";
  instructions.style.padding = "20px";
  instructions.style.borderRadius = "10px";
  instructions.style.textAlign = "center";
  instructions.style.cursor = "pointer";
  document.body.appendChild(instructions);

  instructions.addEventListener("click", () => controls.lock());
  controls.addEventListener("lock", () => { instructions.style.display = "none"; });
  controls.addEventListener("unlock", () => { instructions.style.display = ""; });

  document.addEventListener("keydown", (event) => {
    switch(event.code) {
      case "KeyW": moveForward = true; break;
      case "KeyS": moveBackward = true; break;
      case "KeyA": moveLeft = true; break;
      case "KeyD": moveRight = true; break;
    }
  });

  document.addEventListener("keyup", (event) => {
    switch(event.code) {
      case "KeyW": moveForward = false; break;
      case "KeyS": moveBackward = false; break;
      case "KeyA": moveLeft = false; break;
      case "KeyD": moveRight = false; break;
    }
  });

  scene.add(controls.getObject());

  // Botón para reproducir/pausar música
  btnMusic = document.createElement("button");
  btnMusic.id = "btn-music";
  btnMusic.textContent = "🎵 Reproducir Música";
  btnMusic.style.position = "fixed";
  btnMusic.style.bottom = "20px";
  btnMusic.style.left = "20px"; // Cambia aquí si quieres mover el botón
  btnMusic.style.padding = "10px 15px";
  btnMusic.style.background = "rgba(33, 150, 243, 0.9)";
  btnMusic.style.color = "#fff";
  btnMusic.style.border = "none";
  btnMusic.style.borderRadius = "6px";
  btnMusic.style.fontSize = "14px";
  btnMusic.style.fontWeight = "bold";
  btnMusic.style.cursor = "pointer";
  btnMusic.style.zIndex = "9999";
  document.body.appendChild(btnMusic);

  btnMusic.addEventListener("click", () => {
    if(audioElement.paused){
      audioElement.play();
      btnMusic.textContent = "⏸️ Pausar Música";
    } else {
      audioElement.pause();
      btnMusic.textContent = "🎵 Reproducir Música";
    }
  });
}

// --------------------------------------------------------------------
// ANIMACIÓN
// --------------------------------------------------------------------
function animate() {
  requestAnimationFrame(animate);

  const delta = 0.05;
  velocity.x -= velocity.x * 10.0 * delta;
  velocity.z -= velocity.z * 10.0 * delta;

  direction.z = Number(moveForward) - Number(moveBackward);
  direction.x = Number(moveRight) - Number(moveLeft);
  direction.normalize();

  if(moveForward || moveBackward) velocity.z -= direction.z * speed * delta;
  if(moveLeft || moveRight) velocity.x -= direction.x * speed * delta;

  controls.moveRight(-velocity.x * delta);
  controls.moveForward(-velocity.z * delta);

  renderer.render(scene, camera);
}

// --------------------------------------------------------------------
// PANTALLA DE CARGA Y ERRORES
// --------------------------------------------------------------------
function hideLoadingScreen() {
  const screen = document.getElementById("loadingScreen");
  if(screen){
    screen.style.opacity = "0";
    setTimeout(() => screen.style.display = "none", 1000);
  }
}

function showError(msg) {
  const text = document.querySelector(".loading-text");
  if(text){
    text.textContent = msg;
    text.style.color = "#ff4444";
  }
}

// --------------------------------------------------------------------
// AJUSTE DE TAMAÑO DE VENTANA
// --------------------------------------------------------------------
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ... dentro de tu archivo index.js, reemplaza esas funciones por:

export function moverCamaraPartidos() {
  // animar la posición del objeto que contiene la cámara (PointerLockControls)
  if (!camera || !controls) return;

  gsap.to(controls.getObject().position, {
    x: 10,
    y: 6,
    z: 12,
    duration: 2.5,
    ease: "power2.inOut"
  });

  // si quieres cambiar la orientación (pitch/yaw) animar rotaciones internas
  // Nota: PointerLockControls pone la cámara como child de getObject(), la rotación X está en children[0]
  if (controls.getObject().children.length > 0) {
    gsap.to(controls.getObject().children[0].rotation, {
      x: 0, // ajusta si hace falta
      duration: 2.5,
      ease: "power2.inOut"
    });
  }
}

export function restaurarCamara() {
  if (!camera || !controls) return;

  gsap.to(controls.getObject().position, {
    x: initialCameraPos.x,
    y: initialCameraPos.y,
    z: initialCameraPos.z,
    duration: 2,
    ease: "power2.inOut"
  });

  gsap.to(controls.getObject().rotation, {
    y: initialCameraRot.y,
    duration: 2,
    ease: "power2.inOut"
  });

  if (controls.getObject().children.length > 0) {
    gsap.to(controls.getObject().children[0].rotation, {
      x: initialCameraRot.x,
      duration: 2,
      ease: "power2.inOut"
    });
  }
}
// --------------------------------------------------------------------
// deslisamiento galeria
// --------------------------------------------------------------------
export function moverCamaraGaleria() {
  if (!camera || !controls) return;

  // Mueve la cámara a una posición más alta y cercana
  gsap.to(controls.getObject().position, {
    x: 0,
    y: 8,
    z: 15,
    duration: 2.5,
    ease: "power2.inOut"
  });

  // Ajustar inclinación
  if (controls.getObject().children.length > 0) {
    gsap.to(controls.getObject().children[0].rotation, {
      x: -0.2,
      duration: 2.5,
      ease: "power2.inOut"
    });
  }
}
export function restaurarCamaraGaleria() {
  if (!camera || !controls) return;

  gsap.to(controls.getObject().position, {
    x: initialCameraPos.x,
    y: initialCameraPos.y,
    z: initialCameraPos.z,
    duration: 2,
    ease: "power2.inOut"
  });

  gsap.to(controls.getObject().rotation, {
    y: initialCameraRot.y,
    duration: 2,
    ease: "power2.inOut"
  });

  if (controls.getObject().children.length > 0) {
    gsap.to(controls.getObject().children[0].rotation, {
      x: initialCameraRot.x,
      duration: 2,
      ease: "power2.inOut"
    });
  }
}



