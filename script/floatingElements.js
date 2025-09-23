function createFloatingSportsElements() {
    const elements = ['⚽', '🏈', '🏀', '🎾', '🏐', '🥅', '🏃‍♂️', '🏆', '🥇'];

    function createFloatingElement() {
        const element = document.createElement('div');
        element.className = 'floating-sport-element';
        element.textContent = elements[Math.floor(Math.random() * elements.length)];

        // Posición aleatoria en X
        element.style.left = Math.random() * window.innerWidth + 'px';

        // Ajustamos duración de la animación con CSS inline
        const duration = (Math.random() * 10 + 10) + 's';
        element.style.animationDuration = duration;

        // Tamaño aleatorio
        element.style.fontSize = (Math.random() * 20 + 20) + 'px';

        // Opacidad aleatoria
        element.style.opacity = Math.random() * 0.3 + 0.1;

        document.getElementById('floatingElements').appendChild(element);

        // Eliminar después de terminar la animación
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, parseFloat(duration) * 1000);
    }

    // Crear nuevos cada 3s
    setInterval(createFloatingElement, 3000);

    // Crear algunos iniciales
    for (let i = 0; i < 5; i++) {
        setTimeout(createFloatingElement, i * 1000);
    }
}

window.addEventListener("DOMContentLoaded", createFloatingSportsElements);
