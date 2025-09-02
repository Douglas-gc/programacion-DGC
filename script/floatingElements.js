// floatingElements.js - Elementos flotantes deportivos (código original separado)

// Create floating sports elements
function createFloatingSportsElements() {
    const elements = ['⚽', '🏈', '🏀', '🎾', '🏐', '🥅', '🏃‍♂️', '🏆', '🥇'];
    
    function createFloatingElement() {
        const element = document.createElement('div');
        element.className = 'floating-sport-element';
        element.textContent = elements[Math.floor(Math.random() * elements.length)];
        element.style.left = Math.random() * window.innerWidth + 'px';
        element.style.animationDuration = (Math.random() * 10 + 10) + 's';
        element.style.fontSize = (Math.random() * 20 + 20) + 'px';
        element.style.opacity = Math.random() * 0.3 + 0.1;
        
        document.getElementById('floatingElements').appendChild(element);
        
        // Remove element after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 20000);
    }
    
    // Create elements periodically
    setInterval(createFloatingElement, 3000);
    
    // Create initial elements
    for (let i = 0; i < 5; i++) {
        setTimeout(createFloatingElement, i * 1000);
    }
}