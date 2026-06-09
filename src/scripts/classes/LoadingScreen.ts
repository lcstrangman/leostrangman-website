// LoadingScreen.ts
export class LoadingScreen {
    private static isInitialized = false;
    private static animationFrameIds = new Set<number>();
    private static timeouts: ReturnType<typeof setTimeout>[] = [];

    // ── Tuning knobs ──────────────────────────────────────────────────────────
    private static readonly FONT_SIZE_VH        = 0.05;
    private static readonly ROW_STAGGER_PX      = 12;   
    private static readonly SWEEP_SPEED_PX_S    = 1600; 
    private static readonly ERASE_SPEED_PX_S    = 2100; 
    private static readonly SPEED_VARIANCE      = 0.25; // MASSIVE INCREASE for jagged tearing
    
    // Dual-speed scramble tuning
    private static readonly FAST_SCRAMBLE_MS    = 16;   
    private static readonly SLOW_SCRAMBLE_MS    = 100;  
    private static readonly SCRAMBLE_BAND_CHARS = 3;    
    
    private static readonly REVEAL_HOLD_MS      = 500;
    private static readonly FADE_MS             = 380;
    // ─────────────────────────────────────────────────────────────────────────

    private static readonly GLITCH_CHARS =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*+=!-[]{}()<>/\\|^~';

    // ── Session ───────────────────────────────────────────────────────────────
    private static hasPlayed(): boolean {
        return sessionStorage.getItem('loadingPlayed') === 'true';
    }
    private static markPlayed(): void {
        sessionStorage.setItem('loadingPlayed', 'true');
    }

    // ── Public API ────────────────────────────────────────────────────────────
    static init(): void {
        this.cleanup();
        if (!this.hasRequiredElements()) return;

        if (this.hasPlayed()) {
            this.showInitialScreenAndFade();
            return;
        }

        this.isInitialized = true;
        this.showInitialScreen();
        this.addTimeout(() => {
            if (this.isInitialized) this.startFullSequence();
        }, 900);
    }

    static cleanup(): void {
        this.animationFrameIds.forEach(cancelAnimationFrame);
        this.animationFrameIds.clear();
        this.timeouts.forEach(clearTimeout);
        this.timeouts = [];
        this.isInitialized = false;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static hasRequiredElements(): boolean {
        return !!(
            document.getElementById('initial-screen') &&
            document.getElementById('loading-screen') &&
            document.getElementById('loading-canvas')
        );
    }

    private static addTimeout(fn: () => void, ms: number) {
        const id = setTimeout(fn, ms);
        this.timeouts.push(id);
        return id;
    }

    private static addFrame(fn: FrameRequestCallback): number {
        const id = requestAnimationFrame(fn);
        this.animationFrameIds.add(id);
        return id;
    }

    private static getColors() {
        const s = getComputedStyle(document.documentElement);
        return {
            bg: s.getPropertyValue('--loading-bg').trim() || '#192727',
            fg: s.getPropertyValue('--loading-fg').trim() || '#e4c787',
        };
    }

    private static randomChar(): string {
        return this.GLITCH_CHARS[Math.floor(Math.random() * this.GLITCH_CHARS.length)];
    }

    // ── Screen visibility ─────────────────────────────────────────────────────
    private static showInitialScreen(): void {
        const el = document.getElementById('initial-screen');
        if (!el) return;
        el.style.display = 'flex';
        el.style.opacity = '1';
    }

    private static showInitialScreenAndFade(): void {
        const el = document.getElementById('initial-screen');
        if (!el) return;
        el.style.display = 'flex';
        el.style.opacity = '1';
        this.addTimeout(() => {
            el.style.opacity = '0';
            this.addTimeout(() => { el.style.display = 'none'; }, 300);
        }, 900);
    }

    // ── Full first-visit sequence ─────────────────────────────────────────────
    private static startFullSequence(): void {
        if (!this.isInitialized) return;
        this.runBandSweep();
    }

    // ── Band sweep ────────────────────────────────────────────────────────────
    private static runBandSweep(): void {
        const canvas = document.getElementById('loading-canvas') as HTMLCanvasElement | null;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = window.innerWidth;
        const H = window.innerHeight;
        
        const dpr = window.devicePixelRatio || 1;
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width  = `${W}px`;
        canvas.style.height = `${H}px`;
        ctx.scale(dpr, dpr);
        canvas.style.pointerEvents = 'auto';

        const { bg, fg } = this.getColors();

        const loadingScreenEl = document.getElementById('loading-screen');
        if (loadingScreenEl) loadingScreenEl.style.backgroundColor = bg;

        const fontSize = Math.round(H * this.FONT_SIZE_VH);
        ctx.font = `${fontSize}px Nikkei`;
        ctx.textBaseline = 'top';

        const charW = Math.max(ctx.measureText('M').width * 0.9, fontSize * 0.45); 
        
        const rows = Math.ceil(H / fontSize);
        const cols = Math.ceil(W / charW) + 2;

        // Give both the write head AND the erase head completely independent, high-variance speeds
        const rowWriteSpeeds = Array.from({ length: rows }, () => {
            const v = (Math.random() * 2 - 1) * this.SPEED_VARIANCE;
            return this.SWEEP_SPEED_PX_S * (1 + v);
        });

        const rowEraseSpeeds = Array.from({ length: rows }, () => {
            const v = (Math.random() * 2 - 1) * this.SPEED_VARIANCE;
            return this.ERASE_SPEED_PX_S * (1 + v);
        });

        const shuffledOrder = Array.from({ length: rows }, (_, i) => i)
            .sort(() => Math.random() - 0.5);
        const rowLeadOffset = shuffledOrder.map((_, i) =>
            shuffledOrder.indexOf(i) * this.ROW_STAGGER_PX
        );

        const settled: string[][] = Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => this.randomChar())
        );

