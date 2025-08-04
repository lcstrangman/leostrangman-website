//Imports for gsap to setup animation for the cover image
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.defaults({
    fastScrollEnd: true,
});

//
class HeroPageController {
    constructor() {
        this.isInitialized = false;
        this.accessToggled = false;
        this.glassrender = { frame: 0 };
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.hoverEnabled = false;
        
        this.init();
    }

    init() {
        // Prevent double initialization
        if (this.isInitialized) {
            this.cleanup();
        }

        this.loadElements();
        this.setupEventListeners();
        this.initializeComponents();
        this.isInitialized = true;
    }

    loadElements() {
        // ===================================================================================
        // Section: Initialize Variables
        // ===================================================================================
        this.canvas = document.getElementById("parallax-canvas");
        this.hero = document.getElementById("parallax-hero");
        this.heroContent = document.getElementById("hero-content-primary");
        this.heroContentAlt = document.getElementById("hero-content-alt");
        
        // Hero content elements
        this.name = document.getElementById("parallax-title-name");
        this.background = document.getElementById("parallax-name-background");
        this.logoBackground = document.getElementById("parallax-logo-background");
        this.roleBackground = document.getElementById("parallax-role-background");
        this.logoRoleWrapper = document.getElementById('logo-role-wrapper');
        this.role = document.getElementById("parallax-title-role");
        this.logo = document.getElementById("parallax-title-logo");
        this.logoHover = document.getElementById("parallax-logo-hover");
        
        // Accessibility elements
        this.accessibilityBackground = document.getElementById('accessibility-background');
        this.accessibilityButton = document.getElementById('parallax-accessibility');
        
        // Scroll elements
        this.scroller = document.querySelector('.scroll-container');
        this.scrollTrack = this.scroller?.querySelector('.scroll-track');
        this.scrollTrackContent = this.scrollTrack ? Array.from(this.scrollTrack.children) : [];
        this.scrollerManual = document.querySelector('.scroll-container-manual');
        this.scrollTrackManual = this.scrollerManual?.querySelector('.scroll-track-manual');
        this.scrollTrackContentManual = this.scrollTrackManual ? Array.from(this.scrollTrackManual.children) : [];
        
        // Other elements
        this.glitchables = document.querySelectorAll('.glitchable');
        this.circle = document.querySelector('.mouse-circle');
        this.hoverTexts = document.querySelectorAll('.hover-text');
        
        this.hoverTargets = [this.name, this.logoRoleWrapper].filter(Boolean);
    }

