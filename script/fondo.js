window.addEventListener("click", () => {
    const audioElement = document.getElementById("bgMusic");

    // Crear AudioContext y GainNode
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const track = audioCtx.createMediaElementSource(audioElement);
    const gainNode = audioCtx.createGain();
    track.connect(gainNode).connect(audioCtx.destination);

    // Resume AudioContext si está suspendido
    if (audioCtx.state === 'suspended') audioCtx.resume();

    audioElement.play().then(() => {
        console.log("🎵 Música iniciada");

        // Volumen empieza fuerte (1.0) y baja a 0.1 en 30 segundos
        gainNode.gain.setValueAtTime(1.0, audioCtx.currentTime);                     // Volumen inicial
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 30); // Baja progresivamente
    });
}, { once: true });

