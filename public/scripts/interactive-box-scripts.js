class InteractiveBoxController {
    constructor() {}
    init() {
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator.msMaxTouchPoints > 0);
        document.querySelectorAll('.interactive-section').forEach(section => {
            const container = section.querySelector('.boxes-container');
            const previewImage = section.querySelector('.preview-image');
            const prefix = '/assets/images' + (container.getAttribute('data-prefix') || '');
            const bulletBoxes = container.querySelectorAll('.bullet-box');
            if (!previewImage) return;
            
            bulletBoxes.forEach(box => {
                const imageName = box.getAttribute('data-image');
                const imageSrc = `${prefix}${imageName}.png`;
                
                box.addEventListener('mouseenter', function () {
                    previewImage.style.backgroundImage = `url(${imageSrc})`;
                    previewImage.style.opacity = '1';
                    previewImage.classList.add('active');
                });
                
                box.addEventListener('mouseleave', function () {
                    previewImage.style.opacity = '0';
                    previewImage.classList.remove('active');
                });
                
                if (isTouch) {
                    let touchStartY = 0;
                    let touchStartTime = 0;
                    
                    box.addEventListener('touchstart', function (e) {
                        touchStartY = e.touches[0].clientY;
                        touchStartTime = Date.now();
                        // Don't prevent default here - let the browser handle it
                    });
                    
                    box.addEventListener('touchend', function (e) {
                        const touchEndY = e.changedTouches[0].clientY;
                        const touchDuration = Date.now() - touchStartTime;
                        const touchDistance = Math.abs(touchEndY - touchStartY);
                        
                        // Only activate if it was a tap (short duration, minimal movement)
                        // Allow scrolling if the user moved their finger significantly
                        if (touchDuration < 300 && touchDistance < 10) {
                            e.preventDefault(); // Only prevent default for actual taps
                            
                            // Remove highlight and image from ALL containers
                            document.querySelectorAll('.preview-image').forEach(img => {
                                img.style.opacity = '0';
                                img.classList.remove('active');
                                img.style.backgroundImage = '';
                            });
                            document.querySelectorAll('.bullet-box').forEach(b => b.classList.remove('is-active'));
                            
                            // Activate only the current box and image
                            this.classList.add('is-active');
                            previewImage.style.backgroundImage = `url(${imageSrc})`;
                            previewImage.style.opacity = '1';
                            previewImage.classList.add('active');
                        }
                    });
                }
            });
        });
    }
}

// To use it in the browser:
document.addEventListener('DOMContentLoaded', () => {
    const controller = new InteractiveBoxController();
    controller.init();
});