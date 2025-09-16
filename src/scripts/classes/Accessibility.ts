export class Accessibility {
    private static isInitialized = false;
    private static accessToggled = false;
    
    // DOM elements
    private static scrollTrack: HTMLElement | null = null;
    private static accessibilityBackground: HTMLElement | null = null;
    private static accessibilityButton: HTMLElement | null = null;
    private static heroContent: HTMLElement | null = null;
    private static heroContentAlt: HTMLElement | null = null;
    private static scroller: HTMLElement | null = null;

    static init(): void {
        // Clear any existing listeners
        this.cleanup();
        
        // Check if required elements exist
        if (!this.hasRequiredElements()) {
            return;
        }

        this.isInitialized = true;
        this.cacheElements();
        this.bindEventListeners();
    }

    static cleanup(): void {
        if (this.accessibilityButton && this.isInitialized) {
            this.accessibilityButton.removeEventListener('click', this.handleAccessibilityClick);
        }
        
        // Reset static properties
        this.scrollTrack = null;
        this.accessibilityBackground = null;
        this.accessibilityButton = null;
        this.heroContent = null;
        this.heroContentAlt = null;
        this.scroller = null;
        this.isInitialized = false;
        // Note: We don't reset accessToggled to maintain state across page transitions
    }

    private static hasRequiredElements(): boolean {
        const accessibilityButton = document.getElementById('parallax-accessibility');
        return !!accessibilityButton;
    }

    private static cacheElements(): void {
        // Find scroller element (you may need to adjust the selector based on your HTML structure)
        this.scroller = document.querySelector('.scroller') || document.querySelector('[data-scroll-container]');
        this.scrollTrack = this.scroller?.querySelector('.scroll-track') || null;
        
        this.accessibilityBackground = document.getElementById('accessibility-background');
        this.accessibilityButton = document.getElementById('parallax-accessibility');
        this.heroContent = document.getElementById('hero-content-primary');
        this.heroContentAlt = document.getElementById('hero-content-alt');
    }

    private static bindEventListeners(): void {
        if (this.accessibilityButton) {
            this.accessibilityButton.addEventListener('click', this.handleAccessibilityClick);
        }
    }

    private static handleAccessibilityClick = (): void => {
        if (!this.isInitialized) return;
        this.enableAccessibility();
    }

    private static enableAccessibility(): void {
        if (!this.isInitialized) return;

        // Toggle scroll animation speed
        if (this.scrollTrack) {
            if (this.accessToggled) {
                this.scrollTrack.style.animation = 'scroll 20s linear infinite';
            } else {
                this.scrollTrack.style.animation = 'scroll 60s linear infinite';
            }
        }
        
        // Toggle visibility states
        this.accessibilityBackground?.classList.toggle('hidden');
        this.heroContent?.classList.toggle('display-none');
        this.heroContentAlt?.classList.toggle('display');
        
        // Update toggle state
        this.accessToggled = !this.accessToggled;
        
        // Store accessibility state in sessionStorage for persistence across page transitions
        try {
            sessionStorage.setItem('accessibility-mode', this.accessToggled.toString());
        } catch (error) {
            console.warn('Unable to store accessibility state:', error);
        }
    }

    /**
     * Restore accessibility state from previous session
     */
    private static restoreAccessibilityState(): void {
        try {
            const savedState = sessionStorage.getItem('accessibility-mode');
            if (savedState === 'true' && !this.accessToggled) {
                // Restore the accessibility state without animation
                this.enableAccessibility();
            }
        } catch (error) {
            console.warn('Unable to restore accessibility state:', error);
        }
    }

    /**
     * Get current accessibility toggle state
     */
    static isAccessibilityEnabled(): boolean {
        return this.accessToggled;
    }

    /**
     * Programmatically set accessibility state
     */
    static setAccessibilityState(enabled: boolean): void {
        if (!this.isInitialized || this.accessToggled === enabled) return;
        
        this.enableAccessibility();
    }

    /**
     * Initialize and restore state - call this after elements are cached
     */
    static initWithStateRestore(): void {
        this.init();
        if (this.isInitialized) {
            this.restoreAccessibilityState();
        }
    }
}