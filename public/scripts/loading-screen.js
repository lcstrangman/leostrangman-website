// ===================================================================================
// Section: Loading Screen
// ===================================================================================
class LoadingScreen {
    static init() {
        // Start sequence after 1 second
        setTimeout(() => {
            this.startSequence();
        }, 1000);
    }

    static startSequence() {
        // Step 1: First pixelation - cover the SVG
        this.firstPixelation(() => {
            // Step 2: Immediately start second pixelation - reveal loading screen
            this.secondPixelation(() => {
                // Step 3: Wait 0.3 seconds, then fade out everything
                setTimeout(() => {
                    this.fadeOutEverything();
                }, 2000);
            });
        });
    }

    static firstPixelation(callback) {
        const pixelTransition = document.getElementById('pixel-transition');
        this.createPixelGrid(pixelTransition);
        
        const pixels = Array.from(pixelTransition.children);
        this.animatePixelsToBlack(pixels, () => {
            // Hide initial screen
            document.getElementById('initial-screen').style.display = 'none';
            // Show loading screen
            document.getElementById('loading-screen').style.display = 'flex';
            callback();
        });
    }

    static secondPixelation(callback) {
        const pixelTransition = document.getElementById('pixel-transition');
        const pixels = Array.from(pixelTransition.children);
        
        // Immediately start revealing (pixels go transparent)
        this.animatePixelsToTransparent(pixels, () => {
            // Hide pixel overlay
            pixelTransition.style.display = 'none';
            callback();
        });
    }

    static fadeOutEverything() {
        const pixelTransition = document.getElementById('pixel-transition');
        this.createPixelGrid(pixelTransition);
        
        const pixels = Array.from(pixelTransition.children);
        this.animatePixelsToBlack(pixels, () => {
            // Hide all loading elements
            setTimeout(() => {
                document.getElementById('loading-screen').style.display = 'none';
                pixelTransition.style.display = 'none';
            }, 100);
        });
    }

    static createPixelGrid(container) {
        container.innerHTML = '';
        const gridSize = 50;
        const totalPixels = gridSize * gridSize;
        
        container.style.display = 'grid';
        container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
        
        for (let i = 0; i < totalPixels; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            container.appendChild(pixel);
        }
    }

    static animatePixelsToBlack(pixels, callback) {
        const totalPixels = pixels.length;
        const maxDelay = 800; // Total time for staggered effect
        let completedCount = 0;

        pixels.forEach((pixel) => {
            const delay = Math.random() * maxDelay;
            
            setTimeout(() => {
                pixel.classList.add('black');
                completedCount++;
                
                if (completedCount === totalPixels && callback) {
                    callback();
                }
            }, delay);
        });
    }

    static animatePixelsToTransparent(pixels, callback) {
        const totalPixels = pixels.length;
        const maxDelay = 800;
        let completedCount = 0;

        pixels.forEach((pixel) => {
            const delay = Math.random() * maxDelay;
            
            setTimeout(() => {
                pixel.classList.remove('black');
                completedCount++;
                
                if (completedCount === totalPixels && callback) {
                    callback();
                }
            }, delay);
        });
    }
}


function initializePage() {
    // Show loading screen immediately
    LoadingScreen.init();
}

// Auto-initialize when script loads
initializePage();
document.addEventListener('astro:page-load', initializePage);