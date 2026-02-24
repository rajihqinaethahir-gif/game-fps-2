class Weapon {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        
        this.magSize = 30;
        this.currentAmmo = 120;
        this.ammoInMag = 30;
        this.fireRate = 100; // milliseconds
        this.lastShot = 0;
        this.damage = 40;
        this.headshotDamage = 100;
        
        this.createWeaponModel();
    }

    createWeaponModel() {
        // Create a simple gun model
        const gunGroup = new THREE.Group();
        
        // Barrel
        const barrelGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 16);
        const metalMaterial = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.3,
            metalness: 0.8
        });
        const barrel = new THREE.Mesh(barrelGeometry, metalMaterial);
        barrel.position.set(0.3, -0.2, -1);
        gunGroup.add(barrel);
        
        // Stock
        const stockGeometry = new THREE.BoxGeometry(0.2, 0.3, 1.5);
        const stockMaterial = new THREE.MeshStandardMaterial({
            color: 0x654321,
            roughness: 0.6
        });
        const stock = new THREE.Mesh(stockGeometry, stockMaterial);
        stock.position.set(0.1, -0.15, -0.5);
        gunGroup.add(stock);
        
        // Trigger guard
        const guardGeometry = new THREE.BoxGeometry(0.15, 0.4, 0.3);
        const guard = new THREE.Mesh(guardGeometry, metalMaterial);
        guard.position.set(0.2, -0.2, -0.3);
        gunGroup.add(guard);
        
        // Sight
        const sightGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.1);
        const sight = new THREE.Mesh(sightGeometry, metalMaterial);
        sight.position.set(0.3, 0.2, -0.5);
        gunGroup.add(sight);
        
        gunGroup.position.set(0.5, -0.5, -1.5);
        gunGroup.rotation.z = 0.2;
        this.player.mesh.add(gunGroup);
        
        this.gunGroup = gunGroup;
    }

    fire() {
        if (this.am