        const cellLastDraw: Float64Array = new Float64Array(rows * cols);
        const startTime = performance.now();

        for (let i = 0; i < cellLastDraw.length; i++) {
            cellLastDraw[i] = startTime - Math.random() * 1000;
        }

        let swapDone = false;
        let eraseStartTime: number | null = null;

        const tick = (now: number): void => {
            if (!this.isInitialized) return;

            const elapsed = (now - startTime) / 1000; 

            ctx.clearRect(0, 0, W, H);

            let allDone = true;
            const rowWriteX: number[] = new Array(rows);
            const rowEraseX: number[] = new Array(rows);

            for (let r = 0; r < rows; r++) {
                const wSpeed = rowWriteSpeeds[r];
                const eSpeed = rowEraseSpeeds[r];
                const lead  = rowLeadOffset[r];
                
                rowWriteX[r] = elapsed * wSpeed + lead - charW;
                
                if (eraseStartTime !== null) {
                    const eraseElapsed = elapsed - eraseStartTime;
                    rowEraseX[r] = eraseElapsed * eSpeed + lead - charW;
                } else {
                    rowEraseX[r] = -W;
                }
                
                if (rowEraseX[r] < W) allDone = false;
            }

            // 1. LAYER ONE: Solid Background Cover
            ctx.fillStyle = bg;
            for (let r = 0; r < rows; r++) {
                const y = r * fontSize;
                const writeX = rowWriteX[r];
                const eraseX = rowEraseX[r];

                if (writeX > 0 && eraseX < W) {
                    const startX = Math.max(0, eraseX);
                    const endX = Math.min(W, writeX);
                    if (endX > startX) {
                        ctx.fillRect(startX, y - 1, endX - startX, fontSize + 2);
                    }
                }
            }

            // 2. LAYER TWO: Dual-Speed Typographic Sweep with Jitter
            ctx.fillStyle = fg;
            for (let r = 0; r < rows; r++) {
                const y = r * fontSize;
                const writeX = rowWriteX[r];
                const eraseX = rowEraseX[r];

                const firstCol = Math.max(0, Math.floor(eraseX / charW));
                const lastCol  = Math.min(cols - 1, Math.ceil(writeX / charW));

                for (let c = firstCol; c <= lastCol; c++) {
                    const x = c * charW;
                    const distFromWrite = writeX - x;
                    
                    const isLeadingEdge = distFromWrite < charW * this.SCRAMBLE_BAND_CHARS;
                    const currentInterval = isLeadingEdge ? this.FAST_SCRAMBLE_MS : this.SLOW_SCRAMBLE_MS;

                    const idx = r * cols + c;

                    if (now - cellLastDraw[idx] > currentInterval) {
                        settled[r][c] = this.randomChar();
                        const jitter = Math.random() * currentInterval * 0.8;
                        cellLastDraw[idx] = now + jitter;
                    } 
                    
                    ctx.fillText(settled[r][c], x, y);
                }
            }

            // ZERO-HOLD DOM SWAP
            if (!swapDone) {
                const allCovered = rowWriteX.every(wx => wx >= W);
                
                if (allCovered) {
                    swapDone = true;
                    eraseStartTime = elapsed; 
                    
                    const initial = document.getElementById('initial-screen');
                    const loading = document.getElementById('loading-screen');
                    
                    if (initial) {
                        initial.style.transition = 'none';
                        initial.style.display = 'none';
                    }
                    
                    if (loading) {
                        loading.style.transition = 'none';
                        loading.style.display = 'flex';
                        loading.style.opacity = '1';
                    }

                    const nameEl = document.getElementById('loading-name-text');
                    if (nameEl) nameEl.textContent = this.FULL_NAME;
                }
            }

            if (!allDone) {
                this.addFrame(tick);
            } else {
                canvas.style.pointerEvents = 'none';
                ctx.clearRect(0, 0, W, H);
                this.addTimeout(() => this.fadeOutAndFinish(), this.REVEAL_HOLD_MS);
            }
        };

        this.addFrame(tick);
    }

    // ── Fade out and finish ───────────────────────────────────────────────────
    private static fadeOutAndFinish(): void {
        const loading = document.getElementById('loading-screen');
        const canvas  = document.getElementById('loading-canvas') as HTMLCanvasElement | null;
        const overlay = document.getElementById('loading-overlay');

        const targets = [loading, canvas, overlay].filter(Boolean) as HTMLElement[];

        targets.forEach((el) => {
            el.style.transition = `opacity ${this.FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            el.style.opacity = '0';
        });

        this.addTimeout(() => {
            targets.forEach((el) => {
                el.style.display = 'none';
                el.style.transition = '';
                el.style.opacity = '';
            });
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
                canvas.style.pointerEvents = 'none';
            }
            this.markPlayed();
        }, this.FADE_MS + 50);
    }

    private static readonly FULL_NAME = 'Leo Strangman';
}