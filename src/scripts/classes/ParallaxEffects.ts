export class ParallaxEffects {
    private static canvas: HTMLElement | null = null;

    // Hero content elements
    private static name: HTMLElement | null = null;
    private static role: HTMLElement | null = null;

    private static nameBackground: HTMLElement | null = null;
    private static nameText: HTMLElement | null = null;
    private static iconBackground: HTMLElement | null = null;
    private static iconBackgroundInvisible: HTMLElement | null = null;
    private static mainSVG: HTMLElement | null = null;
    private static secondarySVG: HTMLElement | null = null;
    private static roleBackground: HTMLElement | null = null;
    private static roleBackgroundInvisible: HTMLElement | null = null;
    private static roleText: HTMLElement | null = null;

    // Optional external references (like MouseEffects)
    private static circle: HTMLElement | null = null;
    private static currentInput: 'mouse' | 'touch' | 'unknown' = 'unknown';
    private static isMouseInViewport = false;
    private static lastMouseMoveTime = 0;

    static init(): void {
        this.canvas = document.getElementById('parallax-canvas');

        this.name = document.getElementById('name-container');
        this.role = document.getElementById('role-container');

        this.nameBackground = document.getElementById('name-background');
        this.nameText = document.getElementById('name-text');
        this.iconBackground = document.getElementById('icon-background');
        this.iconBackgroundInvisible = document.getElementById('icon-background-invisible');
        this.mainSVG = document.getElementById('main-svg');
        this.secondarySVG = document.getElementById('secondary-svg');
        this.roleBackground = document.getElementById('role-background');
        this.roleBackgroundInvisible = document.getElementById('role-background-invisible');
        this.roleText = document.getElementById('role-text');

        // Bind scroll listener
        window.addEventListener('scroll', this.handleScrollBound);
    }

    static cleanup(): void {
        // Remove scroll listener
        window.removeEventListener('scroll', this.handleScrollBound);

        // Reset transforms
        const allElements = [this.canvas, this.name, this.role];

        allElements.forEach((el) => {
            if (el) el.style.transform = '';
        });

        this.canvas = null;
        this.name = null;
        this.role = null;
        this.nameBackground = null;
        this.nameText = null;
        this.iconBackground = null;
        this.iconBackgroundInvisible = null;
        this.mainSVG = null;
        this.secondarySVG = null;
        this.roleBackground = null;
        this.roleBackgroundInvisible = null;
        this.roleText = null;
    }

    // Bound scroll handler to keep proper `this` context
    private static handleScrollBound = (): void => this.handleScroll();

    private static handleScroll(): void {
        const scrollY = window.scrollY;

        //Skip parallax if you scroll past hero
        if (scrollY > window.innerHeight) {
            return;
        }

        // Apply parallax to non-blend elements
        if (this.canvas) this.canvas.style.transform = `translateY(${scrollY * 0.5}px)`;
        if (this.nameBackground)
            this.nameBackground.style.transform = `translateY(${scrollY * -0.27}px)`;
        if (this.nameText) this.nameText.style.transform = `translateY(${scrollY * -0.27}px)`;
        if (this.roleBackground)
            this.roleBackground.style.transform = `translateY(${scrollY * -0.15}px)`;
        if (this.roleBackgroundInvisible)
            this.roleBackgroundInvisible.style.transform = `translateY(${scrollY * -0.15}px)`;
        if (this.roleText) this.roleText.style.transform = `translateY(${scrollY * -0.15}px)`;
        if (this.iconBackground)
            this.iconBackground.style.transform = `translateY(${scrollY * -0.2}px)`;
        if (this.iconBackgroundInvisible)
            this.iconBackgroundInvisible.style.transform = `translateY(${scrollY * -0.2}px)`;
        if (this.mainSVG) this.mainSVG.style.transform = `translateY(${scrollY * -0.2}px)`;
        if (this.secondarySVG)
            this.secondarySVG.style.transform = `translateY(${scrollY * -0.2}px)`;

        if (
            this.circle &&
            this.currentInput === 'mouse' &&
            this.isMouseInViewport &&
            Date.now() - this.lastMouseMoveTime < 2000
        ) {
            this.circle.style.opacity = '1';
        }
    }

    // Optional: allow external modules (like MouseEffects) to provide circle reference and input state
    static setMouseCircle(
        circleEl: HTMLElement,
        input: 'mouse' | 'touch',
        isInViewport: boolean,
        lastMoveTime: number
    ): void {
        this.circle = circleEl;
        this.currentInput = input;
        this.isMouseInViewport = isInViewport;
        this.lastMouseMoveTime = lastMoveTime;
    }
}
