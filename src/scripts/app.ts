import { Transitions } from '@scripts/classes/Transitions';
import { Scroll } from '@scripts/classes/Scroll';
import { Accessibility } from '@scripts/classes/Accessibility';
import { GlitchEffects } from '@scripts/classes/GlitchEffects';
import { ImagePixelation } from '@scripts/classes/ImageEffects';
import { InteractiveSections } from '@scripts/classes/InteractiveBox';
import { LineCanvas } from '@scripts/classes/LineCanvas';
import { MouseEffects } from '@scripts/classes/MouseEffects';
import { ParallaxCanvas } from '@scripts/classes/ParallaxCanvas';
import { ParallaxEffects } from '@scripts/classes/ParallaxEffects';
import { HoverEffects } from '@scripts/classes/HoverEffects';
import { ScrollAnimation } from '@scripts/classes/ScrollAnimation';
import GridHelper from '@locomotivemtl/grid-helper';
import tailwindConfig from '@root/tailwind.config';

let lineCanvasInstance: LineCanvas | null = null;

// Initialize the Transitions class with all feature integrations
const transitions = new Transitions({
    onInit: () => {
        // Initialize features on each page that has the required elements
        Accessibility.initWithStateRestore();
        GlitchEffects.init();
        ImagePixelation.init();
        InteractiveSections.init();
        MouseEffects.init();
        ParallaxCanvas.init();
        ParallaxEffects.init();
        HoverEffects.init();
        ScrollAnimation.init();
        // Initialize LineCanvas
        const wrapper = document.getElementById('lines-wrapper');
        if (wrapper) {
            lineCanvasInstance = LineCanvas.init(wrapper);
        }
    },
    onDestroy: () => {
        // Clean up all features before page transitions
        Accessibility.cleanup();
        GlitchEffects.cleanup();
        ImagePixelation.cleanup();
        InteractiveSections.cleanup();
        MouseEffects.cleanup();
        ParallaxCanvas.cleanup();
        ParallaxEffects.cleanup();
        HoverEffects.cleanup();
        ScrollAnimation.cleanup();
        // Cleanup LineCanvas
        if (lineCanvasInstance) {
            LineCanvas.cleanup(lineCanvasInstance);
            lineCanvasInstance = null;
        }
    },
    onAfterReplace: () => {
        // Initialize features after content replacement
        updateColorsFromPage();
        Accessibility.initWithStateRestore();
        requestAnimationFrame(() => {
            Accessibility.applyScrollSpeedToDOM();
        });
        GlitchEffects.init();
        ImagePixelation.init();
        InteractiveSections.init();
        MouseEffects.init();
        ParallaxCanvas.init();
        ParallaxEffects.init();
        HoverEffects.init();
        ScrollAnimation.init();
        // Re-initialize LineCanvas after page replace
        const wrapper = document.getElementById('lines-wrapper');
        if (wrapper) {
            lineCanvasInstance = LineCanvas.init(wrapper);
        }
    }
});

function updateColorsFromPage() {
    const swupContainer = document.getElementById('swup');
    if (!swupContainer) return;

    const style = swupContainer.dataset; // the dataset object contains all data-* attributes

    if (style.primaryColor) document.body.style.setProperty('--primary-color', style.primaryColor);
    if (style.primaryContrastColor)
        document.body.style.setProperty('--primary-contrast-color', style.primaryContrastColor);
    if (style.secondaryColor)
        document.body.style.setProperty('--secondary-color', style.secondaryColor);
    if (style.secondaryContrastColor)
        document.body.style.setProperty('--secondary-contrast-color', style.secondaryContrastColor);
    if (style.tertiaryColor)
        document.body.style.setProperty('--tertiary-color', style.tertiaryColor);
    if (style.tertiaryContrastColor)
        document.body.style.setProperty('--tertiary-contrast-color', style.tertiaryContrastColor);
    if (style.quaternaryColor)
        document.body.style.setProperty('--quaternary-color', style.quaternaryColor);
    if (style.quaternaryContrastColor)
        document.body.style.setProperty(
            '--quaternary-contrast-color',
            style.quaternaryContrastColor
        );
    if (style.pageTitle) document.body.style.setProperty('--page-title', style.pageTitle);
}

transitions.init();

// Initialize the Scroll class
Scroll.init();

// Initialize the Grid helper in development
if (import.meta.env.MODE === 'development') {
    new GridHelper({
        columns: 'var(--grid-columns)',
        gutterWidth: `var(--grid-gutter, ${tailwindConfig?.theme?.extend?.gap?.gutter})`,
        marginWidth: `var(--grid-margin, ${tailwindConfig?.theme?.extend?.spacing?.containerMargin})`
    });
}
