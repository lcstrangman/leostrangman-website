export class HoverEffects {
    // Hero content elements
    private static name: HTMLElement | null = null;
    private static nameBackground: HTMLElement | null = null;
    private static iconBackground: HTMLElement | null = null;
    private static iconBackgroundInvisible: HTMLElement | null = null;
    private static mainSVG: HTMLElement | null = null;
    private static secondarySVG: HTMLElement | null = null;
    private static role: HTMLElement | null = null;
    private static roleBackground: HTMLElement | null = null;
    private static roleBackgroundInvisible: HTMLElement | null = null;
    private static hoverTargets: HTMLElement[] = [];
    private static hoverEnabled = false;
    private static selectionListenerActive = false;

    static init(): void {
        this.name = document.getElementById('name-text');
        this.nameBackground = document.getElementById('name-background');
        this.mainSVG = document.getElementById('main-svg');
        this.secondarySVG = document.getElementById('secondary-svg');
        this.iconBackground = document.getElementById('icon-background');
        this.iconBackgroundInvisible = document.getElementById('icon-background-invisible');
        this.role = document.getElementById('role-text');
        this.roleBackground = document.getElementById('role-background');
        this.roleBackgroundInvisible = document.getElementById('role-background-invisible');

        this.hoverTargets = [
            this.name,
            this.iconBackgroundInvisible,
            this.mainSVG,
            this.secondarySVG,
            this.role,
            this.roleBackgroundInvisible
        ].filter(Boolean) as HTMLElement[];

        // Add selection change listener
        document.addEventListener('selectionchange', this.handleSelectionChangeBound);
        this.selectionListenerActive = true;

        // Combined media query: hover capability AND minimum screen width
        const mediaQuery = window.matchMedia('(hover: hover) and (min-width: 721px)');
        mediaQuery.addEventListener('change', this.handleMediaChangeBound);
        this.handleMediaChange(mediaQuery);
    }

    static cleanup(): void {
        // Remove hover listeners
        this.disableHoverEffects();

        // Remove selection listener
        if (this.selectionListenerActive) {
            document.removeEventListener('selectionchange', this.handleSelectionChangeBound);
            this.selectionListenerActive = false;
        }

        // Remove media query listener
        const mediaQuery = window.matchMedia('(hover: hover) and (min-width: 721px)');
        mediaQuery.removeEventListener('change', this.handleMediaChangeBound);

        // Reset elements
        this.name = null;
        this.nameBackground = null;
        this.mainSVG = null;
        this.secondarySVG = null;
        this.iconBackground = null;
        this.iconBackgroundInvisible = null;
        this.role = null;
        this.roleBackground = null;
        this.roleBackgroundInvisible = null;

        this.hoverTargets = [];
        this.hoverEnabled = false;
    }

    private static enableHoverEffects(): void {
        if (this.hoverEnabled || !this.hoverTargets.length) return;

        this.hoverTargets.forEach((target) => {
            target.addEventListener('mouseenter', this.handleMouseEnterBound);
            target.addEventListener('mouseleave', this.handleMouseLeaveBound);
        });
        this.hoverEnabled = true;
    }

    private static disableHoverEffects(): void {
        if (!this.hoverEnabled || !this.hoverTargets.length) return;

        this.hoverTargets.forEach((target) => {
            target.removeEventListener('mouseenter', this.handleMouseEnterBound);
            target.removeEventListener('mouseleave', this.handleMouseLeaveBound);
        });
        this.hoverEnabled = false;
    }

    private static handleMouseEnter = (): void => {
        if (this.name) {
            const width = this.name.offsetWidth;
            this.name.style.maxWidth = `${width}px`;
            this.name.style.minWidth = `${width}px`;
        }
        this.name?.classList.add('hovered-version');
        this.nameBackground?.classList.add('hovered-version');
        this.mainSVG?.classList.add('removed');
        this.secondarySVG?.classList.remove('removed');
        this.iconBackground?.classList.add('hovered-version');
        this.role?.classList.add('hovered-version');
        this.roleBackground?.classList.add('hovered-version');
    };

    private static handleMouseLeave = (): void => {
        if (this.name) {
            this.name.style.maxWidth = '';
            this.name.style.minWidth = '';
        }
        this.name?.classList.remove('hovered-version');
        this.nameBackground?.classList.remove('hovered-version');
        this.mainSVG?.classList.remove('removed');
        this.secondarySVG?.classList.add('removed');
        this.iconBackground?.classList.remove('hovered-version');
        this.role?.classList.remove('hovered-version');
        this.roleBackground?.classList.remove('hovered-version');
    };

    private static handleSelectionChange = (): void => {
        const selection = window.getSelection();

        if (!selection || !this.name) return;

        // Check if there's a selection and if it's within the name element
        const hasSelection = selection.toString().length > 0;
        const isWithinName = selection.anchorNode && this.name.contains(selection.anchorNode);

        if (hasSelection && isWithinName) {
            // Add no-blend class during selection
            this.name.classList.add('no-blend');
        } else {
            // Remove no-blend class when selection is cleared
            this.name.classList.remove('no-blend');
        }
    };

    private static handleMediaChange = (e: MediaQueryListEvent | MediaQueryList): void => {
        if (e.matches) {
            this.enableHoverEffects();
        } else {
            this.disableHoverEffects();
        }
    };

    // Bound versions of functions for add/removeEventListener
    private static handleMouseEnterBound = (): void => this.handleMouseEnter();
    private static handleMouseLeaveBound = (): void => this.handleMouseLeave();
    private static handleMediaChangeBound = (e: MediaQueryListEvent | MediaQueryList) =>
        this.handleMediaChange(e);
    private static handleSelectionChangeBound = (): void => this.handleSelectionChange();
}
