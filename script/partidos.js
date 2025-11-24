import * as THREE from "https://esm.sh/three@0.161.0";
import { OrbitControls } from "https://esm.sh/three@0.161.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://esm.sh/three@0.161.0/examples/jsm/loaders/GLTFLoader.js";

let scene, camera, renderer, modeloGLB, controls;
let galeriaAbierta = false;

// Panel flotante
const galeriaPanel = document.getElementById("partidos-panel");

// Contenedor principal de partidos
const partidosContainer = document.createElement("div");
partidosContainer.className = "partidos-container";

// Datos de partidos por día
const partidosPorDia = {
  lunes: [
    { equipo1: 'Bolivar', logo1: 'img/bolivar.png', equipo2: 'Real Potosi', logo2: 'img/real_potosi.png', hora: '15:00', fecha: '2025-10-13' },
    { equipo1: 'Oriente Petrolero', logo1: 'img/Oriente_Petrolero.png', equipo2: 'Blooming', logo2: 'img/blooming.png', hora: '17:30', fecha: '2025-10-13' }
  ],
  martes: [
    { equipo1: 'Bolivar', logo1: 'img/bolivar.png', equipo2: 'Blooming', logo2: 'img/blooming.png', hora: '16:00', fecha: '2025-10-14' }
  ],
  miercoles: [
    { equipo1: 'Oriente Petrolero', logo1: 'img/Oriente_Petrolero.png', equipo2: 'Blooming', logo2: 'img/blooming.png', hora: '18:00', fecha: '2025-10-15' }
  ],
  jueves: [
    { equipo1: 'Real Potosi', logo1: 'img/real_potosi.png', equipo2: 'Bolivar', logo2: 'img/bolivar.png', hora: '19:30', fecha: '2025-10-16' }
  ],
  viernes: [
    { equipo1: 'Real Potosi', logo1: 'img/real_potosi.png', equipo2: 'Oriente Petrolero', logo2: 'img/Oriente_Petrolero.png', hora: '20:00', fecha: '2025-10-17' }
  ]
};

// Crear elementos de UI
const diasSemanaDiv = document.createElement("div");
diasSemanaDiv.id = "diasSemana";
diasSemanaDiv.className = "dias-semana";

const partidosListaDiv = document.createElement("div");
partidosListaDiv.id = "partidosLista";
partidosListaDiv.className = "partidos-lista";

partidosContainer.appendChild(diasSemanaDiv);
partidosContainer.appendChild(partidosListaDiv);
galeriaPanel.appendChild(partidosContainer);

// Botones de días
const dias = ['lunes','martes','miercoles','jueves','viernes'];
const hoy = new Date();
const diaActual = dias[hoy.getDay()-1] || 'lunes';

dias.forEach(dia => {
  const btn = document.createElement("button");
  btn.className = "dia-btn";
  btn.textContent = dia.charAt(0).toUpperCase() + dia.slice(1);
  if(dia === diaActual) btn.classList.add("active");
  btn.addEventListener("click", () => mostrarPartidos(dia, btn));
  diasSemanaDiv.appendChild(btn);
});

// Función para mostrar partidos
function mostrarPartidos(dia, botonSeleccionado) {
  diasSemanaDiv.querySelectorAll(".dia-btn").forEach(b => b.classList.remove("active"));
  botonSeleccionado.classList.add("active");

  const lista = partidosPorDia[dia] || [];
  partidosListaDiv.innerHTML = "";

  if(lista.length === 0){
    partidosListaDiv.innerHTML = `<p style="text-align:center;">No hay partidos programados para ${dia}.</p>`;
    return;
  }

  lista.forEach(p => {
    const card = document.createElement("div");
    card.className = "partido-card";
    card.innerHTML = `
      <div class="equipo">
        <img src="${p.logo1}" alt="${p.equipo1}">
        <div>${p.equipo1}</div>
      </div>
      <div class="vs">
        VS
        <div class="hora-fecha">${p.hora} - ${p.fecha}</div>
      </div>
      <div class="equipo">
        <img src="${p.logo2}" alt="${p.equipo2}">
        <div>${p.equipo2}</div>
      </div>
    `;
    partidosListaDiv.appendChild(card);
  });
}

// Mostrar automáticamente el día actual
mostrarPartidos(diaActual, diasSemanaDiv.querySelector(".dia-btn.active"));

// === Three.js ===
function init() {
  const container = document.createElement("div");
  container.id = "par-container";
  galeriaPanel.appendChild(container);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, 800/560, 0.1, 1000);
  camera.position.z = 5;

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(800, 560);
  container.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.enableZoom = false;
  controls.enablePan = false;

  const light = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(light);

  // === CARGAR EL MODELO GLB ===
  const loader = new GLTFLoader();
  loader.load(
    "models/balon.glb",  // <-- CAMBIA LA RUTA AQUÍ
    function(gltf) {
      modeloGLB = gltf.scene;

      // Escala recomendada por si viene muy grande o pequeño
      modeloGLB.scale.set(1.5, 1.5, 1.5);

      // Centrar el modelo
      modeloGLB.position.set(0, 0, 0);

      scene.add(modeloGLB);
    },
    undefined,
    function(error){ console.error("Error al cargar el modelo GLB:", error); }
  );

  animate();
}

function animate(){
  requestAnimationFrame(animate);

  if(galeriaAbierta){
    if(modeloGLB){
      modeloGLB.rotation.y += 0.01;
      modeloGLB.rotation.x += 0.005;
    }

    controls.update();
    renderer.render(scene, camera);
  }
}

// === Funciones para abrir/cerrar panel ===
export function abrirPartidos(){
  galeriaPanel.style.display = "flex";
  galeriaAbierta = true;
  if(!scene) init();
}

export function cerrarPartidosPanel(){
  galeriaPanel.style.display = "none";
  galeriaAbierta = false;
  window.dispatchEvent(new Event('partidosClosed'));
}

// Botón de cerrar
const btnCerrar = document.getElementById("cerrarPartidos");
if(btnCerrar){
  btnCerrar.addEventListener("click", cerrarPartidosPanel);
}
