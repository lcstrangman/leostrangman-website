interface GlitchableElement {
    element: HTMLElement;
    originalText: string;
    glitchInterval: NodeJS.Timeout | null;
    glitchTimeout: NodeJS.Timeout | null;
    mouseEnterHandler: () => void;
    mouseLeaveHandler: () => void;
}

export class GlitchEffects {
    private static isInitialized = false;
    private static glitchables: NodeListOf<HTMLElement> | null = null;
    private static activeGlitchIntervals = new Set<NodeJS.Timeout>();
    private static glitchableElements: GlitchableElement[] = [];

    static init(): void {
        // Clean up any existing effects
        this.cleanup();

        // Check if required elements exist
        if (!this.hasRequiredElements()) {
            return;
        }

        this.isInitialized = true;
        this.cacheElements();
        this.setupGlitchables();
    }

    static cleanup(): void {
        // Clear all active intervals
        this.activeGlitchIntervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.activeGlitchIntervals.clear();

        // Remove event listeners and clear timeouts
        this.glitchableElements.forEach(
            ({ element, glitchInterval, glitchTimeout, mouseEnterHandler, mouseLeaveHandler }) => {
                element.removeEventListener('mouseenter', mouseEnterHandler);
                element.removeEventListener('mouseleave', mouseLeaveHandler);

                if (glitchInterval) {
                    clearInterval(glitchInterval);
                }
                if (glitchTimeout) {
                    clearTimeout(glitchTimeout);
                }

                // Restore original text
                element.textContent = element.dataset.originalText || element.textContent;
            }
        );

        // Reset state
        this.glitchableElements = [];
        this.glitchables = null;
        this.isInitialized = false;
    }

    private static hasRequiredElements(): boolean {
        const glitchables = document.querySelectorAll('.glitchable');
        return glitchables.length > 0;
    }

    private static cacheElements(): void {
        this.glitchables = document.querySelectorAll('.glitchable');
    }

    private static setupGlitchables(): void {
        if (!this.glitchables) return;

        this.glitchables.forEach((el) => this.setupGlitchable(el));
    }

    private static setupGlitchable(el: HTMLElement): void {
        const originalText = el.textContent || '';

        // Store original text in dataset for restoration
        el.dataset.originalText = originalText;

        let glitchInterval: NodeJS.Timeout | null = null;
        let glitchTimeout: NodeJS.Timeout | null = null;

        const glitchText = (): void => {
            if (!this.isInitialized) return;

            if (glitchInterval) return; // Prevent stacking

            glitchInterval = setInterval(() => {
                if (!this.isInitialized) {
                    if (glitchInterval) {
                        clearInterval(glitchInterval);
                        this.activeGlitchIntervals.delete(glitchInterval);
                    }
                    return;
                }

                el.textContent = this.shuffleText(originalText);
            }, 50);

            this.activeGlitchIntervals.add(glitchInterval);

            glitchTimeout = setTimeout(() => {
                if (!this.isInitialized) return;

                if (glitchInterval) {
                    clearInterval(glitchInterval);
                    this.activeGlitchIntervals.delete(glitchInterval);
                    glitchInterval = null;
                }
                el.textContent = originalText;
            }, 250);
        };

        const stopGlitch = (): void => {
            if (glitchInterval) {
                clearInterval(glitchInterval);
                this.activeGlitchIntervals.delete(glitchInterval);
                glitchInterval = null;
            }
            if (glitchTimeout) {
                clearTimeout(glitchTimeout);
                glitchTimeout = null;
            }
            el.textContent = originalText;
        };

        // Create handlers that maintain proper context
        const mouseEnterHandler = () => glitchText();
        const mouseLeaveHandler = () => stopGlitch();

        // Add event listeners
        el.addEventListener('mouseenter', mouseEnterHandler);
        el.addEventListener('mouseleave', mouseLeaveHandler);

        // Store element data for cleanup
        this.glitchableElements.push({
            element: el,
            originalText,
            glitchInterval,
            glitchTimeout,
            mouseEnterHandler,
            mouseLeaveHandler
        });
    }

    private static shuffleText(text: string): string {
        const words = text.split(' ').map((word) => {
            const letters = word.replace(/[^a-zA-Z0-9[@#$%&*/\]+=©!-]/g, '');
            const punctuation = word.replace(/[a-zA-Z0-9[@#$%&*/\]+=©!-]/g, '');

            let shuffledLetters = letters.split('');

            // Fisher-Yates shuffle algorithm
            for (let i = shuffledLetters.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
            }

            return shuffledLetters.join('') + punctuation;
        });

        return words.join(' ');
    }

    /**
     * Manually trigger glitch effect on a specific element
     */
    static triggerGlitch(selector: string): void {
        if (!this.isInitialized) return;

        const element = document.querySelector(selector) as HTMLElement;
        if (!element) return;

        const originalText = element.dataset.originalText || element.textContent || '';
        let glitchCount = 0;
        const maxGlitches = 5;

        const glitchInterval = setInterval(() => {
            if (!this.isInitialized || glitchCount >= maxGlitches) {
                clearInterval(glitchInterval);
                element.textContent = originalText;
                return;
            }

            element.textContent = this.shuffleText(originalText);
            glitchCount++;
        }, 50);
    }

    /**
     * Get count of active glitch effects
     */
    static getActiveGlitchCount(): number {
        return this.activeGlitchIntervals.size;
    }

    /**
     * Stop all active glitch effects
     */
    static stopAllGlitches(): void {
        this.activeGlitchIntervals.forEach((interval) => {
            clearInterval(interval);
        });
        this.activeGlitchIntervals.clear();

        // Restore all original text
        this.glitchableElements.forEach(({ element }) => {
            element.textContent = element.dataset.originalText || element.textContent;
        });
    }
}
