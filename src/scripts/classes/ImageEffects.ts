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
}

export class ImagePixelation {
    private static isInitialized = false;
    private static pixelationInstances: PixelationInstance[] = [];
    private static animationFrames = new Set<number>();

    static init(): void {
        // Clean up any existing instances
        this.cleanup();

        // Check if required elements exist
        if (!this.hasRequiredElements()) {
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
            // Disconnect observer
            instance.observer.disconnect();

            // Remove image load handler
            instance.image.removeEventListener('load', instance.imageLoadHandler);

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
        const pixelContext = pixelCanvas?.getContext('2d');
        const image = wrapper.querySelector('.source-image img') as HTMLImageElement;

        if (!pixelCanvas || !pixelContext || !image) return;

        const startPixelSize = 70;
        const endPixelSize = 1;
        const numSteps = 5;
        const delay = 80;

        let threshold = 0.6;
        if (image.naturalHeight && window.innerHeight) {
            // If image is taller than viewport, set threshold lower so it always triggers
            const ratio = Math.min(1, window.innerHeight / image.naturalHeight);
            threshold = Math.max(0.1, ratio * 0.9); // 0.9 is a magic number
        }

        let currentStep = 0;
        let animating = false;
        let hasAnimated = false;

        const drawPixelated = (size: number): void => {
            if (!this.isInitialized) return;

            pixelCanvas.width = image.naturalWidth;
            pixelCanvas.height = image.naturalHeight;
            const w = pixelCanvas.width;
            const h = pixelCanvas.height;

            pixelContext.clearRect(0, 0, w, h);
            pixelContext.imageSmoothingEnabled = false;

            pixelContext.drawImage(image, 0, 0, w / size, h / size);
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

            const timeoutId = setTimeout(() => {
                const frameId = requestAnimationFrame(animateDepixelate);
                this.animationFrames.add(frameId);
            }, delay);
        };

        const startPixelation = (): void => {
            if (!this.isInitialized || animating || hasAnimated) return;

            animating = true;
            hasAnimated = true;
            currentStep = 0;
            drawPixelated(startPixelSize);

            const frameId = requestAnimationFrame(animateDepixelate);
            this.animationFrames.add(frameId);

            pixelCanvas.style.imageRendering = 'auto';
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (!this.isInitialized) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        startPixelation();
                    }
                });
            },
            { threshold }
        );

        const isImageReady = (): boolean => {
            return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
        };

        const handleImageLoad = (): void => {
            if (!this.isInitialized) return;

            if (isImageReady()) {
                drawPixelated(startPixelSize);

                // Fallback: If image is already 80%+ visible, depixelate immediately
                setTimeout(() => {
                    if (!this.isInitialized || hasAnimated) return;

                    const rect = pixelCanvas.getBoundingClientRect();
                    const visibleHeight = Math.max(
                        0,
                        Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
                    );
                    const visibleRatio = visibleHeight / rect.height;

                    if (visibleRatio >= 0.8) {
                        startPixelation();
                    }
                }, 0);
            }
        };

        // Setup image loading
        if (isImageReady()) {
            handleImageLoad();
        } else {
            image.addEventListener('load', handleImageLoad);
            if (image.complete) {
                setTimeout(handleImageLoad, 0);
            }
        }

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
            imageLoadHandler: handleImageLoad
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
        if (!instance || instance.hasAnimated) return;

        // Trigger the animation by simulating intersection
        const entries = [
            {
                isIntersecting: true,
                target: instance.pixelCanvas
            }
        ];

        // Manually call the intersection callback
        instance.observer.disconnect();
        instance.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !instance.hasAnimated) {
                    this.startPixelationForInstance(instance);
                }
            });
        });
        instance.observer.observe(instance.pixelCanvas);
    }

    private static startPixelationForInstance(instance: PixelationInstance): void {
        if (instance.animating || instance.hasAnimated) return;

        instance.animating = true;
        instance.hasAnimated = true;
        instance.currentStep = 0;

        this.drawPixelatedForInstance(instance, 70);
        this.animateDepixelateForInstance(instance);
        instance.pixelCanvas.style.imageRendering = 'auto';
    }

    private static drawPixelatedForInstance(instance: PixelationInstance, size: number): void {
        if (!this.isInitialized) return;

        const { pixelCanvas, pixelContext, image } = instance;

        pixelCanvas.width = image.naturalWidth;
        pixelCanvas.height = image.naturalHeight;
        const w = pixelCanvas.width;
        const h = pixelCanvas.height;

        pixelContext.clearRect(0, 0, w, h);
        pixelContext.imageSmoothingEnabled = false;

        pixelContext.drawImage(image, 0, 0, w / size, h / size);
        pixelContext.drawImage(pixelCanvas, 0, 0, w / size, h / size, 0, 0, w, h);
    }

    private static animateDepixelateForInstance(instance: PixelationInstance): void {
        if (!this.isInitialized || instance.currentStep > 5) {
            instance.animating = false;
            return;
        }

        const progress = instance.currentStep / 5;
        const pixelSize = 70 * (1 - progress) + 1 * progress;

        this.drawPixelatedForInstance(instance, pixelSize);
        instance.currentStep++;

        setTimeout(() => {
            const frameId = requestAnimationFrame(() => {
                this.animateDepixelateForInstance(instance);
            });
            this.animationFrames.add(frameId);
        }, 80);
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
            this.drawPixelatedForInstance(instance, 70);
        });
    }
}
