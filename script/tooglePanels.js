// togglePanels.js
document.addEventListener("DOMContentLoaded", () => {
  // Detectar si estamos en móvil (opcional)
  const isMobile = window.matchMedia("(max-width: 768px)").matches;
  if (!isMobile) return; // No hacer nada si NO es móvil

  const panels = document.querySelectorAll(".left-panel, .right-panel");
  let visible = false;

  // Función para alternar visibilidad
  function togglePanels() {
    visible = !visible;
    panels.forEach(panel => {
      panel.style.display = visible ? "block" : "none";
    });
  }

  // Ocultar paneles al inicio
  panels.forEach(panel => panel.style.display = "none");

  // Escuchar toques en la pantalla
  document.body.addEventListener("click", togglePanels);
});
