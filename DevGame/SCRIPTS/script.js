// Initialize the Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(10, 20, 10).normalize();
scene.add(light);

// Create the ground plane
const groundSize = 50;
const groundGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Create blocks to form a grid-like environment
let blocks = [];
function createBlock(x, y, z) {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const block = new THREE.Mesh(geometry, material);
    block.position.set(x, y + 0.5, z);
    block.userData = { breakable: true };
    blocks.push(block);
    scene.add(block);
    return block;
}

// Create a grid of blocks
for (let x = -5; x <= 5; x++) {
    for (let z = -5; z <= 5; z++) {
        if (Math.random() > 0.3) {
            createBlock(x, 0, z);
        }
    }
}

// Create the player (a simple taller cube character)
const playerHeight = 1.5; // Adjusted player height
const playerWidth = 0.5; // Keep the width the same
const playerGeometry = new THREE.BoxGeometry(playerWidth, playerHeight, playerWidth);
const playerMaterial = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, playerHeight / 2, 0); // Adjusted initial position to align with the ground
scene.add(player);

// Pointer lock controls
const controls = new THREE.PointerLockControls(camera, document.body);
document.addEventListener('click', () => {
    controls.lock();
});
scene.add(controls.getObject());

// Movement variables
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isJumping = false, jumpVelocity = 0.2, gravity = 0.01;
let speed = 0.1;

// Breaking and placing block variables
let breakStartTime = null;
let lookingAtBlock = null;
const breakDuration = 3500; // 3.5 seconds

// Handle keyboard input
function onKeyDown(event) {
    switch (event.code) {
        case 'KeyW': moveForward = true; break;
        case 'KeyS': moveBackward = true; break;
        case 'KeyA': moveLeft = true; break;
        case 'KeyD': moveRight = true; break;
        case 'Space':
            if (!isJumping) {
                isJumping = true;
                jumpVelocity = 0.2;
            }
            break;
    }
}

function onKeyUp(event) {
    switch (event.code) {
        case 'KeyW': moveForward = false; break;
        case 'KeyS': moveBackward = false; break;
        case 'KeyA': moveLeft = false; break;
        case 'KeyD': moveRight = false; break;
    }
}
window.addEventListener('keydown', onKeyDown);
window.addEventListener('keyup', onKeyUp);

// Mouse interaction
window.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left-click starts breaking
        breakStartTime = performance.now();
    }
});

window.addEventListener('mouseup', (event) => {
    if (event.button === 0) { // Left-click released
        breakStartTime = null;
    }
    if (event.button === 2 && lookingAtBlock) { // Right-click places a block
        placeBlock();
    }
});

// Function to place a block in front of the player
function placeBlock() {
    const direction = new THREE.Vector3();
    controls.getDirection(direction);
    const placePosition = player.position.clone().add(direction.multiplyScalar(1.5)).floor().add(new THREE.Vector3(0, 1, 0));
    createBlock(placePosition.x, placePosition.y, placePosition.z);
}

// Update player position
function updatePlayerPosition() {
    const direction = new THREE.Vector3();

    controls.getDirection(direction);
    direction.y = 0;
    direction.normalize();

    const right = new THREE.Vector3().crossVectors(direction, new THREE.Vector3(0, 1, 0)).normalize();

    if (moveForward) player.position.add(direction.clone().multiplyScalar(speed));
    if (moveBackward) player.position.add(direction.clone().multiplyScalar(-speed));
    if (moveLeft) player.position.add(right.clone().multiplyScalar(-speed));
    if (moveRight) player.position.add(right.clone().multiplyScalar(speed));

    if (isJumping) {
        player.position.y += jumpVelocity;
        jumpVelocity -= gravity;
        if (player.position.y <= playerHeight / 2) {
            player.position.y = playerHeight / 2;
            isJumping = false;
            jumpVelocity = 0.2;
        }
    }

    controls.getObject().position.set(player.position.x, player.position.y + (playerHeight / 2), player.position.z);

    // Check if the player is looking at a block
    checkBlockInteraction();
}

// Function to check if the player is looking at a block
function checkBlockInteraction() {
    const direction = new THREE.Vector3();
    controls.getDirection(direction);
    const raycaster = new THREE.Raycaster(player.position, direction);
    const intersects = raycaster.intersectObjects(blocks);

    if (intersects.length > 0 && intersects[0].distance < 3) {
        lookingAtBlock = intersects[0].object;
    } else {
        lookingAtBlock = null;
        breakStartTime = null;
    }

    if (breakStartTime && lookingAtBlock) {
        const elapsedTime = performance.now() - breakStartTime;
        if (elapsedTime >= breakDuration) {
            scene.remove(lookingAtBlock);
            blocks = blocks.filter(block => block !== lookingAtBlock);
            lookingAtBlock = null;
            breakStartTime = null;
        }
    }
}

// Render loop
function animate() {
    requestAnimationFrame(animate);
    updatePlayerPosition();
    renderer.render(scene, camera);
}
animate();
