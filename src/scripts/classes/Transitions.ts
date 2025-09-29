import { toDash } from '@scripts/utils/string';
import Swup from 'swup';
import SwupHeadPlugin from '@swup/head-plugin';
import SwupPreloadPlugin from '@swup/preload-plugin';
import SwupScriptsPlugin from '@swup/scripts-plugin';
import { LoadingScreen } from '@scripts/classes/LoadingScreen';

type TransitionHooks = {
    onInit?: () => void;
    onDestroy?: () => void;
    onAfterReplace?: () => void;
    onAfterAnimate?: () => void;
};

export class Transitions {
    static readonly READY_CLASS = 'is-ready';
    static readonly TRANSITION_CLASS = 'is-transitioning';

    private swup: Swup | undefined;
    private hooks: TransitionHooks;

    constructor(hooks: TransitionHooks = {}) {
        this.hooks = hooks;
    }

    init() {
        this.initSwup();

        // Initialize loading screen immediately
        LoadingScreen.init();

        requestAnimationFrame(() => {
            this.hooks.onInit?.();
            document.documentElement.classList.add(Transitions.READY_CLASS);
        });
    }

    destroy() {
        this.swup?.destroy();
        LoadingScreen.cleanup();
    }

    private initSwup() {
        this.swup = new Swup({
            animateHistoryBrowsing: true,
            plugins: [
                new SwupHeadPlugin({ persistAssets: true, awaitAssets: true }),
                new SwupPreloadPlugin({
                    preloadHoveredLinks: true,
                    preloadInitialPage: !import.meta.env.DEV
                }),
                new SwupScriptsPlugin()
            ]
        });

        this.swup.hooks.on('visit:start', () => {
            document.documentElement.classList.add(Transitions.TRANSITION_CLASS);
            document.documentElement.classList.remove(Transitions.READY_CLASS);

            // Show initial screen immediately when navigation starts
            const initialScreen = document.getElementById('initial-screen');
            if (initialScreen) {
                initialScreen.style.display = 'flex';
                initialScreen.style.opacity = '1';
            }
        });

        this.swup.hooks.before('content:replace', () => {
            this.hooks.onDestroy?.();
            LoadingScreen.cleanup();
        });

        this.swup.hooks.before('content:replace', () => {
            this.hooks.onDestroy?.();
            LoadingScreen.cleanup();
        });

        this.swup.hooks.on('content:replace', (visit: any) => {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
            this.hooks.onAfterReplace?.();

            // Initialize loading screen for new page immediately
            LoadingScreen.init();

            this.updateDocumentAttributes(visit);
        });

        this.swup.hooks.on('animation:in:end', () => {
            document.documentElement.classList.remove(Transitions.TRANSITION_CLASS);
            document.documentElement.classList.add(Transitions.READY_CLASS);
            this.hooks.onAfterAnimate?.();
        });
    }

    private updateDocumentAttributes(visit: any) {
        if (visit.fragmentVisit) return;

        const parser = new DOMParser();
        const nextDOM = parser.parseFromString(visit.to.html, 'text/html');
        const newDataset = { ...nextDOM.querySelector('html')?.dataset };

        Object.entries(newDataset).forEach(([key, val]) => {
            document.documentElement.setAttribute(`data-${toDash(key)}`, val ?? '');
        });
    }
}
