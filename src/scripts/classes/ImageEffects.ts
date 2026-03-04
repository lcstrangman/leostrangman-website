interface PixelationInstance {
    wrapper: HTMLElement;
    pixelCanvas: HTMLCanvasElement;
    pixelContext: CanvasRenderingContext2D;
    image: HTMLImageElement;
    observer: IntersectionObserver;
    currentStep: number;
    animating: boolean;
    hasAnimated: boolean;
    imageLoadHandler: () => void;
    imageErrorHandler: () => void;
    resizeObserver: ResizeObserver;
}

export class ImagePixelation {
    private static isInitialized = false;
    private static pixelationInstances: PixelationInstance[] = [];
    private static animationFrames = new Set<number>();
    private static initRetryTimeout: number | null = null;

    static init(): void {
        // Clear any pending retry
        if (this.initRetryTimeout) {
            clearTimeout(this.initRetryTimeout);
            this.initRetryTimeout = null;
        }

        // Clean up any existing instances
        this.cleanup();

        // Check if required elements exist
        if (!this.hasRequiredElements()) {
            // Retry after a short delay in case DOM is still loading
            this.initRetryTimeout = window.setTimeout(() => this.init(), 100);
            return;
        }

        this.isInitialized = true;
        this.setupImagePixelation();
    }

    static cleanup(): void {
        // Cancel all animation frames
        this.animationFrames.forEach((frameId) => {
            cancelAnimationFrame(frameId);
        });
        this.animationFrames.clear();

        // Cleanup all pixelation instances
        this.pixelationInstances.forEach((instance) => {
            // Disconnect observers
            instance.observer.disconnect();
            instance.resizeObserver.disconnect();

            // Remove event handlers
            instance.image.removeEventListener('load', instance.imageLoadHandler);
            instance.image.removeEventListener('error', instance.imageErrorHandler);

            // Clear canvas
            instance.pixelContext.clearRect(
                0,
                0,
                instance.pixelCanvas.width,
                instance.pixelCanvas.height
            );
        });

        // Reset state
        this.pixelationInstances = [];
        this.isInitialized = false;
    }

    private static hasRequiredElements(): boolean {
        const imageWrappers = document.querySelectorAll('.image-wrapper');
        return imageWrappers.length > 0;
    }

    private static setupImagePixelation(): void {
        document.querySelectorAll('.image-wrapper').forEach((wrapper) => {
            this.setupPixelationForWrapper(wrapper as HTMLElement);
        });
    }

