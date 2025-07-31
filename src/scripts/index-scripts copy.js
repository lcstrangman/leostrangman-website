//Imports for gsap to setup animation for the cover image
import gsap from '../../node_modules/gsap';
import { ScrollTrigger } from '../../node_modules/gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.defaults({
    fastScrollEnd: true
});

//Loading Screen
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading-screen').style.display = 'none';
        document.getElementById('content').style.display = 'block';
    }, 2000); // 2000ms = 2 seconds
});

//Run on content loaded
document.addEventListener('DOMContentLoaded', () => {
    // ===================================================================================
    // Section: Initialize Variables
    // ===================================================================================
    //Load in elements from HTML
    const canvas = document.getElementById('parallax-canvas');
    const hero = document.getElementById('parallax-hero');
    const heroContent = document.getElementById('hero-content-primary');
    const heroContentAlt = document.getElementById('hero-content-alt');
    //Hero content elements
    const name = document.getElementById('parallax-title-name');
    const background = document.getElementById('parallax-name-background');
    const logoBackground = document.getElementById('parallax-logo-background');
    const roleBackground = document.getElementById('parallax-role-background');
    const logoRoleWrapper = document.getElementById('logo-role-wrapper');
    const role = document.getElementById('parallax-title-role');
    const logo = document.getElementById('parallax-title-logo');
    const logoHover = document.getElementById('parallax-logo-hover');
    //Accessibility elements
    const accessibilityBackground = document.getElementById('accessibility-background');
    const accessibilityButton = document.getElementById('parallax-accessibility');
    let accessToggled = false;
    //Scroll elements
    const scroller = document.querySelector('.scroll-container');
    const scrollTrack = scroller.querySelector('.scroll-track');
    const scrollTrackContent = Array.from(scrollTrack.children);
    //Other elements
    const glitchables = document.querySelectorAll('.glitchable');
    const circle = document.querySelector('.mouse-circle');
    const hoverTexts = document.querySelectorAll('.hover-text');

    // ===================================================================================
    // Section: Hero Page Scroll Animation
    // ===================================================================================
    //Initialize canvas
    const context = canvas.getContext('2d');
    canvas.width = 1920;
    canvas.height = 1080;

    //Set up sprite sheets for hero canvas content
    const spriteSheet = new Image();
    spriteSheet.src = '/assets/images/sprite_sheet_full.png';
    spriteSheet.decoding = 'async';
    spriteSheet.loading = 'eager';
    const columns = 5;
    const frameCount = 60;

    //When window loads, preload and predraw frames with GSAP animation
    window.onload = () => {
        preloadFrames();
        startAnimation();
    };

    //Copy of canvas context to preload images to improve performance
    const bufferCtx = canvas.getContext('2d');
    //Preload all frames to avoid lag when loading/moving back to the tab after a long time
    function preloadFrames() {
        //Loop through all frames, render on screen with correct coordinates
        for (let i = 0; i < frameCount; i++) {
            let col = i % columns;
            let row = Math.floor(i / columns);

            let sx = col * canvas.width;
            let sy = row * canvas.height;

            bufferCtx.drawImage(
                spriteSheet,
                0,
                0,
                canvas.width,
                canvas.height,
                0,
                0,
                canvas.width,
                canvas.height
            );
            bufferCtx.drawImage(
                spriteSheet,
                sx,
                sy,
                canvas.width,
                canvas.height,
                0,
                0,
                canvas.width,
                canvas.height
            );
        }
        //Redraw first frame to start on the correct one
        bufferCtx.drawImage(
            spriteSheet,
            0,
            0,
            canvas.width,
            canvas.height,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    //Variable for running GSAP animation
    const glassrender = { frame: 0 };

    //Gsap function to animate on scroll
    function startAnimation() {
        gsap.to(glassrender, {
            frame: frameCount - 1,
            snap: 'frame',
            ease: 'none',
            scrollTrigger: {
                scrub: 0,
                start: 'top top',
                //Modify to change speed animation plays at
                end: () => `${hero.offsetHeight * 0.8}px`
            },
            //Run custom render function on scroll
            onUpdate: render
        });
    }

    //Properly render current frame based on scroll progress
    function render() {
        //Clear canvas, set up frame index
        context.clearRect(0, 0, canvas.width, canvas.height);
        let frameIndex = glassrender.frame;

        //Get column, row, and pixel locations from sprite sheet to draw correct image
        let col = frameIndex % columns;
        let row = Math.floor(frameIndex / columns);
        let sx = col * canvas.width;
        let sy = row * canvas.height;

        //Draw the current frame
        context.drawImage(
            spriteSheet,
            sx,
            sy,
            canvas.width,
            canvas.height,
            0,
            0,
            canvas.width,
            canvas.height
        );
    }

    // ===================================================================================
    // Section: Circular Mouse Cursor Follow
    // ===================================================================================
    //Mouse positions
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;

    // Update target position on mouse move
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Kill any existing tween so we don't stack them
        if (circle._followTween) circle._followTween.kill();

        // Animate to new position with spring
        circle._followTween = gsap.to(circle, {
            x: mouseX,
            y: mouseY,
            duration: 0.37,
            ease: 'elastic.out(0.7, 0.4)'
        });
    });

    //Scale up/down on mouse enter and leave
    const scaleUp = () => {
        gsap.to(circle, {
            scale: 1.3,
            duration: 0.7,
            ease: 'elastic.out(1, 0.2)'
        });
    };
    const scaleDown = () => {
        gsap.to(circle, {
            scale: 1,
            duration: 0.7,
            ease: 'elastic.out(1, 0.2)'
        });
    };

    //When hovering over hover-text elements, scale up/down and play elastic effect
    hoverTexts.forEach((text) => {
        text.addEventListener('mouseenter', () => {
            circle.classList.add('hovered');
            scaleUp();
        });
        text.addEventListener('mouseleave', () => {
            circle.classList.remove('hovered');
            scaleDown();
        });
    });

    window.addEventListener('mouseout', () => {
        circle.style.opacity = '0';
    });

    window.addEventListener('mousemove', () => {
        circle.style.opacity = '1';
    });

    // ===================================================================================
    // Section: Shuffle Texts on Hover
    // ===================================================================================

    //Shuffle given text randomly, keeping punctuation at the end
    function shuffleText(text) {
        // Split the text into words and handle punctuation
        const words = text.split(' ').map((word) => {
            // Separate letters and punctuation within each word
            const letters = word.replace(/[^a-zA-Z0-9@#$%&*/\+=©!]/g, ''); // Only alphabetic characters
            const punctuation = word.replace(/[a-zA-Z0-9@#$%&*/\+=©!]/g, ''); // Only punctuation to leave periods at the end

            // Randomly shuffle the letters
            let shuffledLetters = letters.split('');
            for (let i = shuffledLetters.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledLetters[i], shuffledLetters[j]] = [shuffledLetters[j], shuffledLetters[i]];
            }
            // Return shuffled letters followed by punctuation
            return shuffledLetters.join('') + punctuation;
        });
        // Join the words back with spaces
        return words.join(' ');
    }

    //For every "glitchable" item, use shuffleText function to loop shuffling the text for a glitch effect
    function setupGlitchable(el) {
        let originalText = el.textContent;
        let glitchInterval;

        function glitchText() {
            glitchInterval = setInterval(() => {
                el.textContent = shuffleText(originalText);
            }, 50);

            setTimeout(() => {
                clearInterval(glitchInterval);
                el.textContent = originalText;
            }, 250);
        }

        el.addEventListener('mouseenter', glitchText);

        el.addEventListener('mouseleave', () => {
            clearInterval(glitchInterval);
            el.textContent = originalText;
        });
    }

    glitchables.forEach(setupGlitchable);

    // ===================================================================================
    // Section: Hover Effect for hero-content
    // ===================================================================================

    //Variables to enable hover effect on hero-content for readability
    let hoverEnabled = false;
    let hoverTargets = [name, logoRoleWrapper];

    //Handle triggering hover effects for mouse enter and mouse leave on all targets
    //Enable event listeners if screen size is large enough
    function enableHoverEffects() {
        if (hoverEnabled) return;

        hoverTargets.forEach((target) => {
            target.addEventListener('mouseenter', handleMouseEnter);
            target.addEventListener('mouseleave', handleMouseLeave);
        });
        hoverEnabled = true;
    }

    //Handle disabling hover effects based on screen size
    //If screen is too small, text hover highlights do not work, so event listeners are disabled
    function disableHoverEffects() {
        if (!hoverEnabled) return;

        hoverTargets.forEach((target) => {
            target.removeEventListener('mouseenter', handleMouseEnter);
            target.removeEventListener('mouseleave', handleMouseLeave);
        });
        hoverEnabled = false;
    }

    //Update css of elements to properly show hover effect
    function handleMouseEnter() {
        background.classList.add('hovered-bg');
        roleBackground.classList.add('hovered-bg');
        logoBackground.classList.add('hovered-bg');
        name.classList.remove('title-name-color');
        name.classList.add('title-name-color-hover');
        role.classList.add('role-color-hover');
        logoRoleWrapper.classList.add('logo-role-wrapper-hover');
        logoHover.classList.remove('display-none');
        logoHover.classList.add('display');
    }

    //Update css of elements to properly disable hover effect
    function handleMouseLeave() {
        background.classList.remove('hovered-bg');
        roleBackground.classList.remove('hovered-bg');
        logoBackground.classList.remove('hovered-bg');
        name.classList.add('title-name-color');
        name.classList.remove('title-name-color-hover');
        role.classList.remove('role-color-hover');
        logoRoleWrapper.classList.remove('logo-role-wrapper-hover');
        logo.setAttribute('name', 'icon-amber-supply');
        logoHover.classList.remove('display');
        logoHover.classList.add('display-none');
    }

    //Determine if screen size is large enough for hover effect
    const mediaQuery = window.matchMedia('(min-width: 910px)');

    //If screen is large enough, enable hover effects
    function handleMediaChange(e) {
        if (e.matches) {
            enableHoverEffects();
        } else {
            disableHoverEffects();
        }
    }

    // Run once on load
    handleMediaChange(mediaQuery);

    // Listen for screen resize changes
    mediaQuery.addEventListener('change', handleMediaChange);

    //When highlighting title text, remove any mix-blend modes to allow for proper highlighting
    document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();

        if (!selection || selection.isCollapsed || !selection.rangeCount) {
            name.style.mixBlendMode = 'exclusion';
            return;
        }

        const range = selection.getRangeAt(0);

        try {
            if (range.intersectsNode(name)) {
                name.style.mixBlendMode = 'normal';
            } else {
                name.style.mixBlendMode = 'exclusion';
            }
        } catch (e) {
            // If the element is detached or causes a DOM error
            name.style.mixBlendMode = 'exclusion';
        }
    });

    // ===================================================================================
    // Section: Accessibility Mode
    // ===================================================================================

    //When clicking the accessibility mode button, update css styles of necessary elements
    accessibilityButton.addEventListener('click', () => {
        enableAccessibility();
    });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        enableAccessibility();
    }

    function enableAccessibility() {
        if (accessToggled) {
            scrollTrack.style.animation = 'scroll 20s linear infinite';
        } else {
            scrollTrack.style.animation = 'scroll 60s linear infinite';
        }
        accessibilityBackground.classList.toggle('hidden');
        heroContent.classList.toggle('display-none');
        heroContentAlt.classList.toggle('display');
        accessToggled = !accessToggled;
    }

    // ===================================================================================
    // Section: Parallax Scroll Effects
    // ===================================================================================

    //Move hero page elements on scroll with a parallax effect
    document.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        canvas.style.transform = `translateY(${scrollY * 0.5}px)`;
        name.style.transform = `translateY(${scrollY * -0.27}px)`;
        background.style.transform = `translateY(${scrollY * -0.27}px)`;
        role.style.transform = `translateY(${scrollY * -0.15}px)`;
        roleBackground.style.transform = `translateY(${scrollY * -0.15}px)`;
        logo.style.transform = `translateY(${scrollY * -0.2}px)`;
        logoBackground.style.transform = `translateY(${scrollY * -0.2}px)`;
        logoHover.style.transform = `translateY(${scrollY * -0.2}px)`;
    });

    // ===================================================================================
    // Section: Image Pixelation
    // ===================================================================================
    document.querySelectorAll('.image-wrapper').forEach((wrapper) => {
        //Set up canvas, images, and constants
        const pixelCanvas = wrapper.querySelector('.pixel-canvas');
        const pixelContext = pixelCanvas.getContext('2d');
        const image = wrapper.querySelector('.source-image img');

        const startPixelSize = 70;
        const endPixelSize = 1;
        const numSteps = 8;
        const delay = 50;

        let currentStep = 0;
        let animating = false;
        let hasAnimated = false;

        function drawPixelated(size) {
            pixelCanvas.width = image.naturalWidth;
            pixelCanvas.height = image.naturalHeight;
            const w = pixelCanvas.width;
            const h = pixelCanvas.height;

            pixelContext.clearRect(0, 0, w, h);
            pixelContext.imageSmoothingEnabled = false;

            pixelContext.drawImage(image, 0, 0, w / size, h / size);
            pixelContext.drawImage(pixelCanvas, 0, 0, w / size, h / size, 0, 0, w, h);
        }
        function animateDepixelate() {
            if (currentStep > numSteps) {
                animating = false;
                return;
            }
            const progress = currentStep / numSteps;
            const pixelSize = startPixelSize * (1 - progress) + endPixelSize * progress;

            drawPixelated(pixelSize);
            currentStep++;
            setTimeout(() => requestAnimationFrame(animateDepixelate), delay);
        }
        function startPixelation() {
            if (animating || hasAnimated) return;
            animating = true;
            hasAnimated = true;
            currentStep = 0;
            drawPixelated(startPixelSize);
            requestAnimationFrame(animateDepixelate);
            pixelCanvas.style.imageRendering = 'auto';
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        startPixelation();
                    }
                });
            },
            { threshold: 0.6 }
        );

        if (image.complete) {
            drawPixelated(startPixelSize);
        } else {
            image.onload = () => drawPixelated(startPixelSize);
        }
        observer.observe(pixelCanvas);
    });

    // ===================================================================================
    // Section: Navigation Container Scroll
    // ===================================================================================

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        scrollAnimation();
    }
    function scrollAnimation() {
        scroller.setAttribute('data-animated', true);

        scrollTrackContent.forEach((item) => {
            const duplicatedItem = item.cloneNode(true);
            duplicatedItem.setAttribute('aria-hidden', true);
            duplicatedItem.classList.add('glitchable');
            if (duplicatedItem.classList.contains('glitchable')) {
                setupGlitchable(duplicatedItem);
            }
            scrollTrack.appendChild(duplicatedItem);
        });
    }
});
