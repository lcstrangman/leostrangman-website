export class GlitchEffects {
    private static isInitialized = false;
    private static activeGlitchIntervals = new Map<HTMLElement, ReturnType<typeof setInterval>>();
    private static activeGlitchTimeouts = new Map<HTMLElement, ReturnType<typeof setTimeout>>();

    static init(): void {
        this.cleanup();

        // Store original text on every .glitchable element so it's always available
        document.querySelectorAll<HTMLElement>('.glitchable').forEach((el) => {
            if (!el.dataset.originalText) {
                el.dataset.originalText = el.textContent ?? '';
            }
        });

        document.addEventListener('mouseenter', this.handleMouseEnter, true);
        document.addEventListener('mouseleave', this.handleMouseLeave, true);

        this.isInitialized = true;
    }

    static cleanup(): void {
        document.removeEventListener('mouseenter', this.handleMouseEnter, true);
        document.removeEventListener('mouseleave', this.handleMouseLeave, true);

        // Clear any in-flight intervals/timeouts and restore text
        this.activeGlitchIntervals.forEach((interval, el) => {
            clearInterval(interval);
            el.textContent = el.dataset.originalText ?? el.textContent;
        });
        this.activeGlitchIntervals.clear();

        this.activeGlitchTimeouts.forEach((timeout) => clearTimeout(timeout));
        this.activeGlitchTimeouts.clear();

        this.isInitialized = false;
    }

    // Captured arrow functions so add/removeEventListener use the same reference
    private static handleMouseEnter = (e: Event): void => {
        if (!this.isInitialized) return;
        const el = (e.target as HTMLElement).closest<HTMLElement>('.glitchable');
        if (!el) return;
        this.startGlitch(el);
    };

    private static handleMouseLeave = (e: Event): void => {
        if (!this.isInitialized) return;
        const el = (e.target as HTMLElement).closest<HTMLElement>('.glitchable');
        if (!el) return;
        this.stopGlitch(el);
    };

    private static startGlitch(el: HTMLElement): void {
        // Already glitching — don't stack
        if (this.activeGlitchIntervals.has(el)) return;

        // Lazily stamp original text if it wasn't set during init (e.g. dynamically added element)
        if (!el.dataset.originalText) {
            el.dataset.originalText = el.textContent ?? '';
        }
        const originalText = el.dataset.originalText;

        const interval = setInterval(() => {
            if (!this.isInitialized) {
                this.stopGlitch(el);
                return;
            }
            el.textContent = this.shuffleText(originalText);
        }, 50);

        const timeout = setTimeout(() => {
            this.stopGlitch(el);
        }, 250);

        this.activeGlitchIntervals.set(el, interval);
        this.activeGlitchTimeouts.set(el, timeout);
    }

    private static stopGlitch(el: HTMLElement): void {
        const interval = this.activeGlitchIntervals.get(el);
        if (interval !== undefined) {
            clearInterval(interval);
            this.activeGlitchIntervals.delete(el);
        }

        const timeout = this.activeGlitchTimeouts.get(el);
        if (timeout !== undefined) {
            clearTimeout(timeout);
            this.activeGlitchTimeouts.delete(el);
        }

        el.textContent = el.dataset.originalText ?? el.textContent;
    }

    private static shuffleText(text: string): string {
        const words = text.split(' ').map((word) => {
            const letters = word.replace(/[^a-zA-Z0-9[@#$%&*/\]+=©!-]/g, '');
            const punctuation = word.replace(/[a-zA-Z0-9[@#$%&*/\]+=©!-]/g, '');

            const shuffled = letters.split('');
            for (let i = shuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
            }

            return shuffled.join('') + punctuation;
        });

        return words.join(' ');
    }

    // Public helpers kept for any external callers in app.ts
    static triggerGlitch(selector: string): void {
        if (!this.isInitialized) return;
        const el = document.querySelector<HTMLElement>(selector);
        if (!el) return;
        this.startGlitch(el);
    }

    static stopAllGlitches(): void {
        this.activeGlitchIntervals.forEach((_, el) => this.stopGlitch(el));
    }

    static getActiveGlitchCount(): number {
        return this.activeGlitchIntervals.size;
    }
}