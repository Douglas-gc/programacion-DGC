function setupNavbar() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Abrir/cerrar menú al presionar hamburguesa
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

  // Cerrar menú automáticamente al presionar un enlace
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      // Solo si el menú está activo
      if(navMenu.classList.contains('active')){
        // Dispara el click del toggle para que todo se actualice correctamente
        navToggle.click();
      }
    });
  });
}

// Llamar la función
setupNavbar();
