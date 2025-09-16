import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GlassRender {
    frame: number;
}

export class ParallaxCanvas {
    private static canvas: HTMLCanvasElement | null = null;
    private static hero: HTMLElement | null = null;
    private static context: CanvasRenderingContext2D | null = null;
    private static spriteSheet: HTMLImageElement | null = null;
    private static columns = 0;
    private static frameCount = 0;
    private static heroAnimation: gsap.core.Tween | null = null;
    private static glassrender: GlassRender = { frame: 0 };

    static init(): void {
        this.canvas = document.getElementById('parallax-canvas') as HTMLCanvasElement;
        this.hero = document.getElementById('parallax-hero');

        if (!this.canvas || !this.hero) return;

        this.initializeCanvas();
        this.preloadFrames();
        this.startAnimation();
    }

    static cleanup(): void {
        // Kill existing GSAP animation
        if (this.heroAnimation) {
            this.heroAnimation.kill();
            this.heroAnimation = null;
        }

        // Clear canvas
        if (this.context && this.canvas) {
            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }

        // Reset static properties
        this.canvas = null;
        this.hero = null;
        this.context = null;
        this.spriteSheet = null;
        this.columns = 0;
        this.frameCount = 0;
        this.glassrender.frame = 0;

        // Kill all ScrollTriggers related to this canvas
        ScrollTrigger.getAll().forEach(st => st.kill());
    }

    private static initializeCanvas(): void {
        if (!this.canvas) return;

        this.context = this.canvas.getContext('2d');
        if (!this.context) return;

        this.canvas.width = 1920;
        this.canvas.height = 1080;

        // Setup sprite sheet
        this.spriteSheet = new Image();
        this.spriteSheet.src = '/assets/images/sprite_sheet_full.webp';
        this.spriteSheet.decoding = 'async';
        this.spriteSheet.loading = 'eager';

        this.columns = 5;
        this.frameCount = 60;
    }

    private static preloadFrames(): void {
        if (!this.canvas || !this.spriteSheet || !this.context) return;

        const bufferCtx = this.context;

        for (let i = 0; i < this.frameCount; i++) {
            const col = i % this.columns;
            const row = Math.floor(i / this.columns);
            const sx = col * this.canvas.width;
            const sy = row * this.canvas.height;

            // Draw sprite frame onto canvas buffer
            bufferCtx.drawImage(
                this.spriteSheet,
                sx,
                sy,
                this.canvas.width,
                this.canvas.height,
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
        }
    }

    private static startAnimation(): void {
        if (!this.canvas || !this.hero) return;

        // Kill previous animation if exists
        if (this.heroAnimation) {
            this.heroAnimation.kill();
        }

        this.glassrender.frame = 0;

        this.heroAnimation = gsap.to(this.glassrender, {
            frame: this.frameCount - 1,
            snap: 'frame',
            ease: 'none',
            scrollTrigger: {
                trigger: this.hero,
                start: 'top top',
                end: () => `${this.hero!.offsetHeight * 0.8}px`,
                scrub: 0,
                onRefresh: () => this.render(),
            },
            onUpdate: () => this.render(),
        });
    }

    private static render(): void {
        if (!this.context || !this.spriteSheet || !this.canvas) return;

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const frameIndex = this.glassrender.frame;
        const col = frameIndex % this.columns;
        const row = Math.floor(frameIndex / this.columns);
        const sx = col * this.canvas.width;
        const sy = row * this.canvas.height;

        this.context.drawImage(
            this.spriteSheet,
            sx,
            sy,
            this.canvas.width,
            this.canvas.height,
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }
}
