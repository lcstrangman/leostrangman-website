import gsap from 'gsap';

interface MouseData {
    x: number;
    y: number;
    rawX: number;
    rawY: number;
}

interface LineData {
    index: number;
    lineX: number;
    lineY: number;
    lineWidth: number;
    lineHeight: number;
    idleLineY: number;
    idleHeight: number;
    interactiveLineY: number;
}

interface Bounds {
    left: number;
    top: number;
    width: number;
    height: number;
}

export class LineCanvas {
    private static isInitialized = false;

    private el: HTMLElement;
    private $canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D;
    private width = 0;
    private height = 0;
    private canvasWidth = 0;
    private canvasHeight = 0;
    private dpr = window.devicePixelRatio || 1;
    private mouseData: MouseData;
    private linesData: LineData[] = [];
    private offsetArray: number[] = [];
    private smoothOffsetArray: number[] = [];
    private hoveredIndex = 0;
    private maxOffset = 0;
    private bounds: Bounds = { left: 0, top: 0, width: 0, height: 0 };
    private isPlaying = false;

    // Color and page title
    private primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color').trim();
    private primaryContrastColor = getComputedStyle(document.body).getPropertyValue('--primary-contrast-color').trim();
    private secondaryColor = getComputedStyle(document.body).getPropertyValue('--secondary-color').trim();
    private secondaryContrastColor = getComputedStyle(document.body).getPropertyValue('--secondary-contrast-color').trim();
    private pageTitle = getComputedStyle(document.body).getPropertyValue('--page-title').trim();

    // Constants
    private static readonly CANVAS_CLASS = 'c-lines_canvas';
    private static readonly LINES_COUNT = 14;
    private static readonly LINES_GUTTER_DIVIDER = 4.5 / 390;
    private static readonly LINES_IDLE_DIVIDER_FIRST = 12 / 22;
    private static readonly LINES_IDLE_DIVIDER_LAST = 6 / 22;
    private static readonly LINES_INTERACTIVE_DIVIDER_FIRST = 10 / 22;
    private static readonly LINES_INTERACTIVE_DIVIDER_LAST = 5 / 22;
    private static readonly LINES_INTERACTIVE_ANGLE_DIVIDER = 100 / 1408;
    private static readonly MAX_OFFSET_RATIO = 0.8;
    private static readonly SMOOTH_LERP = 0.15;

    constructor(wrapperEl: HTMLElement) {
        this.el = wrapperEl;
        this.width = wrapperEl.offsetWidth;
        this.height = wrapperEl.offsetHeight;

        this.mouseData = {
            x: this.width * 0.5,
            y: this.height * 0.5,
            rawX: this.width * 0.5,
            rawY: this.height * 0.5
        };

        this.initCanvas();
        this.computeLayout();
        this.computeOffsetArray();
        this.bindEvents();
        this.play();

        LineCanvas.isInitialized = true;
    }

    static init(wrapperEl: HTMLElement): LineCanvas | null {
        if (!wrapperEl) return null;
        return new LineCanvas(wrapperEl);
    }

    static cleanup(instance: LineCanvas) {
        instance.pause();
        if (instance.$canvas.parentNode) {
            instance.$canvas.parentNode.removeChild(instance.$canvas);
        }
        LineCanvas.isInitialized = false;
    }

    private initCanvas(): void {
        this.$canvas = document.createElement('canvas');
        this.$canvas.className = LineCanvas.CANVAS_CLASS;
        this.ctx = this.$canvas.getContext('2d')!;
        this.el.appendChild(this.$canvas);
        this.updateSize();
    }

    private bindEvents(): void {
        window.addEventListener('resize', () => this.updateSize());
        this.el.addEventListener('mousemove', (e: MouseEvent) => {
            this.mouseData.rawX = e.clientX;
            this.mouseData.rawY = e.clientY;
        });
    }

    private updateSize(): void {
        const prevWidth = this.canvasWidth || this.el.offsetWidth;
        const prevOffsets = [...this.offsetArray];
        const prevSmoothOffsets = [...this.smoothOffsetArray];

        this.width = this.el.offsetWidth;
        this.height = this.el.offsetHeight;
        this.canvasWidth = Math.ceil((this.dpr * this.width) / 4.0) * 4.0;
        this.canvasHeight = Math.ceil((this.dpr * this.height) / 4.0) * 4.0;
        this.$canvas.width = this.canvasWidth;
        this.$canvas.height = this.canvasHeight;
        this.$canvas.style.width = `${this.width}px`;
        this.$canvas.style.height = `${this.height}px`;

        this.computeLayout();

        if (prevOffsets.length === this.offsetArray.length &&
            prevSmoothOffsets.length === this.smoothOffsetArray.length) {
            for (let i = 0; i < this.offsetArray.length; i++) {
                const ratio = prevOffsets[i] / prevWidth;
                this.offsetArray[i] = ratio * this.canvasWidth;
                const smoothRatio = prevSmoothOffsets[i] / prevWidth;
                this.smoothOffsetArray[i] = smoothRatio * this.canvasWidth;
            }
        }

        this.setBounds();
    }

