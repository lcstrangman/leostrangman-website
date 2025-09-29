export class LoadingScreen {
    private static isInitialized = false;
    private static animationTimeouts: NodeJS.Timeout[] = [];

    // -----------------------------
    // Session helpers
    // -----------------------------
    private static hasPlayed(): boolean {
        return sessionStorage.getItem('loadingPlayed') === 'true';
    }

    private static markPlayed(): void {
        sessionStorage.setItem('loadingPlayed', 'true');
    }

    // -----------------------------
    // Public API
    // -----------------------------
    static init(): void {
        this.cleanup();
        if (!this.hasRequiredElements()) return;

        if (this.hasPlayed()) {
            // Subsequent loads → just show initial screen and fade out after 1 second
            this.showInitialScreenAndFade();
            return;
        }

        // First load → run the full animation sequence
        this.isInitialized = true;
        this.showInitialScreen();

        // Start the full sequence after 1 second
        const timeout = setTimeout(() => {
            this.startFullSequence();
        }, 1000);

        this.animationTimeouts.push(timeout);
    }

    static cleanup(): void {
        this.animationTimeouts.forEach((timeout) => clearTimeout(timeout));
        this.animationTimeouts = [];
        this.isInitialized = false;
    }

    // -----------------------------
    // Helpers
    // -----------------------------
    private static hasRequiredElements(): boolean {
        const initialScreen = document.getElementById('initial-screen');
        const loadingScreen = document.getElementById('loading-screen');
        const pixelTransition = document.getElementById('pixel-transition');
        return !!(initialScreen && loadingScreen && pixelTransition);
    }

    private static showInitialScreen(): void {
        const initialScreen = document.getElementById('initial-screen');
        if (!initialScreen) return;
        // Initial screen is already visible by default, no need to fade it in
        initialScreen.style.display = 'flex';
        initialScreen.style.opacity = '1';
    }

    private static showInitialScreenAndFade(): void {
        const initialScreen = document.getElementById('initial-screen');
        if (!initialScreen) return;

        // Initial screen is already visible, just ensure it's displayed
        initialScreen.style.display = 'flex';
        initialScreen.style.opacity = '1';

        // Fade out after 1 second
        const timeout = setTimeout(() => {
            initialScreen.style.opacity = '0';
            setTimeout(() => {
                initialScreen.style.display = 'none';
            }, 300); // Wait for fade transition
        }, 1000);

        this.animationTimeouts.push(timeout);
    }

    // -----------------------------
    // Full sequence (first visit only)
    // -----------------------------
    private static startFullSequence(): void {
        if (!this.isInitialized) return;

        // First pixelation: cover initial screen
        this.firstPixelation(() => {
            if (!this.isInitialized) return;

            // Hide initial screen, show loading screen
            const initialScreen = document.getElementById('initial-screen');
            const loadingScreen = document.getElementById('loading-screen');

            if (initialScreen) initialScreen.style.display = 'none';
            if (loadingScreen) {
                loadingScreen.style.display = 'flex';
                loadingScreen.style.opacity = '1';
            }

            // Second pixelation: uncover to reveal loading screen
            this.secondPixelation(() => {
                if (!this.isInitialized) return;

                // Wait 2 seconds then do final fade out
                const timeout = setTimeout(() => {
                    if (this.isInitialized) {
                        this.finalFadeOut();
                    }
                }, 2000);

                this.animationTimeouts.push(timeout);
            });
        });
    }

    private static firstPixelation(callback: () => void): void {
        const pixelTransition = document.getElementById('pixel-transition');
        if (!pixelTransition) return;

        pixelTransition.style.display = 'grid';
        this.createPixelGrid(pixelTransition);
        const pixels = Array.from(pixelTransition.children) as HTMLElement[];

        this.animatePixelsToBlack(pixels, callback);
    }

    private static secondPixelation(callback: () => void): void {
        const pixelTransition = document.getElementById('pixel-transition');
        if (!pixelTransition) return;

        const pixels = Array.from(pixelTransition.children) as HTMLElement[];
        this.animatePixelsToTransparent(pixels, () => {
            if (!this.isInitialized) return;
            pixelTransition.style.display = 'none';
            callback();
        });
    }

    private static finalFadeOut(): void {
        const pixelTransition = document.getElementById('pixel-transition');
        const loadingScreen = document.getElementById('loading-screen');

        if (!pixelTransition) return;

        // Create pixel grid and cover everything
        pixelTransition.style.display = 'grid';
        this.createPixelGrid(pixelTransition);
        const pixels = Array.from(pixelTransition.children) as HTMLElement[];

        this.animatePixelsToBlack(pixels, () => {
            if (!this.isInitialized) return;

            // Hide everything
            const timeout = setTimeout(() => {
                if (!this.isInitialized) return;

                if (loadingScreen) loadingScreen.style.display = 'none';
                pixelTransition.style.display = 'none';

                // Mark as played so subsequent visits just show initial screen
                this.markPlayed();
            }, 100);

            this.animationTimeouts.push(timeout);
        });
    }

    // -----------------------------
    // Pixel helpers
    // -----------------------------
    private static createPixelGrid(container: HTMLElement): void {
        container.innerHTML = '';
        const gridSize = 50;
        const totalPixels = gridSize * gridSize;

        container.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        container.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

        for (let i = 0; i < totalPixels; i++) {
            const pixel = document.createElement('div');
            pixel.classList.add('pixel');
            container.appendChild(pixel);
        }
    }

    private static animatePixelsToBlack(pixels: HTMLElement[], callback?: () => void): void {
        const totalPixels = pixels.length;
        const maxDelay = 800;
        let completedCount = 0;

        pixels.forEach((pixel) => {
            const delay = Math.random() * maxDelay;
            const timeout = setTimeout(() => {
                if (!this.isInitialized) return;
                pixel.classList.add('black');
                completedCount++;
                if (completedCount === totalPixels && callback) callback();
            }, delay);

            this.animationTimeouts.push(timeout);
        });
    }

    private static animatePixelsToTransparent(pixels: HTMLElement[], callback?: () => void): void {
        const totalPixels = pixels.length;
        const maxDelay = 800;
        let completedCount = 0;

        pixels.forEach((pixel) => {
            const delay = Math.random() * maxDelay;
            const timeout = setTimeout(() => {
                if (!this.isInitialized) return;
                pixel.classList.remove('black');
                completedCount++;
                if (completedCount === totalPixels && callback) callback();
            }, delay);

            this.animationTimeouts.push(timeout);
        });
    }
}
