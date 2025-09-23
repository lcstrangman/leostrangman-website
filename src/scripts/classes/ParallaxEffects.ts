export class ParallaxEffects {
    private static canvas: HTMLElement | null = null;
    private static hero: HTMLElement | null = null;
    private static heroContent: HTMLElement | null = null;
    private static heroContentAlt: HTMLElement | null = null;

    // Hero content elements
    private static name: HTMLElement | null = null;
    private static background: HTMLElement | null = null;
    private static logoBackground: HTMLElement | null = null;
    private static logoBackgroundInvisible: HTMLElement | null = null;
    private static roleBackground: HTMLElement | null = null;
    private static roleBackgroundInvisible: HTMLElement | null = null;
    private static role: HTMLElement | null = null;
    private static logo: HTMLElement | null = null;
    private static logoHover: HTMLElement | null = null;

    // Accessibility elements
    private static accessibilityBackground: HTMLElement | null = null;
    private static accessibilityButton: HTMLElement | null = null;

    // Optional external references (like MouseEffects)
    private static circle: HTMLElement | null = null;
    private static currentInput: 'mouse' | 'touch' | 'unknown' = 'unknown';
    private static isMouseInViewport = false;
    private static lastMouseMoveTime = 0;

    static init(): void {
        this.canvas = document.getElementById("parallax-canvas");
        this.hero = document.getElementById("parallax-hero");
        this.heroContent = document.getElementById("hero-content-primary");
        this.heroContentAlt = document.getElementById("hero-content-alt");

        this.name = document.getElementById("parallax-title-name");
        this.background = document.getElementById("parallax-name-background");
        this.logoBackground = document.getElementById("parallax-logo-background");
        this.logoBackgroundInvisible = document.querySelector('.title-logo-background-invisible');
        this.roleBackground = document.getElementById("parallax-role-background");
        this.roleBackgroundInvisible = document.querySelector('.title-role-background-invisible');
        this.role = document.getElementById("parallax-title-role");
        this.logo = document.getElementById("parallax-title-logo");
        this.logoHover = document.getElementById("parallax-logo-hover");

        this.accessibilityBackground = document.getElementById('accessibility-background');
        this.accessibilityButton = document.getElementById('parallax-accessibility');

        // Bind scroll listener
        window.addEventListener('scroll', this.handleScrollBound);
    }

    static cleanup(): void {
        // Remove scroll listener
        window.removeEventListener('scroll', this.handleScrollBound);

        // Reset transforms
        const allElements = [
            this.canvas, this.name, this.background, this.role, 
            this.roleBackground, this.logo, this.logoBackground, this.logoHover
        ];

        allElements.forEach(el => {
            if (el) el.style.transform = '';
        });

        this.canvas = null;
        this.hero = null;
        this.heroContent = null;
        this.heroContentAlt = null;
        this.name = null;
        this.background = null;
        this.logoBackground = null;
        this.logoBackgroundInvisible = null;
        this.roleBackground = null;
        this.roleBackgroundInvisible = null;
        this.role = null;
        this.logo = null;
        this.logoHover = null;
        this.accessibilityBackground = null;
        this.accessibilityButton = null;
    }

    // Bound scroll handler to keep proper `this` context
    private static handleScrollBound = (): void => this.handleScroll();

    private static handleScroll(): void {
        const scrollY = window.scrollY;

        if (this.canvas) this.canvas.style.transform = `translateY(${scrollY * 0.5}px)`;
        if (this.name) this.name.style.transform = `translateY(${scrollY * -0.27}px)`;
        if (this.background) this.background.style.transform = `translateY(${scrollY * -0.27}px)`;
        if (this.role) this.role.style.transform = `translateY(${scrollY * -0.15}px)`;
        if (this.roleBackground) this.roleBackground.style.transform = `translateY(${scrollY * -0.15}px)`;
        if (this.roleBackgroundInvisible) this.roleBackgroundInvisible.style.transform = `translateY(${scrollY * -0.15}px)`;
        if (this.logo) this.logo.style.transform = `translateY(${scrollY * -0.2}px)`;
        if (this.logoBackground) this.logoBackground.style.transform = `translateY(${scrollY * -0.2}px)`;
        if (this.logoBackgroundInvisible) this.logoBackgroundInvisible.style.transform = `translateY(${scrollY * -0.2}px)`;
        if (this.logoHover) this.logoHover.style.transform = `translateY(${scrollY * -0.2}px)`;

        if (this.circle &&
            this.currentInput === 'mouse' &&
            this.isMouseInViewport &&
            Date.now() - this.lastMouseMoveTime < 2000
        ) {
            this.circle.style.opacity = '1';
        }
    }

    // Optional: allow external modules (like MouseEffects) to provide circle reference and input state
    static setMouseCircle(circleEl: HTMLElement, input: 'mouse' | 'touch', isInViewport: boolean, lastMoveTime: number): void {
        this.circle = circleEl;
        this.currentInput = input;
        this.isMouseInViewport = isInViewport;
        this.lastMouseMoveTime = lastMoveTime;
    }
}
