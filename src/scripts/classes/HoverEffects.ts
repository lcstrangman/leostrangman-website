export class HoverEffects {
    private static canvas: HTMLElement | null = null;
    private static hero: HTMLElement | null = null;
    private static heroContent: HTMLElement | null = null;
    private static heroContentAlt: HTMLElement | null = null;

    // Hero content elements
    private static name: HTMLElement | null = null;
    private static background: HTMLElement | null = null;
    private static logoBackground: HTMLElement | null = null;
    private static roleBackground: HTMLElement | null = null;
    private static logoRoleWrapper: HTMLElement | null = null;
    private static role: HTMLElement | null = null;
    private static logo: HTMLElement | null = null;
    private static logoHover: HTMLElement | null = null;

    // Accessibility elements
    private static accessibilityBackground: HTMLElement | null = null;
    private static accessibilityButton: HTMLElement | null = null;

    private static hoverTexts: NodeListOf<HTMLElement> | null = null;
    private static hoverTargets: HTMLElement[] = [];
    private static hoverEnabled = false;

    static init(): void {
        this.canvas = document.getElementById("parallax-canvas");
        this.hero = document.getElementById("parallax-hero");
        this.heroContent = document.getElementById("hero-content-primary");
        this.heroContentAlt = document.getElementById("hero-content-alt");

        this.name = document.getElementById("parallax-title-name");
        this.background = document.getElementById("parallax-name-background");
        this.logoBackground = document.getElementById("parallax-logo-background");
        this.roleBackground = document.getElementById("parallax-role-background");
        this.logoRoleWrapper = document.getElementById('logo-role-wrapper');
        this.role = document.getElementById("parallax-title-role");
        this.logo = document.getElementById("parallax-title-logo");
        this.logoHover = document.getElementById("parallax-logo-hover");

        this.accessibilityBackground = document.getElementById('accessibility-background');
        this.accessibilityButton = document.getElementById('parallax-accessibility');

        this.hoverTexts = document.querySelectorAll('.hover-text');
        this.hoverTargets = [this.name, this.logoRoleWrapper].filter(Boolean) as HTMLElement[];

        // Media query to enable/disable hover effects on non-hover devices
        const mediaQuery = window.matchMedia('(hover: hover)');
        mediaQuery.addEventListener('change', this.handleMediaChangeBound);
        this.handleMediaChange(mediaQuery);

        // Selection change listener for visual tweaks
        document.addEventListener('selectionchange', this.handleSelectionChangeBound);
    }

    static cleanup(): void {
        // Remove hover listeners
        this.disableHoverEffects();

        // Remove media query listener
        const mediaQuery = window.matchMedia('(hover: hover)');
        mediaQuery.removeEventListener('change', this.handleMediaChangeBound);

        // Remove selection listener
        document.removeEventListener('selectionchange', this.handleSelectionChangeBound);

        // Reset elements
        this.canvas = null;
        this.hero = null;
        this.heroContent = null;
        this.heroContentAlt = null;
        this.name = null;
        this.background = null;
        this.logoBackground = null;
        this.roleBackground = null;
        this.logoRoleWrapper = null;
        this.role = null;
        this.logo = null;
        this.logoHover = null;
        this.accessibilityBackground = null;
        this.accessibilityButton = null;
        this.hoverTexts = null;
        this.hoverTargets = [];
        this.hoverEnabled = false;
    }

    private static enableHoverEffects(): void {
        if (this.hoverEnabled || !this.hoverTargets.length) return;

        this.hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', this.handleMouseEnterBound);
            target.addEventListener('mouseleave', this.handleMouseLeaveBound);
        });
        this.hoverEnabled = true;
    }

    private static disableHoverEffects(): void {
        if (!this.hoverEnabled || !this.hoverTargets.length) return;

        this.hoverTargets.forEach(target => {
            target.removeEventListener('mouseenter', this.handleMouseEnterBound);
            target.removeEventListener('mouseleave', this.handleMouseLeaveBound);
        });
        this.hoverEnabled = false;
    }

    private static handleMouseEnter = (): void => {
        if (!this.background) return;

        this.background.classList.add('hovered-bg');
        this.roleBackground?.classList.add('hovered-bg');
        this.logoBackground?.classList.add('hovered-bg');
        this.name?.classList.remove('title-name-color');
        this.name?.classList.add('title-name-color-hover');
        this.role?.classList.add('role-color-hover');
        this.logoRoleWrapper?.classList.add('logo-role-wrapper-hover');
        this.logoHover?.classList.remove('display-none');
        this.logoHover?.classList.add('display');
    };

    private static handleMouseLeave = (): void => {
        if (!this.background) return;

        this.background.classList.remove('hovered-bg');
        this.roleBackground?.classList.remove('hovered-bg');
        this.logoBackground?.classList.remove('hovered-bg');
        this.name?.classList.add('title-name-color');
        this.name?.classList.remove('title-name-color-hover');
        this.role?.classList.remove('role-color-hover');
        this.logoRoleWrapper?.classList.remove('logo-role-wrapper-hover');
        this.logo?.setAttribute("name", "icon-amber-supply");
        this.logoHover?.classList.remove('display');
        this.logoHover?.classList.add('display-none');
    };

    private static handleMediaChange = (e: MediaQueryListEvent | MediaQueryList): void => {
        if (e.matches) {
            this.enableHoverEffects();
        } else {
            this.disableHoverEffects();
        }
    };

    private static handleSelectionChange = (): void => {
        if (!this.name) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || !selection.rangeCount) {
            this.name.style.mixBlendMode = 'exclusion';
            return;
        }

        const range = selection.getRangeAt(0);

        try {
            if (range.intersectsNode(this.name)) {
                this.name.style.mixBlendMode = 'normal';
            } else {
                this.name.style.mixBlendMode = 'exclusion';
            }
        } catch {
            this.name.style.mixBlendMode = 'exclusion';
        }
    };

    // Bound versions of functions for add/removeEventListener
    private static handleMouseEnterBound = (): void => this.handleMouseEnter();
    private static handleMouseLeaveBound = (): void => this.handleMouseLeave();
    private static handleMediaChangeBound = (e: MediaQueryListEvent | MediaQueryList) => this.handleMediaChange(e);
    private static handleSelectionChangeBound = (): void => this.handleSelectionChange();
}