    private setBounds(): void {
        const rect = this.el.getBoundingClientRect();
        this.bounds = {
            left: rect.left,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    }

    private computeLayout(): void {
        this.linesData = [];
        const gutterSize = this.canvasHeight * LineCanvas.LINES_GUTTER_DIVIDER;
        for (let i = 0; i < LineCanvas.LINES_COUNT; i++) {
            const invertedIndex = LineCanvas.LINES_COUNT - 1 - i;
            const idleDivider = gsap.utils.mapRange(
                0, LineCanvas.LINES_COUNT - 1,
                LineCanvas.LINES_IDLE_DIVIDER_FIRST,
                LineCanvas.LINES_IDLE_DIVIDER_LAST,
                invertedIndex
            );
            const interactiveDivider = gsap.utils.mapRange(
                0, LineCanvas.LINES_COUNT - 1,
                LineCanvas.LINES_INTERACTIVE_DIVIDER_FIRST,
                LineCanvas.LINES_INTERACTIVE_DIVIDER_LAST,
                invertedIndex
            );
            const y = ((this.canvasHeight + gutterSize) / LineCanvas.LINES_COUNT) * invertedIndex;
            const height = this.canvasHeight / LineCanvas.LINES_COUNT - gutterSize;
            const lineX = 0;
            const lineY = y;
            const lineWidth = this.canvasWidth;
            const lineHeight = height;
            const idleLineY = lineY + lineHeight * (1 - idleDivider);
            const idleHeight = lineHeight * idleDivider;
            const interactiveLineY = idleLineY - lineHeight * interactiveDivider;

            this.maxOffset =
                lineWidth *
                LineCanvas.LINES_INTERACTIVE_ANGLE_DIVIDER *
                (LineCanvas.LINES_COUNT - 1) *
                LineCanvas.MAX_OFFSET_RATIO;

            this.linesData.push({
                index: i,
                lineX,
                lineY,
                lineWidth,
                lineHeight,
                idleLineY,
                idleHeight,
                interactiveLineY
            });
        }

        this.offsetArray = new Array(LineCanvas.LINES_COUNT).fill(0);
        this.smoothOffsetArray = [...this.offsetArray];
    }

    private computeOffsetArray(): void {
        for (let i = 0; i < LineCanvas.LINES_COUNT; i++) {
            if (i === this.hoveredIndex) this.offsetArray[i] = 0;
            else {
                const distance = Math.abs(this.hoveredIndex - i);
                const progress = 1 - distance / (LineCanvas.LINES_COUNT - 1);
                this.offsetArray[i] = (1 - progress) * this.maxOffset;
            }
        }
    }

    private updateMouse(): void {
        this.mouseData.x = Math.max(Math.min(this.mouseData.rawX - this.bounds.left, this.bounds.width), 0);
        this.mouseData.y = Math.max(Math.min(this.mouseData.rawY - this.bounds.top, this.bounds.height), 0);

        const hovered = this.getHoveredLineIndex(this.mouseData.y);
        if (hovered !== undefined && hovered !== this.hoveredIndex) {
            this.hoveredIndex = hovered;
            this.computeOffsetArray();
        }
    }

    private getHoveredLineIndex(y: number): number | undefined {
        for (let i = 0; i < this.linesData.length; i++) {
            const line = this.linesData[i];
            if (y >= line.lineY / this.dpr && y <= (line.lineY + line.lineHeight) / this.dpr) {
                return i;
            }
        }
    }

    private draw(): void {
        this.updateMouse();
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.linesData.forEach(line => this.drawLine(line));
    }

    private drawLine(line: LineData): void {
        const { index, lineX, lineY, lineWidth, lineHeight, idleLineY, idleHeight, interactiveLineY } = line;

        this.smoothOffsetArray[index] += (this.offsetArray[index] - this.smoothOffsetArray[index]) * LineCanvas.SMOOTH_LERP;
        const angleX = lineX + lineWidth * (1 - LineCanvas.LINES_INTERACTIVE_ANGLE_DIVIDER) - this.smoothOffsetArray[index];

        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(lineX, lineY, lineWidth, lineHeight);
        this.ctx.closePath();
        this.ctx.clip();

        this.ctx.fillStyle = this.secondaryContrastColor;
        this.ctx.fillRect(lineX, idleLineY, lineWidth, idleHeight);

        this.ctx.beginPath();
        this.ctx.moveTo(lineX, interactiveLineY + 1);
        this.ctx.lineTo(angleX, interactiveLineY + 1);
        this.ctx.lineTo(lineX + lineWidth - this.smoothOffsetArray[index], idleLineY + 1);
        this.ctx.lineTo(lineX, idleLineY + 1);
        this.ctx.closePath();
        this.ctx.fillStyle = this.secondaryContrastColor;
        this.ctx.fill();

        const baseFontScale = 1.4;
        const dprAdjustedScale = baseFontScale * this.dpr;
        const visualLineHeight = this.linesData[0].lineHeight / this.dpr;
        this.ctx.font = `${visualLineHeight * dprAdjustedScale}px Nikkei`;
        this.ctx.textBaseline = 'alphabetic';
        this.ctx.fillStyle = this.secondaryColor;

        const text = this.pageTitle + ' ';
        let textX = lineX;
        const baselineNudge = this.linesData[0].lineHeight * 0.0;
        const textY = lineY + lineHeight + baselineNudge;
        while (textX < lineX + lineWidth) {
            this.ctx.fillText(text, textX, textY);
            textX += this.ctx.measureText(text).width;
        }

        this.ctx.restore();
    }

    play(): void {
        if (this.isPlaying) return;
        this.isPlaying = true;
        gsap.ticker.add(this.draw.bind(this));
    }

    pause(): void {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        gsap.ticker.remove(this.draw.bind(this));
    }
}
