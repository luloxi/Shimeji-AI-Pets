// Content script for Shimeji with state machine and individual sprites

(function() {
    // Clean up any previous instance (e.g., after extension reinstall/update)
    if (window.__shimejiCleanup) {
        try { window.__shimejiCleanup(); } catch(e) {}
    }
    window.__shimejiInitialized = true;

    // --- Configuration ---
    const SPRITE_SIZE = 128; // Original sprite size
    const TICK_MS = 40; // ~25 FPS (original Shimeji timing)

    const sizes = {
        small: { scale: 0.5 },    // 64px
        medium: { scale: 0.75 },  // 96px
        big: { scale: 1.0 },      // 128px
    };

    // Physics constants from original Shimeji
    const PHYSICS = {
        gravity: 2,
        walkSpeed: 2,
        fallTerminalVelocity: 20
    };

    // States
    const State = {
        IDLE: 'idle',
        WALKING: 'walking',
        FALLING: 'falling',
        LANDING: 'landing',
        SITTING: 'sitting',
        DRAGGED: 'dragged'
    };

    // Sprite paths (relative to character folder)
    const SPRITES = {
        'stand-neutral': 'stand-neutral.png',
        'walk-step-left': 'walk-step-left.png',
        'walk-step-right': 'walk-step-right.png',
        'fall': 'fall.png',
        'bounce-squish': 'bounce-squish.png',
        'bounce-recover': 'bounce-recover.png',
        'sit': 'sit.png',
        'dragged-tilt-left': 'dragged-tilt-left-light.png',
        'dragged-tilt-right': 'dragged-tilt-right-light.png',
        'resist-frame-1': 'resist-frame-1.png',
        'resist-frame-2': 'resist-frame-2.png'
    };

    // Animation sequences (sprite name, duration in ticks)
    const ANIMATIONS = {
        idle: [
            { sprite: 'stand-neutral', duration: 1 }
        ],
        walking: [
            { sprite: 'stand-neutral', duration: 6 },
            { sprite: 'walk-step-left', duration: 6 },
            { sprite: 'stand-neutral', duration: 6 },
            { sprite: 'walk-step-right', duration: 6 }
        ],
        falling: [
            { sprite: 'fall', duration: 1 }
        ],
        landing: [
            { sprite: 'bounce-squish', duration: 4 },
            { sprite: 'bounce-recover', duration: 4 }
        ],
        sitting: [
            { sprite: 'sit', duration: 1 }
        ]
    };

    // Character base path (updated dynamically on character switch)
    let currentCharacter = 'shimeji';
    let CHARACTER_BASE = chrome.runtime.getURL('characters/shimeji/');

    // Mascot state
    let mascotElement;
    let currentSize = 'medium';
    let isDisabled = false;
    let gameLoopTimer = null;
    let spritesLoadedPromise = null;
    let documentDragListenersReady = false;

    const STORAGE_KEYS = {
        disabledAll: 'disabledAll',
        disabledPages: 'disabledPages'
    };

    function normalizePageUrl(url) {
        try {
            const parsed = new URL(url);
            parsed.hash = '';
            return parsed.toString();
        } catch (error) {
            return url;
        }
    }

    function isDisabledForCurrentPage(disabledAll, disabledPages) {
        if (disabledAll) return true;
        const pageKey = normalizePageUrl(window.location.href);
        const pageList = Array.isArray(disabledPages) ? disabledPages : [];
        return pageList.includes(pageKey);
    }

    const mascot = {
        x: window.innerWidth / 2,
        y: 0, // Y position of feet (ground = window.innerHeight)
        velocityX: 0,
        velocityY: 0,
        state: State.FALLING, // Start falling from sky
        facingRight: false,
        direction: 0, // -1 left, 0 none, 1 right

        // Animation state
        currentAnimation: 'falling',
        animationFrame: 0,
        animationTick: 0,

        // Drag state
        isDragging: false,
        dragOffsetX: 0,
        dragOffsetY: 0,

        // Drag animation state
        prevDragX: 0,           // Previous X position for velocity calculation
        smoothedVelocityX: 0,   // Smoothed horizontal velocity
        dragTick: 0,            // Tick counter during drag
        isResisting: false,     // Whether currently playing resist animation
        resistAnimTick: 0,      // Current tick in resist animation

        // Behavior timers
        stateTimer: 0
    };

    // Preloaded sprite images
    const spriteImages = {};
    let spritesLoaded = false;

    // --- Sprite Loading ---
    function preloadSprites() {
        if (spritesLoadedPromise) return spritesLoadedPromise;

        const promises = Object.entries(SPRITES).map(([key, filename]) => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => {
                    spriteImages[key] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`Failed to load sprite: ${filename}`);
                    resolve();
                };
                img.src = CHARACTER_BASE + filename;
            });
        });

        spritesLoadedPromise = Promise.all(promises).then(() => {
            spritesLoaded = true;
            console.log('All Shimeji sprites loaded');
        });

        return spritesLoadedPromise;
    }

    // --- Mascot Creation ---
    function createMascot() {
        const existingMascot = document.getElementById('shimeji-mascot');
        if (existingMascot) {
            mascotElement = existingMascot;
            updateMascotStyle();
            return;
        }

        mascotElement = document.createElement('div');
        mascotElement.id = 'shimeji-mascot';
        document.body.appendChild(mascotElement);
        updateMascotStyle();
        setupDragListeners();
    }

    function updateMascotStyle() {
        if (!mascotElement) return;

        const scale = sizes[currentSize].scale;
        const size = SPRITE_SIZE * scale;

        mascotElement.style.position = 'fixed';
        mascotElement.style.width = `${size}px`;
        mascotElement.style.height = `${size}px`;
        mascotElement.style.zIndex = '9999';
        mascotElement.style.pointerEvents = 'auto';
        mascotElement.style.cursor = 'grab';
        mascotElement.style.imageRendering = 'pixelated';
        mascotElement.style.backgroundSize = 'contain';
        mascotElement.style.backgroundRepeat = 'no-repeat';
        mascotElement.style.backgroundPosition = 'center';
    }

    function setSprite(spriteKey) {
        if (!mascotElement || !SPRITES[spriteKey]) return;
        const spritePath = CHARACTER_BASE + SPRITES[spriteKey];
        mascotElement.style.backgroundImage = `url('${spritePath}')`;
    }

    function updateSpriteDisplay() {
        if (!mascotElement || !spritesLoaded) return;

        const animation = ANIMATIONS[mascot.currentAnimation];
        if (!animation || animation.length === 0) return;

        const frame = animation[mascot.animationFrame % animation.length];
        setSprite(frame.sprite);

        // Flip sprite if facing right (sprites face left by default)
        mascotElement.style.transform = mascot.facingRight ? 'scaleX(-1)' : 'scaleX(1)';
    }

    // --- Drag Handling ---
    function setupDragListeners() {
        mascotElement.addEventListener('mousedown', startDrag);

        // Touch support
        mascotElement.addEventListener('touchstart', startDragTouch, { passive: false });

        if (!documentDragListenersReady) {
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', endDrag);
            document.addEventListener('touchmove', onDragTouch, { passive: false });
            document.addEventListener('touchend', endDrag);
            documentDragListenersReady = true;
        }
    }

    function startDrag(e) {
        e.preventDefault();
        mascot.isDragging = true;
        mascot.state = State.DRAGGED;

        const scale = sizes[currentSize].scale;
        const size = SPRITE_SIZE * scale;
        mascot.dragOffsetX = e.clientX - mascot.x;
        mascot.dragOffsetY = e.clientY - (mascot.y - size);

        // Initialize drag animation state
        mascot.prevDragX = mascot.x;
        mascot.smoothedVelocityX = 0;
        mascot.dragTick = 0;
        mascot.isResisting = false;
        mascot.resistAnimTick = 0;

        mascotElement.style.cursor = 'grabbing';
    }

    function startDragTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        mascot.isDragging = true;
        mascot.state = State.DRAGGED;

        const scale = sizes[currentSize].scale;
        const size = SPRITE_SIZE * scale;
        mascot.dragOffsetX = touch.clientX - mascot.x;
        mascot.dragOffsetY = touch.clientY - (mascot.y - size);

        // Initialize drag animation state
        mascot.prevDragX = mascot.x;
        mascot.smoothedVelocityX = 0;
        mascot.dragTick = 0;
        mascot.isResisting = false;
        mascot.resistAnimTick = 0;
    }

    function onDrag(e) {
        if (!mascot.isDragging) return;

        const scale = sizes[currentSize].scale;
        const size = SPRITE_SIZE * scale;

        // Update position
        mascot.x = e.clientX - mascot.dragOffsetX;
        mascot.y = e.clientY - mascot.dragOffsetY + size;

        // Update position immediately for responsiveness
        updatePosition();
    }

    function onDragTouch(e) {
        if (!mascot.isDragging) return;
        e.preventDefault();
        const touch = e.touches[0];

        const scale = sizes[currentSize].scale;
        const size = SPRITE_SIZE * scale;

        // Update position
        mascot.x = touch.clientX - mascot.dragOffsetX;
        mascot.y = touch.clientY - mascot.dragOffsetY + size;

        // Update position immediately for responsiveness
        updatePosition();
    }

    function endDrag() {
        if (!mascot.isDragging) return;

        mascot.isDragging = false;
        mascot.isResisting = false;
        mascotElement.style.cursor = 'grab';

        // Check if in air
        const groundY = window.innerHeight;

        if (mascot.y < groundY - 5) {
            mascot.state = State.FALLING;
            mascot.currentAnimation = 'falling';
            mascot.velocityY = 0;
        } else {
            mascot.y = groundY;
            mascot.state = State.IDLE;
            mascot.currentAnimation = 'idle';
        }

        mascot.animationFrame = 0;
        mascot.animationTick = 0;
    }

    // --- Drag Animation (called from game loop) ---
    function updateDragAnimation() {
        if (!mascotElement || !mascot.isDragging) return;

        mascot.dragTick++;

        // Calculate velocity from position change
        const rawVelocityX = mascot.x - mascot.prevDragX;
        mascot.prevDragX = mascot.x;

        // Smooth the velocity using exponential moving average
        mascot.smoothedVelocityX = mascot.smoothedVelocityX * 0.6 + rawVelocityX * 0.4;

        // Check if we should trigger resist animation (every ~2 seconds = 50 ticks)
        if (!mascot.isResisting && mascot.dragTick > 0 && mascot.dragTick % 50 === 0) {
            mascot.isResisting = true;
            mascot.resistAnimTick = 0;
        }

        // Handle resist animation
        if (mascot.isResisting) {
            mascot.resistAnimTick++;

            // Resist animation: alternate between two frames
            // Each frame lasts 5 ticks, total animation is 20 ticks (2 cycles)
            const resistCycle = Math.floor(mascot.resistAnimTick / 5) % 2;
            if (resistCycle === 0) {
                setSprite('resist-frame-1');
            } else {
                setSprite('resist-frame-2');
            }

            // End resist animation after 20 ticks (2 full cycles)
            if (mascot.resistAnimTick >= 20) {
                mascot.isResisting = false;
            }

            mascotElement.style.transform = 'scaleX(1)';
            return;
        }

        // Normal drag tilt based on smoothed velocity
        if (mascot.smoothedVelocityX > 2) {
            // Moving right - tilt left (being pulled right)
            setSprite('dragged-tilt-left');
        } else if (mascot.smoothedVelocityX < -2) {
            // Moving left - tilt right (being pulled left)
            setSprite('dragged-tilt-right');
        } else {
            // Stationary or slow - neutral pose
            setSprite('stand-neutral');
        }

        mascotElement.style.transform = 'scaleX(1)';
    }

    // --- State Machine ---
    function updateState() {
        const scale = sizes[currentSize].scale;
        const size = SPRITE_SIZE * scale;
        const groundY = window.innerHeight;
        const leftBound = 0;
        const rightBound = window.innerWidth - size;

        // Handle drag state separately
        if (mascot.isDragging) {
            updateDragAnimation();
            return;
        }

        switch (mascot.state) {
            case State.IDLE:
                mascot.stateTimer++;

                // Random transitions (wander mode only)
                if (mascot.stateTimer > 50 && Math.random() < 0.02) {
                    if (Math.random() < 0.7) {
                        mascot.state = State.WALKING;
                        mascot.currentAnimation = 'walking';
                        mascot.direction = Math.random() > 0.5 ? 1 : -1;
                        mascot.facingRight = mascot.direction > 0;
                    } else {
                        mascot.state = State.SITTING;
                        mascot.currentAnimation = 'sitting';
                    }
                    mascot.stateTimer = 0;
                    mascot.animationFrame = 0;
                }
                break;

            case State.WALKING:
                mascot.stateTimer++;
                mascot.x += PHYSICS.walkSpeed * mascot.direction;

                // Boundary check
                if (mascot.x <= leftBound) {
                    mascot.x = leftBound;
                    mascot.direction = 1;
                    mascot.facingRight = true;
                } else if (mascot.x >= rightBound) {
                    mascot.x = rightBound;
                    mascot.direction = -1;
                    mascot.facingRight = false;
                }

                // Random stop
                if (mascot.stateTimer > 50 && Math.random() < 0.01) {
                    mascot.state = State.IDLE;
                    mascot.currentAnimation = 'idle';
                    mascot.direction = 0;
                    mascot.stateTimer = 0;
                }

                // Ensure on ground
                mascot.y = groundY;
                break;

            case State.FALLING:
                mascot.velocityY += PHYSICS.gravity;
                mascot.velocityY = Math.min(mascot.velocityY, PHYSICS.fallTerminalVelocity);
                mascot.y += mascot.velocityY;

                // Check ground collision
                if (mascot.y >= groundY) {
                    mascot.y = groundY;
                    mascot.velocityY = 0;
                    mascot.state = State.LANDING;
                    mascot.currentAnimation = 'landing';
                    mascot.animationFrame = 0;
                    mascot.animationTick = 0;
                    mascot.stateTimer = 0;
                }
                break;

            case State.LANDING:
                mascot.stateTimer++;
                const landingAnim = ANIMATIONS.landing;
                const totalLandingDuration = landingAnim.reduce((sum, f) => sum + f.duration, 0);

                if (mascot.stateTimer >= totalLandingDuration) {
                    mascot.state = State.IDLE;
                    mascot.currentAnimation = 'idle';
                    mascot.animationFrame = 0;
                    mascot.animationTick = 0;
                    mascot.stateTimer = 0;
                }
                break;

            case State.SITTING:
                mascot.stateTimer++;

                // Return to idle after some time
                if (mascot.stateTimer > 100 && Math.random() < 0.02) {
                    mascot.state = State.IDLE;
                    mascot.currentAnimation = 'idle';
                    mascot.stateTimer = 0;
                    mascot.animationFrame = 0;
                }
                break;

            case State.DRAGGED:
                // Handled above
                break;
        }

        // Keep within horizontal bounds
        mascot.x = Math.max(leftBound, Math.min(mascot.x, rightBound));
    }

    // --- Animation Update ---
    function updateAnimation() {
        // Drag animation is handled in updateState -> updateDragAnimation
        if (mascot.isDragging) return;

        const animation = ANIMATIONS[mascot.currentAnimation];
        if (!animation || animation.length === 0) return;

        mascot.animationTick++;

        // Calculate current frame based on tick
        let tickCount = 0;
        for (let i = 0; i < animation.length; i++) {
            tickCount += animation[i].duration;
            if (mascot.animationTick <= tickCount) {
                mascot.animationFrame = i;
                break;
            }
        }

        // Loop animation
        const totalDuration = animation.reduce((sum, f) => sum + f.duration, 0);
        if (mascot.animationTick >= totalDuration) {
            mascot.animationTick = 0;
            mascot.animationFrame = 0;
        }

        updateSpriteDisplay();
    }

    // --- Position Update ---
    function updatePosition() {
        if (!mascotElement) return;

        const scale = sizes[currentSize].scale;
        const size = SPRITE_SIZE * scale;

        // Position is anchor at bottom-center, so adjust for CSS top-left positioning
        const drawX = mascot.x;
        const drawY = mascot.y - size;

        mascotElement.style.left = `${drawX}px`;
        mascotElement.style.top = `${drawY}px`;
    }

    // --- Main Game Loop ---
    function gameLoop() {
        updateState();
        updateAnimation();
        updatePosition();
    }

    function resetMascotState() {
        const scale = sizes[currentSize].scale;
        const size = SPRITE_SIZE * scale;

        mascot.x = window.innerWidth / 2 - size / 2;
        mascot.y = size;
        mascot.velocityX = 0;
        mascot.velocityY = 0;
        mascot.state = State.FALLING;
        mascot.currentAnimation = 'falling';
        mascot.animationFrame = 0;
        mascot.animationTick = 0;
        mascot.stateTimer = 0;
        mascot.isDragging = false;
        mascot.isResisting = false;
    }

    function startShimeji() {
        if (gameLoopTimer) return;

        preloadSprites().then(() => {
            if (isDisabled) return;

            resetMascotState();
            createMascot();

            gameLoopTimer = setInterval(gameLoop, TICK_MS);

            setTimeout(() => {
                updateSpriteDisplay();
                updatePosition();
            }, 100);
        });
    }

    function stopShimeji() {
        if (gameLoopTimer) {
            clearInterval(gameLoopTimer);
            gameLoopTimer = null;
        }

        mascot.isDragging = false;
        mascot.isResisting = false;

        if (mascotElement) {
            mascotElement.remove();
            mascotElement = null;
        }
    }

    function applyVisibilityState(disabledAll, disabledPages) {
        const shouldDisable = isDisabledForCurrentPage(disabledAll, disabledPages);
        if (shouldDisable === isDisabled) return;

        isDisabled = shouldDisable;
        if (isDisabled) {
            stopShimeji();
        } else {
            startShimeji();
        }
    }

    // --- Message Listeners ---
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === 'ping') {
            sendResponse({ pong: true });
            return true;
        }

        if (message.action === 'updateCharacter') {
            console.log('Character update received:', message.character);
            if (message.character && message.character !== currentCharacter) {
                currentCharacter = message.character;
                CHARACTER_BASE = chrome.runtime.getURL('characters/' + currentCharacter + '/');
                spritesLoaded = false;
                spritesLoadedPromise = null;
                preloadSprites().then(() => {
                    updateSpriteDisplay();
                });
            }
        } else if (message.action === 'updateSize') {
            currentSize = message.size;
            updateMascotStyle();

            if (mascot.state !== State.FALLING && mascot.state !== State.DRAGGED) {
                mascot.y = window.innerHeight;
            }
        }
    });

    chrome.storage.onChanged.addListener((changes, areaName) => {
        if (areaName !== 'sync') return;

        if (changes.character) {
            const newChar = changes.character.newValue;
            if (newChar && newChar !== currentCharacter) {
                currentCharacter = newChar;
                CHARACTER_BASE = chrome.runtime.getURL('characters/' + currentCharacter + '/');
                spritesLoaded = false;
                spritesLoadedPromise = null;
                preloadSprites().then(() => {
                    updateSpriteDisplay();
                });
            }
        }

        if (changes.size) {
            currentSize = changes.size.newValue;
            updateMascotStyle();

            if (mascot.state !== State.FALLING && mascot.state !== State.DRAGGED) {
                mascot.y = window.innerHeight;
            }
        }

        if (changes.disabledAll || changes.disabledPages) {
            chrome.storage.sync.get([STORAGE_KEYS.disabledAll, STORAGE_KEYS.disabledPages], (data) => {
                applyVisibilityState(data.disabledAll, data.disabledPages);
            });
        }
    });

    // --- Window Resize Handler ---
    function handleResize() {
        const scale = sizes[currentSize].scale;
        const size = SPRITE_SIZE * scale;
        const groundY = window.innerHeight;

        // Keep mascot in bounds
        mascot.x = Math.max(0, Math.min(mascot.x, window.innerWidth - size));

        // Put back on ground if was on ground
        if (mascot.state !== State.FALLING && mascot.state !== State.DRAGGED) {
            mascot.y = groundY;
        }
    }

    window.addEventListener('resize', handleResize);

    // --- Initialization ---
    function init() {
        chrome.storage.sync.get(['character', 'size', STORAGE_KEYS.disabledAll, STORAGE_KEYS.disabledPages], (data) => {
            currentSize = data.size || 'medium';
            if (data.character && data.character !== currentCharacter) {
                currentCharacter = data.character;
                CHARACTER_BASE = chrome.runtime.getURL('characters/' + currentCharacter + '/');
            }
            applyVisibilityState(data.disabledAll, data.disabledPages);

            if (!isDisabled) {
                startShimeji();
            }
        });
    }

    // Expose cleanup for future re-injections (extension update/reinstall)
    window.__shimejiCleanup = function() {
        if (gameLoopTimer) {
            clearInterval(gameLoopTimer);
            gameLoopTimer = null;
        }
        if (mascotElement) {
            mascotElement.remove();
            mascotElement = null;
        }
        documentDragListenersReady = false;
        window.__shimejiInitialized = false;
    };

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }

})();
