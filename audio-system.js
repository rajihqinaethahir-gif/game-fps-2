class AudioSystem {
    constructor() {
        this.masterVolume = 0.7;
        this.soundEnabled = true;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.soundEffects = {};
        this.currentBackgroundMusic = null;
        
        this.initializeSounds();
    }

    initializeSounds() {
        // Shoot sound - gunshot
        this.createShotSound('shoot');
        // Hit sound
        this.createHitSound('hit');
        // Headshot sound
        this.createHeadshotSound('headshot');
        // Enemy shoot
        this.createEnemyShootSound('enemyShoot');
        // Hurt sound
        this.createHurtSound('hurt');
        // Reload sound
        this.createReloadSound('reload');
    }

    createShotSound(name) {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
        
        this.soundEffects[name] = { type: 'procedural' };
    }

    createHitSound(name) {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        oscillator.start(now);
        oscillator.stop(now + 0.05);
        
        this.soundEffects[name] = { type: 'procedural' };
    }

    createHeadshotSound(name) {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        // High pitch sound for headshot
        for (let i = 0; i < 2; i++) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1200 + i * 200, now);
            oscillator.frequency.exponentialRampToValueAtTime(600 + i * 100, now + 0.08);
            
            gainNode.gain.setValueAtTime(0.15, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            
            oscillator.start(now);
            oscillator.stop(now + 0.08);
        }
        
        this.soundEffects[name] = { type: 'procedural' };
    }

    createEnemyShootSound(name) {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.08);
        
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        oscillator.start(now);
        oscillator.stop(now + 0.08);
        
        this.soundEffects[name] = { type: 'procedural' };
    }

    createHurtSound(name) {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        oscillator.start(now);
        oscillator.stop(now + 0.2);
        
        this.soundEffects[name] = { type: 'procedural' };
    }

    createReloadSound(name) {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        oscillator.start(now);
        oscillator.stop(now + 0.15);
        
        this.soundEffects[name] = { type: 'procedural' };
    }

    playSoundEffect(name) {
        if (!this.soundEnabled) return;
        
        try {
            const now = this.audioContext.currentTime;
            
            // Recreate and play the sound
            if (name === 'shoot') {
                this.playShootSound();
            } else if (name === 'hit') {
                this.playHitSound();
            } else if (name === 'headshot') {
                this.playHeadshotSound();
            } else if (name === 'enemyShoot') {
                this.playEnemyShootSound();
            } else if (name === 'hurt') {
                this.playHurtSound();
            } else if (name === 'reload') {
                this.playReloadSound();
            }
        } catch (err) {
            console.error('Audio error:', err);
        }
    }

    playShootSound() {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(400, now);
        oscillator.frequency.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        gainNode.gain.setValueAtTime(0.3 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        oscillator.start(now);
        oscillator.stop(now + 0.1);
    }

    playHitSound() {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'triangle';
        oscillator.frequency.setValueAtTime(800, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        
        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        oscillator.start(now);
        oscillator.stop(now + 0.05);
    }

    playHeadshotSound() {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        for (let i = 0; i < 2; i++) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(1200 + i * 200, now);
            oscillator.frequency.exponentialRampToValueAtTime(600 + i * 100, now + 0.08);
            
            gainNode.gain.setValueAtTime(0.15 * this.masterVolume, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
            
            oscillator.start(now);
            oscillator.stop(now + 0.08);
        }
    }

    playEnemyShootSound() {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(300, now);
        oscillator.frequency.exponentialRampToValueAtTime(50, now + 0.08);
        
        gainNode.gain.setValueAtTime(0.15 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        oscillator.start(now);
        oscillator.stop(now + 0.08);
    }

    playHurtSound() {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(200, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        
        gainNode.gain.setValueAtTime(0.25 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        oscillator.start(now);
        oscillator.stop(now + 0.2);
    }

    playReloadSound() {
        const audioContext = this.audioContext;
        const now = audioContext.currentTime;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, now);
        oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.15);
        
        gainNode.gain.setValueAtTime(0.1 * this.masterVolume, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        oscillator.start(now);
        oscillator.stop(now + 0.15);
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }
}