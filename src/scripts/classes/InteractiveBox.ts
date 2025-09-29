interface InteractiveInstance {
    section: HTMLElement;
    container: HTMLElement;
    previewImage: HTMLElement;
    bulletBoxes: HTMLElement[];
    prefix: string;
    eventHandlers: Map<
        HTMLElement,
        {
            mouseenter: (event: MouseEvent) => void;
            mouseleave: (event: MouseEvent) => void;
            click: (event: MouseEvent) => void;
            keydown: (event: KeyboardEvent) => void;
        }
    >;
}

export class InteractiveSections {
    private static isInitialized = false;
    private static interactiveInstances: InteractiveInstance[] = [];

    static init(): void {
        // Clean up any existing instances
        this.cleanup();

        // Check if required elements exist
        if (!this.hasRequiredElements()) {
            return;
        }

        this.isInitialized = true;
        this.setupInteractiveSections();
    }

    static cleanup(): void {
        // Remove all event listeners
        this.interactiveInstances.forEach((instance) => {
            instance.bulletBoxes.forEach((box) => {
                const handlers = instance.eventHandlers.get(box);
                if (handlers) {
                    box.removeEventListener('mouseenter', handlers.mouseenter);
                    box.removeEventListener('mouseleave', handlers.mouseleave);
                    box.removeEventListener('click', handlers.click);
                    box.removeEventListener('keydown', handlers.keydown);
                }
            });

            // Clear event handlers map
            instance.eventHandlers.clear();

            // Reset preview image state
            instance.previewImage.style.opacity = '0';
            instance.previewImage.classList.remove('active');
            instance.previewImage.style.backgroundImage = '';
        });

        // Reset state
        this.interactiveInstances = [];
        this.isInitialized = false;
    }

    private static hasRequiredElements(): boolean {
        const interactiveSections = document.querySelectorAll('.interactive-section');
        return interactiveSections.length > 0;
    }

    private static setupInteractiveSections(): void {
        document.querySelectorAll('.interactive-section').forEach((section) => {
            this.setupInteractiveSection(section as HTMLElement);
        });
    }

    private static setupInteractiveSection(section: HTMLElement): void {
        const container = section.querySelector('.boxes-container') as HTMLElement;
        const previewImage = section.querySelector('.preview-image') as HTMLElement;
        const prefix = '/assets/images' + (container?.getAttribute('data-prefix') || '');
        const bulletBoxes = Array.from(
            container?.querySelectorAll('.bullet-box') || []
        ) as HTMLElement[];

        if (!container || !previewImage || bulletBoxes.length === 0) return;

        const eventHandlers = new Map<
            HTMLElement,
            {
                mouseenter: (event: MouseEvent) => void;
                mouseleave: (event: MouseEvent) => void;
                click: (event: MouseEvent) => void;
                keydown: (event: KeyboardEvent) => void;
            }
        >();

        bulletBoxes.forEach((box) => {
            const imageName = box.getAttribute('data-image');
            if (!imageName) return;

            const imageSrc = `${prefix}${imageName}.png`;

            // Make it focusable and accessible
            if (!box.hasAttribute('tabindex')) {
                box.setAttribute('tabindex', '0');
            }
            if (!box.hasAttribute('role')) {
                box.setAttribute('role', 'button');
            }

            // Create event handlers with proper context
            const mouseenterHandler = (event: MouseEvent): void => {
                if (!this.isInitialized) return;

                previewImage.style.backgroundImage = `url(${imageSrc})`;
                previewImage.style.opacity = '1';
                previewImage.classList.add('active');
            };

            const mouseleaveHandler = (event: MouseEvent): void => {
                if (!this.isInitialized) return;

                previewImage.style.opacity = '0';
                previewImage.classList.remove('active');
            };

            const clickHandler = (event: MouseEvent): void => {
                if (!this.isInitialized) return;

                // Remove highlight and image from ALL containers
                this.clearAllActiveStates();

                // Activate only the current box and image
                box.classList.add('is-active');
                previewImage.style.backgroundImage = `url(${imageSrc})`;
                previewImage.style.opacity = '1';
                previewImage.classList.add('active');
            };

            const keydownHandler = (event: KeyboardEvent): void => {
                if (!this.isInitialized) return;

                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    clickHandler(event as any);
                }
            };

            // Store handlers for cleanup
            eventHandlers.set(box, {
                mouseenter: mouseenterHandler,
                mouseleave: mouseleaveHandler,
                click: clickHandler,
                keydown: keydownHandler
            });

            // Add event listeners
            box.addEventListener('mouseenter', mouseenterHandler);
            box.addEventListener('mouseleave', mouseleaveHandler);
            box.addEventListener('click', clickHandler);
            box.addEventListener('keydown', keydownHandler);
        });

