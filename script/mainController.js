// mainController.js - Controlador principal para coordinar todos los sistemas

// Configuración global del estadio
const STADIUM_CONFIG = {
    graphics: {
        enableShadows: true,
        enableFog: true,
        enableParticles: false, // Cambiar a true para habilitar partículas de fondo
        antialias: true
    },
    animation: {
        rotationSpeed: 0.003,
        cameraAutoRotate: false,
        smoothTransitions: true
    },
    effects: {
        floatingElements: true,
        celebration: true,
        timeBasedEffects: true,
        soundEffects: false // Cambiar a true si tienes archivos de sonido
    },
    performance: {
        maxFloatingElements: 15,
        renderDistance: 2000,
        shadowMapSize: 2048
    }
};

// Sistema de eventos personalizado
class EventManager {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }
    
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

// Manager principal del estadio
class StadiumManager {
    constructor() {
        this.eventManager = new EventManager();
        this.initialized = false;
        this.loadingProgress = 0;
        this.systems = {};
        
        // Bind context
        this.init = this.init.bind(this);
        this.update = this.update.bind(this);
    }
    
    // Inicializar todos los sistemas
    async init() {
        if (this.initialized) return;
        
        try {
            console.log('🏟️ Inicializando Stadium Manager...');
            
            // Registrar sistemas
            this.registerSystems();
            
            // Configurar eventos
            this.setupEvents();
            
            // Inicializar sistemas en orden
            await this.initializeSystems();
            
            this.initialized = true;
            this.eventManager.emit('stadium:initialized');
            
            console.log('✅ Stadium Manager inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando Stadium Manager:', error);
            this.eventManager.emit('stadium:error', error);
        }
    }
    
    // Registrar sistemas disponibles
    registerSystems() {
        this.systems = {
            background: window.BackgroundManager,
            floating: window.FloatingElementsManager,
            audio: window.AudioManager // Si existe
        };
    }
    
    // Configurar eventos del sistema
    setupEvents() {
        // Eventos de interacción
        this.eventManager.on('stadium:click', (data) => {
            console.log('🖱️ Click en estadio:', data);
            this.handleStadiumClick(data);
        });
        
        // Eventos de carga
        this.eventManager.on('stadium:loading', (progress) => {
            this.updateLoadingProgress(progress);
        });
        
        // Eventos de partidos
        this.eventManager.on('match:goal', () => {
            this.celebrateGoal();
        });
        
        // Eventos de tiempo
        this.eventManager.on('time:changed', (timeData) => {
            this.updateTimeBasedEffects(timeData);
        });
    }
    
    // Inicializar sistemas en orden de dependencia
    async initializeSystems() {
        const initOrder = ['background', 'floating', 'audio'];
        
        for (const systemName of initOrder) {
            const system = this.systems[systemName];
            if (system && system.init) {
                try {
                    console.log(`🔧 Inicializando ${systemName}...`);
                    await system.init();
                    console.log(`✅ ${systemName} inicializado`);
                } catch (error) {
                    console.warn(`⚠️ Error inicializando ${systemName}:`, error);
                }
            }
        }
    }
    
    // Manejar clicks en el estadio
    handleStadiumClick(data) {
        // Crear efecto de celebración
        if (this.systems.floating && this.systems.floating.celebrate) {
            this.systems.floating.celebrate();
        }
        
        // Cambiar tema de elementos según el área clickeada
        if (data.type === 'field') {
            this.systems.floating?.setTheme?.('soccer');
        } else if (data.type === 'stand') {
            this.systems.floating?.setTheme?.('awards');
        }
    }
    
    // Celebrar gol
    celebrateGoal() {
        console.log('⚽ ¡GOOOL!');
        
        // Ráfaga de elementos de celebración
        if (this.systems.floating) {
            this.systems.floating.celebrate?.();
            setTimeout(() => {
                this.systems.floating.createBurst?.(5);
            }, 1000);
        }
        
        // Efectos de fondo especiales
        if (this.systems.background) {
            this.systems.background.createSpecialEffect?.('goal');
        }
    }
    
    // Actualizar efectos basados en tiempo
    updateTimeBasedEffects(timeData) {
        if (STADIUM_CONFIG.effects.timeBasedEffects) {
            this.systems.background?.updateTimeEffects?.();
        }
    }
    
