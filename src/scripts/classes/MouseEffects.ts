import gsap from 'gsap';

interface MouseCircle extends HTMLElement {
    _followTween?: gsap.core.Tween;
}

export class MouseEffects {
    private static circle: MouseCircle | null = null;
    private static hoverTexts: NodeListOf<HTMLElement> = null!;
    private static currentInput: 'mouse' | 'touch' | 'unknown' = 'unknown';
    private static lastTouchTime = 0;
    private static pendingHide = false;
    private static mouseX = 0;
    private static mouseY = 0;

    static init(): void {
        this.circle = document.querySelector('.mouse-circle') as MouseCircle;
        this.hoverTexts = document.querySelectorAll('.hover-text');

        if (!this.circle) return;

        // Bind event handlers
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseenter', this.handleMouseEnterViewport);
        window.addEventListener('mouseout', this.handleMouseOut);
        document.addEventListener('touchstart', this.handleTouchStart);
        document.addEventListener('scroll', this.handleScroll);
        document.addEventListener('selectionchange', this.handleSelectionChange);

        this.setupMouseCircle();
    }

    static cleanup(): void {
        if (!this.circle) return;

        // Remove all event listeners
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseenter', this.handleMouseEnterViewport);
        window.removeEventListener('mouseout', this.handleMouseOut);
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('scroll', this.handleScroll);
        document.removeEventListener('selectionchange', this.handleSelectionChange);

        // Kill any active tween
        if (this.circle._followTween) {
            this.circle._followTween.kill();
        }

        // Reset circle
        this.circle.style.opacity = '0';
        this.circle = null;
    }

    private static setupMouseCircle(): void {
        if (!this.circle) return;

        this.hoverTexts.forEach((text) => {
            const scaleUp = () => {
                gsap.to(this.circle!, {
                    scale: 1.3,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.2)'
                });
            };

            const scaleDown = () => {
                gsap.to(this.circle!, {
                    scale: 1,
                    duration: 0.7,
                    ease: 'elastic.out(1, 0.2)'
                });
            };

            text.addEventListener('mouseenter', () => {
                this.circle!.classList.add('hovered');
                scaleUp();
            });

            text.addEventListener('mouseleave', () => {
                this.circle!.classList.remove('hovered');
                scaleDown();
            });
        });
    }

    private static isCircleAtEdge(): boolean {
        if (!this.circle) return true;
        const margin = 50;
        const rect = this.circle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        return (
            centerX <= margin ||
            centerX >= window.innerWidth - margin ||
            centerY <= margin ||
            centerY >= window.innerHeight - margin
        );
    }

    private static updateCirclePosition(): void {
        if (!this.circle || !this.pendingHide) return;

        if (this.isCircleAtEdge()) {
            this.circle.style.opacity = '0';
            this.pendingHide = false;

            if (this.circle._followTween) {
                this.circle._followTween.kill();
            }
        }
    }

    private static handleMouseMove = (e: MouseEvent): void => {
        if (!this.circle) return;

        if (this.currentInput === 'touch' && Date.now() - this.lastTouchTime < 500) {
            this.circle.style.opacity = '0';
            return;
        }

        this.currentInput = 'mouse';
        this.pendingHide = false;

        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        this.circle.style.opacity = '1';

        if (this.circle._followTween) this.circle._followTween.kill();

        this.circle._followTween = gsap.to(this.circle, {
            x: this.mouseX,
            y: this.mouseY,
            duration: 0.37,
            ease: 'elastic.out(0.7, 0.4)',
            onUpdate: () => {
                this.updateCirclePosition();
            }
        });
    };

    private static handleMouseEnterViewport = (): void => {
        if (!this.circle) return;
        this.pendingHide = false;
        if (this.currentInput === 'mouse') {
            this.circle.style.opacity = '1';
        }
    };

    private static handleTouchStart = (): void => {
        if (!this.circle) return;
        this.currentInput = 'touch';
        this.lastTouchTime = Date.now();
        this.circle.style.opacity = '0';
        this.pendingHide = false;

        if (this.circle._followTween) {
            this.circle._followTween.kill();
        }
    };

    private static handleMouseOut = (e: MouseEvent): void => {
        if (!this.circle) return;

        if (
            !e ||
            !e.relatedTarget ||
            e.clientX < 0 ||
            e.clientX > window.innerWidth ||
            e.clientY < 0 ||
            e.clientY > window.innerHeight
        ) {
            this.pendingHide = true;

            if (this.isCircleAtEdge()) {
                this.circle.style.opacity = '0';
                this.pendingHide = false;

                if (this.circle._followTween) {
                    this.circle._followTween.kill();
                }
            }
        }
    };

    private static handleScroll = (): void => {
        // You can add scroll-based behavior here if needed
    };

    private static handleSelectionChange = (): void => {
        // Optional selection-based behavior
    };
}
