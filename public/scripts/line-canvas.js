import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js';

class Lines {
    static CANVAS_CLASS = 'c-lines_canvas';
    static LINES_COUNT = 14;
    static LINES_GUTTER_DIVIDER = 4.5 / 390;
    static LINES_IDLE_DIVIDER_FIRST = 12 / 22;
    static LINES_IDLE_DIVIDER_LAST = 6 / 22;
    static LINES_INTERACTIVE_DIVIDER_FIRST = 10 / 22;
    static LINES_INTERACTIVE_DIVIDER_LAST = 5 / 22;
    static LINES_INTERACTIVE_ANGLE_DIVIDER = 100 / 1408;
    static MAX_OFFSET_RATIO = 0.8;
    static SMOOTH_LERP = 0.15;
    primaryColor = getComputedStyle(document.body).getPropertyValue('--primary-color').trim();
    primaryContrastColor = getComputedStyle(document.body).getPropertyValue('--primary-contrast-color').trim();
    secondaryColor = getComputedStyle(document.body).getPropertyValue('--secondary-color').trim();
    secondaryContrastColor = getComputedStyle(document.body).getPropertyValue('--secondary-contrast-color').trim();
    pageTitle = getComputedStyle(document.body).getPropertyValue('--page-title').trim();


    constructor(wrapperEl) {
        this.el = wrapperEl;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = window.devicePixelRatio;

        this.mouseData = {
            x: this.width * 0.5,
            y: this.height * 0.5,
            rawX: this.width * 0.5,
            rawY: this.height * 0.5
        };

        this.currentScroll = 0;
        this.hoveredIndex = 0;
        this.linesData = [];
        this.currentInput = 'unknown';
        this.lastTouchTime = 0;

        this.initCanvas();
        this.computeLayout();
        this.computeOffsetArray();
        this.bindEvents();
        this.play();
    }

    initCanvas() {
        this.$canvas = document.createElement('canvas');
        this.$canvas.className = Lines.CANVAS_CLASS;
        this.ctx = this.$canvas.getContext('2d');
        this.el.appendChild(this.$canvas);
        this.updateSize();
    }

    bindEvents() {
        window.addEventListener('resize', () => this.updateSize());
        this.el.addEventListener('mousemove', (e) => {
            this.mouseData.rawX = e.clientX;
            this.mouseData.rawY = e.clientY;
        });
    }

    updateSize() {
        this.width = this.el.offsetWidth;
        this.height = this.el.offsetHeight;
        this.canvasWidth = Math.ceil((this.dpr * this.width) / 4.0) * 4.0;
        this.canvasHeight = Math.ceil((this.dpr * this.height) / 4.0) * 4.0;
        this.$canvas.width = this.canvasWidth;
        this.$canvas.height = this.canvasHeight;
        this.$canvas.style.width = `${this.width}px`;
        this.$canvas.style.height = `${this.height}px`;

        this.computeLayout();
        this.setBounds();
    }

    setBounds() {
        const rect = this.el.getBoundingClientRect();
        this.bounds = {
            left: rect.left,
            top: rect.top + window.scrollY,
            width: rect.width,
            height: rect.height
        };
    }

