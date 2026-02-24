// ============= MAIN GAME CLASS =============
class FPSGame {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.physics = null;
        
        this.gameState = 'menu'; // menu, playing, gameOver
        this.score = 0;
        this.health = 100;
        this.maxHealth = 100;
        this.gameTime = 180; // seconds
        this.gameTimeRemaining = this.gameTime;
        this.currentWave = 1;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.headshotKills = 0;
        
        this.currentTheme = 'forest';
        this.enemyType = 'mixed';
        this.soundEnabled = true;
        this.bloodEffectsEnabled = true;
        this.difficulty = 'normal';
        this.masterVolume = 0.7;

        this.player = null;
        this.weapon = null;
        this.enemies = [];
        this.particles = [];
        this.bloodParticles = [];
        
        this.keys = {};
        this.mouseDown = false;
        this.lastShot = 0;
        this.shotCooldown = 100;

        this.highScores = this.loadHighScores();
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('highScoresBtn').addEventListener('click', () => this.showHighScores());
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('backBtn').addEventListener('click', () => this.hideSettings());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.getElementById('menuBtn').addEventListener('click', () => this.returnToMenu());

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTheme = e.target.dataset.theme;
            });
        });

        // Enemy type selector
        document.querySelectorAll('input[name="enemyType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.enemyType = e.target.value;
            });
        });

        // Settings
        document.getElementById('volumeSlider').addEventListener('input', (e) => {
            this.masterVolume = e.target.value / 100;
            document.getElementById('volumeValue').textContent = e.target.value + '%';
            if (audioSystem) audioSystem.setMasterVolume(this.masterVolume);
        });

        document.getElementById('soundToggle').addEventListener('change', (e) => {
            this.soundEnabled = e.target.checked;
            if (audioSystem) audioSystem.setSoundEnabled(this.soundEnabled);
        });

        document.getElementById('bloodToggle').addEventListener('change', (e) => {
            this.bloodEffectsEnabled = e.target.checked;
        });

        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
        });

        document.getElementById('gameDuration').addEventListener('change', (e) => {
            this.gameTime = parseInt(e.target.value);
        });

        // Keyboard
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') e.preventDefault();
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse
        document.addEventListener('mousedown', () => {
            this.mouseDown = true;
            if (this.gameState === 'playing') {
                this.crosshairHit();
            }
        });

        document.addEventListener('mouseup', () => {
            this.mouseDown = false;
        });

        document.addEventListener('mousemove', (e) => {
            if (this.gameState === 'playing' && this.camera) {
                this.camera.rotation.x -= e.movementY * 0.005;
                this.camera.rotation.z -= e.movementX * 0.005;

                this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));
            }
        });

        // Touch controls for mobile
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1 && this.gameState === 'playing') {
                this.lastTouchX = e.touches[0].clientX;
                this.lastTouchY = e.touches[0].clientY;
                this.mouseDown = true;
            }
        });

        document.addEventListener('touchend', () => {
            this.mouseDown = false;
        });

        document.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.gameState === 'playing' && this.lastTouchX !== undefined) {
                const deltaX = e.touches[0].clientX - this.lastTouchX;
                const deltaY = e.touches[0].clientY - this.lastTouchY;

                this.camera.rotation.y -= deltaX * 0.005;
                this.camera.rotation.x -= deltaY * 0.005;

                this.camera.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.camera.rotation.x));

                this.lastTouchX = e.touches[0].clientX;
                this.lastTouchY = e.touches[0].clientY;
            }
        });

        // Pointer lock
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.canvas.requestPointerLock = this.canvas.requestPointerLock || this.canvas.mozRequestPointerLock;
                this.canvas.requestPointerLock();
            }
        });
    }

    startGame() {
        this.score = 0;
        this.health = this.maxHealth;
        this.gameTimeRemaining = this.gameTime;
        this.currentWave = 1;
        this.enemiesSpawned = 0;
        this.enemiesKilled = 0;
        this.headshotKills = 0;
        this.enemies = [];
        this.particles = [];
        this.bloodParticles = [];

        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('settings').classList.add('hidden');
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('timer').classList.remove('hidden');
        document.getElementById('wave').classList.remove('hidden');

        if (!this.scene) {
            this.initScene();
        } else {
            this.resetScene();
        }

        this.gameState = 'playing';
        this.gameLoop();
    }

    initScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x000000, 100, 500);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.7, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;

        // Physics
        this.physics = new CANNON.World();
        this.physics.gravity.set(0, -9.82, 0);
        this.physics.defaultContactMaterial.friction = 0.3;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);

        // Create environment
        this.createEnvironment();

        // Create player
        this.player = new Player(this.scene, this.physics);
        
        // Create weapon
        this.weapon = new Weapon(this.scene, this.player);

        // Audio system
        if (!window.audioSystem) {
            window.audioSystem = new AudioSystem();
            audioSystem.setMasterVolume(this.masterVolume);
        }

        window.addEventListener('resize', () => this.onWindowResize());
    }

    resetScene() {
        // Clear enemies
        this.enemies.forEach(enemy => {
            this.scene.remove(enemy.mesh);
            this.physics.removeBody(enemy.body);
        });
        this.enemies = [];

        // Reset player
        this.player.mesh.position.set(0, 1.7, 0);
        this.player.body.position.copy(this.player.mesh.position);
        this.player.velocity.set(0, 0, 0);

        // Clear particles
        this.particles.forEach(p => this.scene.remove(p.mesh));
        this.bloodParticles.forEach(p => this.scene.remove(p.mesh));
        this.particles = [];
        this.bloodParticles = [];

        // Reset weapon
        this.weapon.currentAmmo = this.weapon.maxAmmo;
        this.weapon.ammoInMag = this.weapon.magSize;
    }

    createEnvironment() {
        const themes = {
            forest: () => {
                this.scene.background = new THREE.Color(0x87ceeb);
                this.scene.fog.color.set(0x87ceeb);

                // Sky
                const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
                const skyMaterial = new THREE.MeshBasicMaterial({
                    color: 0x87ceeb,
                    side: THREE.BackSide
                });
                const sky = new THREE.Mesh(skyGeometry, skyMaterial);
                this.scene.add(sky);

                // Ground
                const groundGeometry = new THREE.PlaneGeometry(500, 500);
                const groundMaterial = new THREE.MeshStandardMaterial({
                    color: 0x3d7c2a,
                    roughness: 0.8,
                    metalness: 0
                });
                const ground = new THREE.Mesh(groundGeometry, groundMaterial);
                ground.rotation.x = -Math.PI / 2;
                ground.receiveShadow = true;
                this.scene.add(ground);

                const groundShape = new CANNON.Plane();
                const groundBody = new CANNON.Body({ mass: 0 });
                groundBody.addShape(groundShape);
                groundBody.position.y = 0;
                this.physics.addBody(groundBody);

                // Trees
                for (let i = 0; i < 30; i++) {
                    const x = (Math.random() - 0.5) * 400;
                    const z = (Math.random() - 0.5) * 400;
                    this.createTree(x, z);
                }
            },

            city: () => {
                this.scene.background = new THREE.Color(0x4a90e2);
                this.scene.fog.color.set(0x4a90e2);

                // Sky
                const skyGeometry = new THREE.SphereGeometry(400, 32, 32);
                const skyMaterial = new THREE.MeshBasicMaterial({
                    color: 0x4a90e2,
                    side: THREE.BackSide
                });
                const sky = new THREE.Mesh(skyGeometry, skyMaterial);
                this.scene.add(sky);

                // Ground
                const groundGeometry = new THREE.PlaneGeometry(500, 500);
                const groundMaterial = new THREE.MeshStandardMaterial({
                    color: 0x505050,
                    roughness: 0.7,
                    metalness: 0.1
                });
                const ground = new THREE.Mesh(groundGeometry, groundMaterial);
                ground.rotation.x = -Math.PI / 2;
                ground.receiveShadow = true;
                this.scene.add(ground);

                const groundShape = new CANNON.Plane();
                const groundBody = new CANNON.Body({ mass: 0 });
                groundBody.addShape(groundShape);
                this.physics.addBody(groundBody);

                // Buildings
                for (let i = 0; i < 12; i++) {
                    const x = (Math.random() - 0.5) * 400;
                    const z = (Math.random() - 0.5) * 400;
                    const width = 20 + Math.random() * 30;
                    const height = 30 + Math.random() * 50;
                    const depth = 20 + Math.random() * 30;
                    this.createBuilding(x, height / 2, z, width, height, depth);
                }
            },

            space: () => {
                this.scene.background = new THREE.Color(0x000011);
                this.scene.fog.color.set(0x000011);
                this.scene.fog.far = 800;

                // Starfield
                const starsGeometry = new THREE.BufferGeometry();
                const starCount = 1000;
                const positions = new Float32Array(starCount * 3);
                for (let i = 0; i < starCount * 3; i += 3) {
                    positions[i] = (Math.random() - 0.5) * 2000;
                    positions[i + 1] = (Math.random() - 0.5) * 2000;
                    positions[i + 2] = (Math.random() - 0.5) * 2000;
                }
                starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
                const stars = new THREE.Points(starsGeometry, starsMaterial);
                this.scene.add(stars);

                // Ground (Metal platform)
                const groundGeometry = new THREE.PlaneGeometry(500, 500);
                const groundMaterial = new THREE.MeshStandardMaterial({
                    color: 0x1a3a52,
                    roughness: 0.3,
                    metalness: 0.8
                });
                const ground = new THREE.Mesh(groundGeometry, groundMaterial);
                ground.rotation.x = -Math.PI / 2;
                ground.receiveShadow = true;
                this.scene.add(ground);

                const groundShape = new CANNON.Plane();
                const groundBody = new CANNON.Body({ mass: 0 });
                groundBody.addShape(groundShape);
                this.physics.addBody(groundBody);

                // Sci-fi structures
                for (let i = 0; i < 8; i++) {
                    const x = (Math.random() - 0.5) * 400;
                    const z = (Math.random() - 0.5) * 400;
                    this.createSciFiStructure(x, z);
                }
            }
        };

        if (themes[this.currentTheme]) {
            themes[this.currentTheme]();
        }
    }

    createTree(x, z) {
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(1, 1.5, 8, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: 0x8b6f47,
            roughness: 0.8
        });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, 4, z);
        trunk.castShadow = true;
        trunk.receiveShadow = true;
        this.scene.add(trunk);

        // Foliage
        const foliageGeometry = new THREE.SphereGeometry(6, 8, 8);
        const foliageMaterial = new THREE.MeshStandardMaterial({
            color: 0x2d8c2d,
            roughness: 0.7
        });
        const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
        foliage.position.set(x, 10, z);
        foliage.castShadow = true;
        foliage.receiveShadow = true;
        this.scene.add(foliage);

        // Physics
        const shape = new CANNON.Sphere(1.5);
        const body = new CANNON.Body({ mass: 0 });
        body.addShape(shape);
        body.position.set(x, 4, z);
        this.physics.addBody(body);
    }

    createBuilding(x, y, z, width, height, depth) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(Math.random(), 0.1, 0.3),
            roughness: 0.6,
            metalness: 0.1
        });
        const building = new THREE.Mesh(geometry, material);
        building.position.set(x, y, z);
        building.castShadow = true;
        building.receiveShadow = true;
        this.scene.add(building);

        // Physics
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const body = new CANNON.Body({ mass: 0 });
        body.addShape(shape);
        body.position.copy(building.position);
        this.physics.addBody(body);
    }

    createSciFiStructure(x, z) {
        const geometry = new THREE.CylinderGeometry(3, 3, 15, 12);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x00ffff,
            emissiveIntensity: 0.2
        });
        const structure = new THREE.Mesh(geometry, material);
        structure.position.set(x, 7.5, z);
        structure.castShadow = true;
        structure.receiveShadow = true;
        this.scene.add(structure);

        // Physics
        const shape = new CANNON.Cylinder(3, 3, 15, 12);
        const body = new CANNON.Body({ mass: 0 });
        body.addShape(shape);
        body.position.copy(structure.position);
        this.physics.addBody(body);
    }

    crosshairHit() {
        if (Date.now() - this.lastShot < this.shotCooldown) return;
        this.lastShot = Date.now();

        if (this.weapon.fire()) {
            // Audio
            if (this.soundEnabled) {
                audioSystem.playSoundEffect('shoot');
            }

            // Raycasting
            const raycaster = new THREE.Raycaster();
            const direction = new THREE.Vector3(0, 0, -1);
            direction.applyQuaternion(this.camera.quaternion);
            raycaster.ray.origin.copy(this.camera.position);
            raycaster.ray.direction.copy(direction);

            const intersects = raycaster.intersectObjects(this.enemies.map(e => e.mesh), true);

            if (intersects.length > 0) {
                const target = intersects[0].object;
                const enemy = this.enemies.find(e => e.mesh === target || e.mesh.children.includes(target));

                if (enemy) {
                    const isHeadshot = target === enemy.head || target.parent === enemy.head;
                    const damage = isHeadshot ? 100 : 40;
                    
                    enemy.takeDamage(damage);
                    
                    if (isHeadshot) {
                        this.headshotKills++;
                        this.score += 50;
                    } else {
                        this.score += 10;
                    }

                    if (this.bloodEffectsEnabled) {
                        this.createBloodEffect(intersects[0].point, intersects[0].normal);
                    }

                    if (this.soundEnabled) {
                        audioSystem.playSoundEffect(isHeadshot ? 'headshot' : 'hit');
                    }

                    if (enemy.health <= 0) {
                        this.score += 100;
                        this.enemiesKilled++;
                        this.removeEnemy(enemy);
                    }
                }
            }
        }
    }

    createBloodEffect(position, normal) {
        const particleCount = 10;
        for (let i = 0; i < particleCount; i++) {
            const particle = new BloodParticle(position, normal);
            this.bloodParticles.push(particle);
            this.scene.add(particle.mesh);
        }
    }

    spawnEnemy() {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 30;
        const x = Math.cos(angle) * distance;
        const z = Math.sin(angle) * distance;

        let type;
        if (this.enemyType === 'mixed') {
            type = Math.random() > 0.5 ? 'zombie' : 'human';
        } else {
            type = this.enemyType;
        }

        const enemy = new Enemy(type, this.scene, this.physics, { x, y: 0, z });
        this.enemies.push(enemy);
        this.enemiesSpawned++;
    }

    removeEnemy(enemy) {
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.scene.remove(enemy.mesh);
            this.physics.removeBody(enemy.body);
            this.enemies.splice(index, 1);
        }
    }

    updateGame() {
        if (this.gameState !== 'playing') return;

        // Update time
        this.gameTimeRemaining -= 0.016; // ~60fps
        if (this.gameTimeRemaining <= 0) {
            this.gameTimeRemaining = 0;
            this.endGame();
            return;
        }

        // Update HUD
        document.getElementById('score').textContent = `Score: ${Math.floor(this.score)}`;
        document.getElementById('health').textContent = `Health: ${this.health}`;
        document.getElementById('ammo').textContent = `Ammo: ${this.weapon.ammoInMag}/${this.weapon.currentAmmo}`;
        document.getElementById('timer').textContent = Math.ceil(this.gameTimeRemaining);
        document.getElementById('wave').textContent = `Wave: ${this.currentWave} | Enemies: ${this.enemies.length}`;

        // Player input
        const moveVector = new THREE.Vector3();
        if (this.keys['w']) moveVector.z -= 1;
        if (this.keys['s']) moveVector.z += 1;
        if (this.keys['a']) moveVector.x -= 1;
        if (this.keys['d']) moveVector.x += 1;

        if (moveVector.length() > 0) {
            moveVector.normalize().multiplyScalar(0.1);
            moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.camera.rotation.y);
            this.player.velocity.x = moveVector.x * 20;
            this.player.velocity.z = moveVector.z * 20;
        } else {
            this.player.velocity.x *= 0.9;
            this.player.velocity.z *= 0.9;
        }

        if (this.keys[' ']) {
            if (this.player.onGround) {
                this.player.velocity.y = 10;
                this.player.onGround = false;
            }
        }

        this.player.body.velocity.copy(this.player.velocity);
        this.camera.position.copy(this.player.mesh.position);
        this.camera.position.y += 0.5;

        // Continuous fire
        if (this.mouseDown && Date.now() - this.lastShot > this.shotCooldown) {
            this.crosshairHit();
        }

        // Enemy spawning
        const spawnRate = this.gameTime / (this.gameTimeRemaining + 1);
        if (this.enemies.length < 5 + this.currentWave * 2 && Math.random() < 0.01 * spawnRate) {
            this.spawnEnemy();
        }

        // Update wave
        if (this.enemiesSpawned > 20 * this.currentWave && this.enemies.length === 0) {
            this.currentWave++;
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(this.player.mesh.position);

            // Enemy shoots player
            if (Math.random() < 0.001 && enemy.type === 'human') {
                const distance = enemy.mesh.position.distanceTo(this.player.mesh.position);
                if (distance < 50) {
                    this.takeDamage(15);
                    if (this.soundEnabled) {
                        audioSystem.playSoundEffect('enemyShoot');
                    }
                }
            }

            // Melee damage
            if (Math.random() < 0.0005) {
                const distance = enemy.mesh.position.distanceTo(this.player.mesh.position);
                if (distance < 3) {
                    this.takeDamage(20);
                    if (this.soundEnabled) {
                        audioSystem.playSoundEffect('hurt');
                    }
                }
            }

            // Remove far enemies
            if (enemy.mesh.position.distanceTo(this.player.mesh.position) > 200) {
                this.removeEnemy(enemy);
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update();
            if (this.particles[i].isDead) {
                this.scene.remove(this.particles[i].mesh);
                this.particles.splice(i, 1);
            }
        }

        // Update blood particles
        for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
            this.bloodParticles[i].update();
            if (this.bloodParticles[i].isDead) {
                this.scene.remove(this.bloodParticles[i].mesh);
                this.bloodParticles.splice(i, 1);
            }
        }

        // Physics update
        this.physics.step(1 / 60);

        // Update player contact
        this.player.updateContact(this.physics);
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            this.endGame();
        }
    }

    endGame() {
        this.gameState = 'gameOver';
        this.saveHighScore(this.score);
        this.displayGameOver();
    }

    displayGameOver() {
        document.getElementById('finalScore').textContent = `Score: ${Math.floor(this.score)}`;
        document.getElementById('gameStats').textContent = `
            Enemies Killed: ${this.enemiesKilled}
            Headshots: ${this.headshotKills}
            Wave Reached: ${this.currentWave}
        `;

        const topScores = this.highScores.slice(0, 5).map((score, i) => 
            `${i + 1}. ${score.toFixed(0)}`
        ).join('<br>');

        document.getElementById('highScoresDisplay').innerHTML = '<strong>Top Scores:</strong><br>' + topScores;
        document.getElementById('gameOver').classList.remove('hidden');
    }

    showHighScores() {
        const scoresHtml = this.highScores.slice(0, 10).map((score, i) =>
            `<div>${i + 1}. ${score.toFixed(0)} points</div>`
        ).join('');
        document.getElementById('highScores').innerHTML = scoresHtml;
        document.getElementById('highScores').classList.remove('hidden');
    }

    showSettings() {
        document.getElementById('mainMenu').classList.add('hidden');
        document.getElementById('settings').classList.remove('hidden');
    }

    hideSettings() {
        document.getElementById('settings').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
    }

    returnToMenu() {
        this.gameState = 'menu';
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('mainMenu').classList.remove('hidden');
        document.getElementById('timer').classList.add('hidden');
        document.getElementById('wave').classList.add('hidden');
    }

    saveHighScore(score) {
        this.highScores.push(score);
        this.highScores.sort((a, b) => b - a);
        this.highScores = this.highScores.slice(0, 100);
        localStorage.setItem('fpsGameHighScores', JSON.stringify(this.highScores));
        
        // Send to server
        this.sendScoreToServer(score);
    }

    loadHighScores() {
        const saved = localStorage.getItem('fpsGameHighScores');
        return saved ? JSON.parse(saved) : [];
    }

    async sendScoreToServer(score) {
        try {
            await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    score: score,
                    theme: this.currentTheme,
                    enemyType: this.enemyType,
                    difficulty: this.difficulty,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (err) {
            console.error('Failed to send score:', err);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    gameLoop() {
        requestAnimationFrame(() => this.gameLoop());

        this.updateGame();

        if (this.renderer) {
            this.renderer.render(this.scene, this.camera);
        }
    }
}

// ============= PLAYER CLASS =============
class Player {
    constructor(scene, physics) {
        this.scene = scene;
        this.physics = physics;
        this.velocity = new CANNON.Vec3();
        this.onGround = true;

        // Create mesh
        const geometry = new THREE.CapsuleGeometry(0.5, 2, 4, 8);
        const material = new THREE.MeshStandardMaterial({ color: 0x666666 });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(0, 1, 0);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);

        // Create physics body
        const shape = new CANNON.Sphere(0.5);
        this.body = new CANNON.Body({
            mass: 1,
            shape: shape,
            linearDamping: 0.5,
            angularDamping: 1
        });
        this.body.position.copy(this.mesh.position);
        this.physics.addBody(this.body);
    }

    updateContact(physics) {
        this.onGround = false;
        for (let i = 0; i < physics.contacts.length; i++) {
            const contact = physics.contacts[i];
            if (contact.body1 === this.body || contact.body2 === this.body) {
                this.onGround = true;
                break;
            }
        }
    }
}

// Initialize game
window.addEventListener('load', () => {
    window.game = new FPSGame();
});