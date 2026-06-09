import gsap from 'gsap';

interface MouseCircle extends HTMLElement {
    _followTween?: gsap.core.Tween;
}

export class MouseEffects {
    private static circle: MouseCircle | null = null;
    private static currentInput: 'mouse' | 'touch' | 'unknown' = 'unknown';
    private static lastTouchTime = 0;
    private static pendingHide = false;

    static init(): void {
        this.circle = document.querySelector('.mouse-circle') as MouseCircle;
        if (!this.circle) return;

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseenter', this.handleHoverEnter, true);
        document.addEventListener('mouseleave', this.handleHoverLeave, true);
        document.addEventListener('mouseenter', this.handleMouseEnterViewport);
        window.addEventListener('mouseout', this.handleMouseOut);
        document.addEventListener('touchstart', this.handleTouchStart);
    }

    static cleanup(): void {
        if (!this.circle) return;

        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseenter', this.handleHoverEnter, true);
        document.removeEventListener('mouseleave', this.handleHoverLeave, true);
        document.removeEventListener('mouseenter', this.handleMouseEnterViewport);
        window.removeEventListener('mouseout', this.handleMouseOut);
        document.removeEventListener('touchstart', this.handleTouchStart);

        if (this.circle._followTween) this.circle._followTween.kill();
        this.circle.style.opacity = '0';
        this.circle = null;
    }

    // Delegated hover — expand circle when cursor enters any .hover-text element
    private static handleHoverEnter = (e: Event): void => {
        if (!this.circle) return;
        if (!(e.target as HTMLElement).closest?.('.hover-text')) return;

        this.circle.classList.add('hovered');
        gsap.to(this.circle, {
            scale: 1.3,
            duration: 0.7,
            ease: 'elastic.out(1, 0.2)'
        });
    };

    private static handleHoverLeave = (e: Event): void => {
        if (!this.circle) return;
        if (!(e.target as HTMLElement).closest?.('.hover-text')) return;

        this.circle.classList.remove('hovered');
        gsap.to(this.circle, {
            scale: 1,
            duration: 0.7,
            ease: 'elastic.out(1, 0.2)'
        });
    };

    private static handleMouseMove = (e: MouseEvent): void => {
        if (!this.circle) return;

        if (this.currentInput === 'touch' && Date.now() - this.lastTouchTime < 500) {
            this.circle.style.opacity = '0';
            return;
        }

        this.currentInput = 'mouse';
        this.pendingHide = false;
        this.circle.style.opacity = '1';

        if (this.circle._followTween) this.circle._followTween.kill();

        this.circle._followTween = gsap.to(this.circle, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.37,
            ease: 'elastic.out(0.7, 0.4)',
            onUpdate: () => this.updateCirclePosition()
        });
    };

    private static handleMouseEnterViewport = (): void => {
        if (!this.circle) return;
        this.pendingHide = false;
        if (this.currentInput === 'mouse') this.circle.style.opacity = '1';
    };

    private static handleTouchStart = (): void => {
        if (!this.circle) return;
        this.currentInput = 'touch';
        this.lastTouchTime = Date.now();
        this.circle.style.opacity = '0';
        this.pendingHide = false;
        if (this.circle._followTween) this.circle._followTween.kill();
    };

    private static handleMouseOut = (e: MouseEvent): void => {
        if (!this.circle) return;

        const leftViewport =
            !e.relatedTarget ||
            e.clientX < 0 ||
            e.clientX > window.innerWidth ||
            e.clientY < 0 ||
            e.clientY > window.innerHeight;

        if (!leftViewport) return;

        this.pendingHide = true;
        if (this.isCircleAtEdge()) {
            this.circle.style.opacity = '0';
            this.pendingHide = false;
            if (this.circle._followTween) this.circle._followTween.kill();
        }
    };

    private static isCircleAtEdge(): boolean {
        if (!this.circle) return true;
        const margin = 50;
        const rect = this.circle.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        return (
            cx <= margin ||
            cx >= window.innerWidth - margin ||
            cy <= margin ||
            cy >= window.innerHeight - margin
        );
    }

    private static updateCirclePosition(): void {
        if (!this.circle || !this.pendingHide) return;
        if (this.isCircleAtEdge()) {
            this.circle.style.opacity = '0';
            this.pendingHide = false;
            if (this.circle._followTween) this.circle._followTween.kill();
        }
    }
}