        // Store instance for cleanup
        this.interactiveInstances.push({
            section,
            container,
            previewImage,
            bulletBoxes,
            prefix,
            eventHandlers
        });
    }

    private static clearAllActiveStates(): void {
        // Remove highlight and image from ALL containers across the entire document
        document.querySelectorAll('.preview-image').forEach((img) => {
            const previewImg = img as HTMLElement;
            previewImg.style.opacity = '0';
            previewImg.classList.remove('active');
            previewImg.style.backgroundImage = '';
        });

        document.querySelectorAll('.bullet-box').forEach((box) => {
            box.classList.remove('is-active');
        });
    }

    /**
     * Manually activate a specific bullet box by data-image value
     */
    static activateBulletBox(sectionSelector: string, imageName: string): void {
        if (!this.isInitialized) return;

        const section = document.querySelector(sectionSelector) as HTMLElement;
        if (!section) return;

        const instance = this.interactiveInstances.find((inst) => inst.section === section);
        if (!instance) return;

        const targetBox = instance.bulletBoxes.find(
            (box) => box.getAttribute('data-image') === imageName
        );

        if (!targetBox) return;

        // Trigger the click handler
        const handlers = instance.eventHandlers.get(targetBox);
        if (handlers) {
            handlers.click(new MouseEvent('click'));
        }
    }

    /**
     * Get all active bullet boxes across all sections
     */
    static getActiveBulletBoxes(): { section: HTMLElement; imageName: string; box: HTMLElement }[] {
        if (!this.isInitialized) return [];

        const activeBoxes: { section: HTMLElement; imageName: string; box: HTMLElement }[] = [];

        this.interactiveInstances.forEach((instance) => {
            instance.bulletBoxes.forEach((box) => {
                if (box.classList.contains('is-active')) {
                    const imageName = box.getAttribute('data-image');
                    if (imageName) {
                        activeBoxes.push({
                            section: instance.section,
                            imageName,
                            box
                        });
                    }
                }
            });
        });

        return activeBoxes;
    }

    /**
     * Get preview image source for a specific bullet box
     */
    static getPreviewImageSrc(sectionSelector: string, imageName: string): string | null {
        if (!this.isInitialized) return null;

        const section = document.querySelector(sectionSelector) as HTMLElement;
        if (!section) return null;

        const instance = this.interactiveInstances.find((inst) => inst.section === section);
        if (!instance) return null;

        return `${instance.prefix}${imageName}.png`;
    }

    /**
     * Set hover state programmatically
     */
    static setHoverState(sectionSelector: string, imageName: string, isHovered: boolean): void {
        if (!this.isInitialized) return;

        const section = document.querySelector(sectionSelector) as HTMLElement;
        if (!section) return;

        const instance = this.interactiveInstances.find((inst) => inst.section === section);
        if (!instance) return;

        const targetBox = instance.bulletBoxes.find(
            (box) => box.getAttribute('data-image') === imageName
        );

        if (!targetBox) return;

        const handlers = instance.eventHandlers.get(targetBox);
        if (!handlers) return;

        if (isHovered) {
            handlers.mouseenter(new MouseEvent('mouseenter'));
        } else {
            handlers.mouseleave(new MouseEvent('mouseleave'));
        }
    }

    /**
     * Get count of interactive sections
     */
    static getInteractiveSectionCount(): number {
        return this.interactiveInstances.length;
    }

    /**
     * Get all bullet boxes for a specific section
     */
    static getBulletBoxes(sectionSelector: string): HTMLElement[] {
        if (!this.isInitialized) return [];

        const section = document.querySelector(sectionSelector) as HTMLElement;
        if (!section) return [];

        const instance = this.interactiveInstances.find((inst) => inst.section === section);
        return instance ? instance.bulletBoxes : [];
    }
}