    setupEventListeners() {
        // Remove existing listeners before adding new ones
        this.removeEventListeners();
        
        // Bind methods to preserve 'this' context
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.handleSelectionChange = this.handleSelectionChange.bind(this);
        this.handleAccessibilityClick = this.handleAccessibilityClick.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMediaChange = this.handleMediaChange.bind(this);

        // Add event listeners
        document.addEventListener('mousemove', this.handleMouseMove);
        window.addEventListener('mouseout', this.handleMouseOut);
        document.addEventListener('scroll', this.handleScroll);
        document.addEventListener('selectionchange', this.handleSelectionChange);
        
        if (this.accessibilityButton) {
            this.accessibilityButton.addEventListener('click', this.handleAccessibilityClick);
        }

        // Media query for hover effects
        this.mediaQuery = window.matchMedia('(min-width: 910px)');
        this.mediaQuery.addEventListener('change', this.handleMediaChange);
        this.handleMediaChange(this.mediaQuery);

        // Check for reduced motion preference
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            this.enableAccessibility();
        }
    }

    removeEventListeners() {
        if (this.handleMouseMove) {
            document.removeEventListener('mousemove', this.handleMouseMove);
            window.removeEventListener('mouseout', this.handleMouseOut);
            document.removeEventListener('scroll', this.handleScroll);
            document.removeEventListener('selectionchange', this.handleSelectionChange);
        }

        if (this.accessibilityButton && this.handleAccessibilityClick) {
            this.accessibilityButton.removeEventListener('click', this.handleAccessibilityClick);
        }

        if (this.mediaQuery && this.handleMediaChange) {
            this.mediaQuery.removeEventListener('change', this.handleMediaChange);
        }

        this.disableHoverEffects();
    }

    initializeComponents() {
        this.initializeCanvas();
        this.setupMouseCircle();
        this.setupGlitchables();
        this.setupImagePixelation();
        this.setupScrollAnimation();
        this.setupScrollAnimationManual();
        
        // Initialize hero animation when ready
        if (this.canvas) {
            this.preloadFrames();
            this.startAnimation();
        }
    }

    // ===================================================================================
    // Section: Hero Page Scroll Animation
    // ===================================================================================

    initializeCanvas() {
        if (!this.canvas) return;
        
        this.context = this.canvas.getContext("2d");
        this.canvas.width = 1920;
        this.canvas.height = 1080;

        // Set up sprite sheets for hero canvas content
        this.spriteSheet = new Image();
        this.spriteSheet.src = "/assets/images/sprite_sheet_full.png";
        this.spriteSheet.decoding = "async";
        this.spriteSheet.loading = "eager";
        this.columns = 5;
        this.frameCount = 60;
    }

    preloadFrames() {
        if (!this.canvas || !this.spriteSheet) return;
        
        const bufferCtx = this.canvas.getContext("2d");
        
        for (let i = 0; i < this.frameCount; i++) {
            let col = i % this.columns;
            let row = Math.floor(i / this.columns);
            let sx = col * this.canvas.width;
            let sy = row * this.canvas.height;

            bufferCtx.drawImage(this.spriteSheet, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
            bufferCtx.drawImage(this.spriteSheet, sx, sy, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
        }
        
        bufferCtx.drawImage(this.spriteSheet, 0, 0, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
    }

    startAnimation() {
        if (!this.hero || !this.canvas) return;
        
        // Kill existing animation
        if (this.heroAnimation) {
            this.heroAnimation.kill();
        }

        this.heroAnimation = gsap.to(this.glassrender, {
            frame: this.frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                scrub: 0,
                start: "top top",
                end: () => `${this.hero.offsetHeight * 0.8}px`,
                onRefresh: () => this.render(),
            },
            onUpdate: () => this.render(),
        });
    }

    render() {
        if (!this.context || !this.spriteSheet) return;
        
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        let frameIndex = this.glassrender.frame;
        
        let col = frameIndex % this.columns;
        let row = Math.floor(frameIndex / this.columns);
        let sx = col * this.canvas.width;
        let sy = row * this.canvas.height;

        this.context.drawImage(this.spriteSheet, sx, sy, this.canvas.width, this.canvas.height, 0, 0, this.canvas.width, this.canvas.height);
    }

    // ===================================================================================
    // Section: Circular Mouse Cursor Follow
    // ===================================================================================
    setupMouseCircle() {
        if (!this.circle) return;

        // Setup hover text interactions
        this.hoverTexts.forEach(text => {
            const scaleUp = () => {
                gsap.to(this.circle, {
                    scale: 1.3,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.2)"
                });
            };
            
            const scaleDown = () => {
                gsap.to(this.circle, {
                    scale: 1,
                    duration: 0.7,
                    ease: "elastic.out(1, 0.2)"
                });
            };

            text.addEventListener('mouseenter', () => {
                this.circle.classList.add('hovered');
                scaleUp();
            });
            
            text.addEventListener('mouseleave', () => {
                this.circle.classList.remove('hovered');
                scaleDown();
            });
        });
    }

    handleMouseMove(e) {
        if (!this.circle) return;
        
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;

        this.circle.style.opacity = '1';

        // Kill any existing tween so we don't stack them
        if (this.circle._followTween) this.circle._followTween.kill();

        // Animate to new position with spring
        this.circle._followTween = gsap.to(this.circle, {
            x: this.mouseX,
            y: this.mouseY,
            duration: 0.37,
            ease: "elastic.out(0.7, 0.4)"
        });
    }

    handleMouseOut() {
        if (this.circle) {
            this.circle.style.opacity = '0';
        }
    }

    // ===================================================================================
    // Section: Shuffle Texts on Hover
    // ===================================================================================
    setupGlitchables() {
        this.glitchables.forEach(el => this.setupGlitchable(el));
    }

    setupGlitchable(el) {
        let originalText = el.textContent;
        let glitchInterval;

        const glitchText = () => {
            glitchInterval = setInterval(() => {
                el.textContent = this.shuffleText(originalText);
            }, 50);

            setTimeout(() => {
                clearInterval(glitchInterval);
                el.textContent = originalText;
            }, 250);
        };

        const stopGlitch = () => {
            clearInterval(glitchInterval);
            el.textContent = originalText;
        };

        el.addEventListener("mouseenter", glitchText);
        el.addEventListener("mouseleave", stopGlitch);
    }

    shuffleText(text) {
        const words = text.split(' ').map(word => {
            const letters = word.replace(/[^a-zA-Z0-9@#$%&*/\+=©!-]/g, '');
            const punctuation = word.replace(/[a-zA-Z0-9@#$%&*/\+=©!-]/g, '');

            let shuffledLetters = letters.split('');
            for (let i = shuffledLetters.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
            }
            
            return shuffledLetters.join('') + punctuation;
        });
        
        return words.join(' ');
    }

    // ===================================================================================
    // Section: Hover Effect for hero-content
    // ===================================================================================
    enableHoverEffects() {
        if (this.hoverEnabled || !this.hoverTargets.length) return;

        this.hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', this.handleMouseEnter);
            target.addEventListener('mouseleave', this.handleMouseLeave);
        });
        this.hoverEnabled = true;
    }

    disableHoverEffects() {
        if (!this.hoverEnabled || !this.hoverTargets.length) return;

        this.hoverTargets.forEach(target => {
            target.removeEventListener('mouseenter', this.handleMouseEnter);
            target.removeEventListener('mouseleave', this.handleMouseLeave);
        });
        this.hoverEnabled = false;
    }

    handleMouseEnter() {
        if (!this.background) return;
        
        this.background.classList.add('hovered-bg');
        this.roleBackground?.classList.add('hovered-bg');
        this.logoBackground?.classList.add('hovered-bg');
        this.name?.classList.remove('title-name-color');
        this.name?.classList.add('title-name-color-hover');
        this.role?.classList.add('role-color-hover');
        this.logoRoleWrapper?.classList.add('logo-role-wrapper-hover');
        this.logoHover?.classList.remove('display-none');
        this.logoHover?.classList.add('display');
    }

    handleMouseLeave() {
        if (!this.background) return;
        
        this.background.classList.remove('hovered-bg');
        this.roleBackground?.classList.remove('hovered-bg');
        this.logoBackground?.classList.remove('hovered-bg');
        this.name?.classList.add('title-name-color');
        this.name?.classList.remove('title-name-color-hover');
        this.role?.classList.remove('role-color-hover');
        this.logoRoleWrapper?.classList.remove('logo-role-wrapper-hover');
        this.logo?.setAttribute("name", "icon-amber-supply");
        this.logoHover?.classList.remove('display');
        this.logoHover?.classList.add('display-none');
    }

    handleMediaChange(e) {
        if (e.matches) {
            this.enableHoverEffects();
        } else {
            this.disableHoverEffects();
        }
    }

    handleSelectionChange() {
        if (!this.name) return;
        
        const selection = window.getSelection();

        if (!selection || selection.isCollapsed || !selection.rangeCount) {
            this.name.style.mixBlendMode = 'exclusion';
            return;
        }

        const range = selection.getRangeAt(0);

        try {
            if (range.intersectsNode(this.name)) {
                this.name.style.mixBlendMode = 'normal';
            } else {
                this.name.style.mixBlendMode = 'exclusion';
            }
        } catch (e) {
            this.name.style.mixBlendMode = 'exclusion';
        }
    }

    // ===================================================================================
    // Section: Accessibility Mode
    // ===================================================================================
    handleAccessibilityClick() {
        this.enableAccessibility();
    }

    enableAccessibility() {
        if (this.scrollTrack) {
            if (this.accessToggled) {
                this.scrollTrack.style.animation = 'scroll 20s linear infinite';
            } else {
                this.scrollTrack.style.animation = 'scroll 60s linear infinite';
            }
        }
        
        this.accessibilityBackground?.classList.toggle('hidden');
        this.heroContent?.classList.toggle('display-none');
        this.heroContentAlt?.classList.toggle('display');
        this.accessToggled = !this.accessToggled;
    }

    // ===================================================================================
    // Section: Parallax Scroll Effects
    // ===================================================================================
    handleScroll() {
        const scrollY = window.scrollY;
        
        if (this.canvas) this.canvas.style.transform = `translateY(${scrollY * 0.5}px)`;
        if (this.name) this.name.style.transform = `translateY(${scrollY * -0.27}px)`;
        if (this.background) this.background.style.transform = `translateY(${scrollY * -0.27}px)`;
        if (this.role) this.role.style.transform = `translateY(${scrollY * -0.15}px)`;
        if (this.roleBackground) this.roleBackground.style.transform = `translateY(${scrollY * -0.15}px)`;
        if (this.logo) this.logo.style.transform = `translateY(${scrollY * -0.2}px)`;
        if (this.logoBackground) this.logoBackground.style.transform = `translateY(${scrollY * -0.2}px)`;
        if (this.logoHover) this.logoHover.style.transform = `translateY(${scrollY * -0.2}px)`;
    }

    // ===================================================================================
    // Section: Image Pixelation
    // ===================================================================================
    setupImagePixelation() {
        document.querySelectorAll('.image-wrapper').forEach(wrapper => {
            const pixelCanvas = wrapper.querySelector('.pixel-canvas');
            const pixelContext = pixelCanvas?.getContext('2d');
            const image = wrapper.querySelector('.source-image img');
            
            if (!pixelCanvas || !pixelContext || !image) return;
            
            const startPixelSize = 70;
            const endPixelSize = 1;
            const numSteps = 5;
            const delay = 80;

            let threshold = 0.6;
            if (image.naturalHeight && window.innerHeight) {
                // If image is taller than viewport, set threshold lower so it always triggers
                const ratio = Math.min(1, window.innerHeight / image.naturalHeight);
                threshold = Math.max(0.1, ratio * 0.9); // 0.9 is a fudge factor, adjust as needed
            }
            let currentStep = 0;
            let animating = false;
            let hasAnimated = false;

            const drawPixelated = (size) => {
                pixelCanvas.width = image.naturalWidth;
                pixelCanvas.height = image.naturalHeight;
                const w = pixelCanvas.width;
                const h = pixelCanvas.height;

                pixelContext.clearRect(0, 0, w, h);
                pixelContext.imageSmoothingEnabled = false;

                pixelContext.drawImage(image, 0, 0, w/size, h/size);
                pixelContext.drawImage(pixelCanvas, 0, 0, w/size, h/size, 0, 0, w, h);
            };

            const animateDepixelate = () => {
                if (currentStep > numSteps) {
                    animating = false;
                    return;
                }
                const progress = currentStep / numSteps;
                const pixelSize = startPixelSize * (1 - progress) + endPixelSize * progress;

                drawPixelated(pixelSize);
                currentStep++;
                setTimeout(() => requestAnimationFrame(animateDepixelate), delay);
            };

            const startPixelation = () => {
                if (animating || hasAnimated) return;
                animating = true;
                hasAnimated = true;
                currentStep = 0;
                drawPixelated(startPixelSize);
                requestAnimationFrame(animateDepixelate);
                pixelCanvas.style.imageRendering = "auto";
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startPixelation();
                    }
                });
            }, {threshold});
            
            if (image.complete) {
                drawPixelated(startPixelSize);
            } else {
                image.onload = () => drawPixelated(startPixelSize);
            }
            observer.observe(pixelCanvas);
        });
    }

    // ===================================================================================
    // Section: Navigation Container Scroll
    // ===================================================================================
    setupScrollAnimation() {
        if (!this.scroller || !this.scrollTrack) return;
        
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            this.scroller.setAttribute('data-animated', true);
            
            this.scrollTrackContent.forEach(item => {
                const duplicatedItem = item.cloneNode(true);
                duplicatedItem.setAttribute('aria-hidden', true);
                duplicatedItem.classList.add('glitchable');
                if (duplicatedItem.classList.contains('glitchable')) {
                    this.setupGlitchable(duplicatedItem);
                }
                this.scrollTrack.appendChild(duplicatedItem);
            });
        }
    }

    setupScrollAnimationManual() {
        if (!this.scrollTrackManual || !this.scrollerManual) return;
    
        // Calculate the total width to scroll
        const scrollWidth = this.scrollTrackManual.scrollWidth;
        const containerWidth = this.scrollerManual.offsetWidth;
        const maxScroll = scrollWidth - containerWidth;
    
        // Keep text at start position initially
        gsap.set(this.scrollTrackManual, { x: 0 });
        
        // Create the scroll animation using the timeline properly
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: this.scrollerManual,
                start: "center center", // Start when container is centered
                end: `+=${maxScroll + window.innerHeight}`, // End after scrolling through all text + extra space
                scrub: 1,
                pin: ".link-box-wrapper", // Pin the parent wrapper instead of just the scroll container
                anticipatePin: 1,
                invalidateOnRefresh: true
            }
        });
        
        // Add the horizontal scroll animation to the timeline
        tl.to(this.scrollTrackManual, {
            x: -maxScroll,
            ease: "none"
        });
    }


    cleanup() {
        // Kill GSAP animations
        if (this.heroAnimation) {
            this.heroAnimation.kill();
        }
        
        // Kill ScrollTrigger instances
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        
        // Remove event listeners
        this.removeEventListeners();
        
        this.isInitialized = false;
    }

    destroy() {
        this.cleanup();
    }
}

// Main initialization function
function initializePage() {
    // Initialize hero page controller
    let heroController;
    
    const init = () => {
        if (heroController) {
            heroController.destroy();
        }
        heroController = new HeroPageController();
    };

    // Handle initial load and navigation
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle back/forward navigation
    window.addEventListener('pageshow', (event) => {
        if (event.persisted || document.readyState === 'complete') {
            init();
        }
    });

    // Handle popstate (back/forward buttons)
    window.addEventListener('popstate', init);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (heroController) {
            heroController.destroy();
        }
    });
}

// Auto-initialize when script loads
initializePage();

document.addEventListener('astro:page-load', initializePage);