import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export class ScrollAnimation {
    private static scroller: HTMLElement | null = null;
    private static scrollTrack: HTMLElement | null = null;
    private static scrollTrackContent: HTMLElement[] = [];

    private static scrollerManual: HTMLElement | null = null;
    private static scrollTrackManual: HTMLElement | null = null;
    private static scrollTrackContentManual: HTMLElement[] = [];
    private static manualScrollTrigger: ScrollTrigger | null = null;

    static init(): void {
        this.scroller = document.querySelector('.scroll-container');
        this.scrollTrack = this.scroller?.querySelector('.scroll-track') || null;
        this.scrollTrackContent = this.scrollTrack ? Array.from(this.scrollTrack.children) as HTMLElement[] : [];

        this.scrollerManual = document.querySelector('.scroll-container-manual');
        this.scrollTrackManual = this.scrollerManual?.querySelector('.scroll-track-manual') || null;
        this.scrollTrackContentManual = this.scrollTrackManual ? Array.from(this.scrollTrackManual.children) as HTMLElement[] : [];

        this.setupScrollAnimation();
        this.setupScrollAnimationManual();
    }

    static cleanup(): void {
        // Remove horizontal scroll animation
        if (this.scrollTrack) {
            this.scrollTrack.style.animation = '';
            this.scrollTrack.innerHTML = ''; // Remove duplicates
        }

        // Kill manual scroll triggers
        if (this.manualScrollTrigger) {
            this.manualScrollTrigger.kill();
            this.manualScrollTrigger = null;
        }
        if (this.scrollerManual) {
            ScrollTrigger.getAll().forEach(trigger => {
                if (trigger.trigger === this.scrollerManual) trigger.kill();
            });
        }

        this.scroller = null;
        this.scrollTrack = null;
        this.scrollTrackContent = [];
        this.scrollerManual = null;
        this.scrollTrackManual = null;
        this.scrollTrackContentManual = [];
    }

    private static setupScrollAnimation(): void {
        if (!this.scroller || !this.scrollTrack || !this.scrollTrackContent.length) return;

        // Set animation durations based on window width
        if (window.innerWidth < 910) {
            this.scrollTrack.style.animation = 'scroll 45s linear infinite';
        }
        if (window.innerWidth < 600) {
            this.scrollTrack.style.animation = 'scroll 55s linear infinite';
        }

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            this.scroller.setAttribute('data-animated', 'true');

            this.scrollTrackContent.forEach(item => {
                const duplicatedItem = item.cloneNode(true) as HTMLElement;
                duplicatedItem.setAttribute('aria-hidden', 'true');
                duplicatedItem.classList.add('glitchable');
                this.scrollTrack?.appendChild(duplicatedItem);
            });
        }
    }

    private static setupScrollAnimationManual(): void {
        if (!this.scrollerManual || !this.scrollTrackManual) return;

        // Kill previous ScrollTrigger
        if (this.manualScrollTrigger) {
            this.manualScrollTrigger.kill();
            this.manualScrollTrigger = null;
        }

        ScrollTrigger.getAll().forEach(trigger => {
            if (trigger.trigger === this.scrollerManual) trigger.kill();
        });

        const containerWidth = this.scrollerManual.offsetWidth;
        const maxScroll = containerWidth * 3; // 3 sections worth of scrolling

        gsap.set(this.scrollTrackManual, { x: 0 });

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: this.scrollerManual,
                start: "center center",
                end: `+=${maxScroll}`,
                scrub: 1,
                pin: ".link-box-wrapper",
                anticipatePin: 1,
                invalidateOnRefresh: true,
            }
        });

        tl.to(this.scrollTrackManual, {
            x: -maxScroll,
            ease: "none"
        });

        this.manualScrollTrigger = tl.scrollTrigger ?? null;
    }
}