    // Actualizar progreso de carga
    updateLoadingProgress(progress) {
        this.loadingProgress = progress;
        this.eventManager.emit('ui:loadingProgress', progress);
    }
    
    // Control de rendimiento
    optimizePerformance() {
        const fps = this.getFPS();
        
        if (fps < 30) {
            console.log('⚡ Optimizando rendimiento...');
            
            // Reducir elementos flotantes
            if (this.systems.floating) {
                this.systems.floating.setMaxElements?.(Math.max(5, STADIUM_CONFIG.performance.maxFloatingElements / 2));
            }
            
            // Desactivar efectos costosos
            STADIUM_CONFIG.graphics.enableParticles = false;
            
            this.eventManager.emit('performance:optimized', { fps, actions: ['reduced_floating', 'disabled_particles'] });
        }
    }
    
    // Obtener FPS aproximado
    getFPS() {
        // Implementación simple de medición de FPS
        const now = performance.now();
        if (this.lastFPSCheck) {
            return Math.round(1000 / (now - this.lastFPSCheck));
        }
        this.lastFPSCheck = now;
        return 60; // Default assumption
    }
    
    // Pausar todos los sistemas
    pauseAll() {
        Object.values(this.systems).forEach(system => {
            system.pause?.();
        });
        this.eventManager.emit('stadium:paused');
    }
    
    // Reanudar todos los sistemas
    resumeAll() {
        Object.values(this.systems).forEach(system => {
            system.resume?.();
        });
        this.eventManager.emit('stadium:resumed');
    }
    
    // Limpiar recursos
    cleanup() {
        console.log('🧹 Limpiando recursos del Stadium Manager...');
        
        Object.values(this.systems).forEach(system => {
            system.cleanup?.();
        });
        
        this.events = {};
        this.initialized = false;
    }
    
    // API pública para interactuar con el stadium
    getAPI() {
        return {
            // Control básico
            pause: () => this.pauseAll(),
            resume: () => this.resumeAll(),
            
            // Eventos
            on: (event, callback) => this.eventManager.on(event, callback),
            emit: (event, data) => this.eventManager.emit(event, data),
            
            // Estados
            isInitialized: () => this.initialized,
            getLoadingProgress: () => this.loadingProgress,
            
            // Efectos especiales
            celebrateGoal: () => this.celebrateGoal(),
            
            // Configuración
            getConfig: () => STADIUM_CONFIG,
            updateConfig: (newConfig) => Object.assign(STADIUM_CONFIG, newConfig),
            
            // Sistemas
            getSystems: () => this.systems
        };
    }
}

// Utilidades globales
const StadiumUtils = {
    // Detectar capacidades del dispositivo
    detectCapabilities() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        return {
            webgl: !!gl,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            isRetina: window.devicePixelRatio > 1,
            maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 0,
            supportsShadows: !!gl
        };
    },
    
    // Optimizar configuración según el dispositivo
    optimizeConfig() {
        const capabilities = this.detectCapabilities();
        
        if (capabilities.isMobile) {
            STADIUM_CONFIG.performance.maxFloatingElements = 8;
            STADIUM_CONFIG.performance.shadowMapSize = 1024;
            STADIUM_CONFIG.graphics.enableParticles = false;
        }
        
        if (!capabilities.supportsShadows) {
            STADIUM_CONFIG.graphics.enableShadows = false;
        }
        
        return STADIUM_CONFIG;
    },
    
    // Formatear fecha para próximo partido
    formatNextMatchDate(date) {
        const options = { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('es-ES', options);
    },
    
    // Generar colores aleatorios para equipos
    generateTeamColors() {
        const colors = ['🔵', '🔴', '⚪', '🟡', '🟢', '🟠', '🟣', '⚫'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
};

// Crear instancia global
const stadiumManager = new StadiumManager();

// Exportar para uso global
window.StadiumManager = stadiumManager;
window.StadiumAPI = stadiumManager.getAPI();
window.StadiumConfig = STADIUM_CONFIG;
window.StadiumUtils = StadiumUtils;

// Auto-inicialización cuando todo esté cargado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(stadiumManager.init, 100);
    });
} else {
    setTimeout(stadiumManager.init, 100);
}

// Exportar configuración para otros módulos
export { STADIUM_CONFIG, StadiumManager, StadiumUtils };