    computeLayout() {
        this.linesData = [];
        const lineCount = Lines.LINES_COUNT;
        const gutterSize = this.canvasHeight * Lines.LINES_GUTTER_DIVIDER;
        for (let i = 0; i < lineCount; i++) {
            // Invert the index so that the longest line is at the top
            const invertedIndex = lineCount - 1 - i;

            const idleDivider = gsap.utils.mapRange(
                0,
                lineCount - 1,
                Lines.LINES_IDLE_DIVIDER_FIRST,
                Lines.LINES_IDLE_DIVIDER_LAST,
                invertedIndex
            );
            const interactiveDivider = gsap.utils.mapRange(
                0,
                lineCount - 1,
                Lines.LINES_INTERACTIVE_DIVIDER_FIRST,
                Lines.LINES_INTERACTIVE_DIVIDER_LAST,
                invertedIndex
            );
            const y = ((this.canvasHeight + gutterSize) / lineCount) * invertedIndex;
            const height = this.canvasHeight / lineCount - gutterSize;
            const lineX = 0;
            const lineY = y;
            const lineWidth = this.canvasWidth;
            const lineHeight = height;
            const idleLineY = lineY + lineHeight * (1 - idleDivider);
            const idleHeight = lineHeight * idleDivider;
            const interactiveLineY = idleLineY - lineHeight * interactiveDivider;


            this.maxOffset =
                lineWidth *
                Lines.LINES_INTERACTIVE_ANGLE_DIVIDER *
                (lineCount - 1) *
                Lines.MAX_OFFSET_RATIO;

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

        this.offsetArray = new Array(lineCount).fill(0);
        this.smoothOffsetArray = [...this.offsetArray];
    }

    computeOffsetArray() {
        const lineCount = Lines.LINES_COUNT;
        for (let i = 0; i < lineCount; i++) {
            if (i === this.hoveredIndex) {
                this.offsetArray[i] = 0;
            } else {
                const distance = Math.abs(this.hoveredIndex - i);
                const progress = 1 - distance / (lineCount - 1);
                this.offsetArray[i] = (1 - progress) * this.maxOffset;
            }
        }
    }

    updateMouse() {
        this.mouseData.x = Math.max(this.mouseData.rawX - this.bounds.left, 0);
        this.mouseData.x = Math.min(this.mouseData.x, this.bounds.width);
        this.mouseData.y = Math.max(this.mouseData.rawY - this.bounds.top, 0);
        this.mouseData.y = Math.min(this.mouseData.y, this.bounds.height);

        const hovered = this.getHoveredLineIndex(this.mouseData.y);
        if (hovered !== this.hoveredIndex && hovered !== undefined) {
            this.hoveredIndex = hovered;
            this.computeOffsetArray();
        }
    }

    getHoveredLineIndex(y) {
        for (let i = 0; i < this.linesData.length; i++) {
            const line = this.linesData[i];
            if (y >= line.lineY / this.dpr && y <= (line.lineY + line.lineHeight) / this.dpr) {
                return i;
            }
        }
    }

    draw() {
        this.updateMouse();
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

        for (let i = 0; i < this.linesData.length; i++) {
            this.drawLine(this.linesData[i]);
        }
    }

    drawLine(line) {
        const {
            index,
            lineX,
            lineY,
            lineWidth,
            lineHeight,
            idleLineY,
            idleHeight,
            interactiveLineY
        } = line;

        // Smooth animation offset
        this.smoothOffsetArray[index] +=
            (this.offsetArray[index] - this.smoothOffsetArray[index]) * Lines.SMOOTH_LERP;
        const angleX =
            lineX +
            lineWidth * (1 - Lines.LINES_INTERACTIVE_ANGLE_DIVIDER) -
            this.smoothOffsetArray[index];

        // Save context state
        this.ctx.save();

        // Define strict clipping region for the line's entire rect
        this.ctx.beginPath();
        this.ctx.rect(lineX, lineY, lineWidth, lineHeight);
        this.ctx.closePath();
        this.ctx.clip();

        // Draw idle rectangle
        this.ctx.fillStyle = this.secondaryContrastColor;
        this.ctx.fillRect(lineX, idleLineY, lineWidth, idleHeight);

        // Draw upper interactive polygon
        this.ctx.beginPath();
        this.ctx.moveTo(lineX, interactiveLineY + 1);
        this.ctx.lineTo(angleX, interactiveLineY + 1);
        this.ctx.lineTo(lineX + lineWidth - this.smoothOffsetArray[index], idleLineY + 1);
        this.ctx.lineTo(lineX, idleLineY + 1);
        this.ctx.closePath();
        this.ctx.fillStyle = this.secondaryContrastColor;
        this.ctx.fill();

        // FIXED FONT SIZE CALCULATION
        // Calculate font size based on visual line height (divided by DPR) instead of canvas line height
        const visualLineHeight = this.linesData[0].lineHeight / this.dpr;
        const fontScale = 2.5; // Keep your existing scale
        this.ctx.font = `${visualLineHeight * fontScale}px Nikkei`;
        this.ctx.textBaseline = 'alphabetic';
        this.ctx.fillStyle = this.secondaryColor;

        const text = this.pageTitle + ' ';
        let textX = lineX;

        // Keep your existing baseline adjustment
        const baselineNudge = this.linesData[0].lineHeight * 0.00;
        const textY = lineY + lineHeight + baselineNudge;

        // Repeat text across the line width
        while (textX < lineX + lineWidth) {
            this.ctx.fillText(text, textX, textY);
            textX += this.ctx.measureText(text).width;
        }

        // Restore to prevent bleed
        this.ctx.restore();
    }

    play() {
        if (this.isPlaying) return;
        this.isPlaying = true;
        gsap.ticker.add(() => this.draw());
    }

    pause() {
        if (!this.isPlaying) return;
        this.isPlaying = false;
        gsap.ticker.remove(() => this.draw());
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const wrapper = document.getElementById('lines-wrapper');
    if (wrapper) {
        new Lines(wrapper);
    }
});

// Intercept all <a> clicks and scroll to top after navigation
document.addEventListener('click', function (e) {
    const target = e.target.closest('a');
    if (target && target.href && !target.target && !target.hasAttribute('download')) {
        if (target.origin === window.location.origin) {
            e.preventDefault();
            window.location.href = target.href;
        }
    }
});

// On popstate (back/forward), let browser restore scroll position (no scrollTo)
window.addEventListener('popstate', function () {
    window.location.reload();
});