    private static setupPixelationForWrapper(wrapper: HTMLElement): void {
        const pixelCanvas = wrapper.querySelector('.pixel-canvas') as HTMLCanvasElement;
        const pixelContext = pixelCanvas?.getContext('2d', { willReadFrequently: true });
        const image = wrapper.querySelector('.source-image img') as HTMLImageElement;

        if (!pixelCanvas || !pixelContext || !image) {
            console.warn('ImagePixelation: Missing required elements in wrapper', wrapper);
            return;
        }

        const startPixelSize = 120;
        const endPixelSize = 1;
        const numSteps = 5;
        const delay = 120;

        let currentStep = 0;
        let animating = false;
        let hasAnimated = false;
        let isImageLoaded = false;

        const drawPixelated = (size: number): void => {
            if (!this.isInitialized || !isImageLoaded) return;

            const naturalWidth = image.naturalWidth;
            const naturalHeight = image.naturalHeight;

            if (!naturalWidth || !naturalHeight) return;

            // Set canvas dimensions to match natural image size
            if (pixelCanvas.width !== naturalWidth || pixelCanvas.height !== naturalHeight) {
                pixelCanvas.width = naturalWidth;
                pixelCanvas.height = naturalHeight;
            }

            const w = naturalWidth;
            const h = naturalHeight;

            pixelContext.clearRect(0, 0, w, h);
            pixelContext.imageSmoothingEnabled = false;

            // Draw downscaled version
            pixelContext.drawImage(image, 0, 0, w / size, h / size);
            // Scale it back up
            pixelContext.drawImage(pixelCanvas, 0, 0, w / size, h / size, 0, 0, w, h);
        };

        const animateDepixelate = (): void => {
            if (!this.isInitialized || currentStep > numSteps) {
                animating = false;
                return;
            }

            const progress = currentStep / numSteps;
            const pixelSize = startPixelSize * (1 - progress) + endPixelSize * progress;

            drawPixelated(pixelSize);
            currentStep++;

            setTimeout(() => {
                const frameId = requestAnimationFrame(animateDepixelate);
                this.animationFrames.add(frameId);
            }, delay);
        };

        const startPixelation = (): void => {
            if (!this.isInitialized || animating || hasAnimated || !isImageLoaded) return;

            animating = true;
            hasAnimated = true;
            currentStep = 0;
            
            // Ensure we have the initial pixelated state
            drawPixelated(startPixelSize);

            // Start the animation
            const frameId = requestAnimationFrame(animateDepixelate);
            this.animationFrames.add(frameId);

            pixelCanvas.style.imageRendering = 'auto';
        };

        // Calculate appropriate threshold based on image height
        const calculateThreshold = (): number => {
            const naturalHeight = image.naturalHeight;
            if (!naturalHeight || !window.innerHeight) return 0.1;
            
            const ratio = Math.min(1, window.innerHeight / naturalHeight);
            return Math.max(0.1, ratio * 0.5);
        };

        // Create intersection observer with dynamic threshold
        let observer = new IntersectionObserver(
            (entries) => {
                if (!this.isInitialized) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting && isImageLoaded) {
                        startPixelation();
                    }
                });
            },
            { 
                threshold: 0.1,
                rootMargin: '50px'
            }
        );

        const isImageReady = (): boolean => {
            return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
        };

        const handleImageLoad = (): void => {
            if (!this.isInitialized) return;

            if (isImageReady()) {
                isImageLoaded = true;
                
                // Update observer with proper threshold now that we know image dimensions
                observer.disconnect();
                observer = new IntersectionObserver(
                    (entries) => {
                        if (!this.isInitialized) return;

                        entries.forEach((entry) => {
                            if (entry.isIntersecting && isImageLoaded) {
                                startPixelation();
                            }
                        });
                    },
                    { 
                        threshold: calculateThreshold(),
                        rootMargin: '50px'
                    }
                );
                observer.observe(pixelCanvas);

                // Draw initial pixelated state immediately
                drawPixelated(startPixelSize);

                // Force visibility check after a brief delay
                requestAnimationFrame(() => {
                    if (!this.isInitialized || hasAnimated) return;

                    const rect = pixelCanvas.getBoundingClientRect();
                    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
                    
                    // Check if any part of the image is visible
                    const isVisible = rect.top < viewportHeight && rect.bottom > 0;
                    
                    // Calculate how much is visible
                    const visibleTop = Math.max(rect.top, 0);
                    const visibleBottom = Math.min(rect.bottom, viewportHeight);
                    const visibleHeight = Math.max(0, visibleBottom - visibleTop);
                    const visibleRatio = visibleHeight / rect.height;

                    // Trigger if image is at least 10% visible or if it's in viewport at all
                    if (isVisible && (visibleRatio >= 0.1 || rect.top < viewportHeight)) {
                        startPixelation();
                    }
                });
            }
        };

        const handleImageError = (): void => {
            console.error('ImagePixelation: Failed to load image', image.src);
            isImageLoaded = false;
        };

        // Setup resize observer to handle responsive images
        const resizeObserver = new ResizeObserver(() => {
            if (isImageLoaded && !hasAnimated) {
                drawPixelated(startPixelSize);
            }
        });
        resizeObserver.observe(image);

        // Setup image loading with multiple fallbacks
        if (isImageReady()) {
            // Image already loaded
            handleImageLoad();
        } else {
            // Wait for image to load
            image.addEventListener('load', handleImageLoad);
            image.addEventListener('error', handleImageError);
            
            // Force check after delay in case load event already fired
            setTimeout(() => {
                if (isImageReady() && !isImageLoaded) {
                    handleImageLoad();
                }
            }, 100);
        }

        // Start observing
        observer.observe(pixelCanvas);

        // Store instance for cleanup
        this.pixelationInstances.push({
            wrapper,
            pixelCanvas,
            pixelContext,
            image,
            observer,
            currentStep,
            animating,
            hasAnimated,
            imageLoadHandler: handleImageLoad,
            imageErrorHandler: handleImageError,
            resizeObserver
        });
    }

    /**
     * Manually trigger pixelation for a specific wrapper
     */
    static triggerPixelation(selector: string): void {
        if (!this.isInitialized) return;

        const wrapper = document.querySelector(selector) as HTMLElement;
        if (!wrapper) return;

        const instance = this.pixelationInstances.find((inst) => inst.wrapper === wrapper);
        if (!instance) return;

        // Reset if already animated
        if (instance.hasAnimated) {
            instance.hasAnimated = false;
            instance.animating = false;
            instance.currentStep = 0;
        }

        // Trigger animation
        this.startPixelationForInstance(instance);
    }

    private static startPixelationForInstance(instance: PixelationInstance): void {
        if (!this.isInitialized || instance.animating || instance.hasAnimated) return;

        instance.animating = true;
        instance.hasAnimated = true;
        instance.currentStep = 0;

        const startPixelSize = 120;
        this.drawPixelatedForInstance(instance, startPixelSize);
        this.animateDepixelateForInstance(instance);
        instance.pixelCanvas.style.imageRendering = 'auto';
    }

    private static drawPixelatedForInstance(instance: PixelationInstance, size: number): void {
        if (!this.isInitialized) return;

        const { pixelCanvas, pixelContext, image } = instance;
        
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;

        if (!naturalWidth || !naturalHeight) return;

        pixelCanvas.width = naturalWidth;
        pixelCanvas.height = naturalHeight;
        const w = naturalWidth;
        const h = naturalHeight;

        pixelContext.clearRect(0, 0, w, h);
        pixelContext.imageSmoothingEnabled = false;

        pixelContext.drawImage(image, 0, 0, w / size, h / size);
        pixelContext.drawImage(pixelCanvas, 0, 0, w / size, h / size, 0, 0, w, h);
    }

    private static animateDepixelateForInstance(instance: PixelationInstance): void {
        const numSteps = 5;
        const startPixelSize = 120;
        const endPixelSize = 1;
        const delay = 120;

        if (!this.isInitialized || instance.currentStep > numSteps) {
            instance.animating = false;
            return;
        }

        const progress = instance.currentStep / numSteps;
        const pixelSize = startPixelSize * (1 - progress) + endPixelSize * progress;

        this.drawPixelatedForInstance(instance, pixelSize);
        instance.currentStep++;

        setTimeout(() => {
            const frameId = requestAnimationFrame(() => {
                this.animateDepixelateForInstance(instance);
            });
            this.animationFrames.add(frameId);
        }, delay);
    }

    /**
     * Get count of active pixelation animations
     */
    static getActiveAnimationCount(): number {
        return this.pixelationInstances.filter((instance) => instance.animating).length;
    }

    /**
     * Reset all pixelation effects to initial state
     */
    static resetAllPixelations(): void {
        if (!this.isInitialized) return;

        this.pixelationInstances.forEach((instance) => {
            instance.hasAnimated = false;
            instance.animating = false;
            instance.currentStep = 0;
            this.drawPixelatedForInstance(instance, 120);
        });
    }

    /**
     * Force trigger all visible pixelations (useful for debugging)
     */
    static triggerAllVisible(): void {
        if (!this.isInitialized) return;

        this.pixelationInstances.forEach((instance) => {
            const rect = instance.pixelCanvas.getBoundingClientRect();
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
            const isVisible = rect.top < viewportHeight && rect.bottom > 0;

            if (isVisible && !instance.hasAnimated) {
                this.startPixelationForInstance(instance);
            }
        });
    }
}
