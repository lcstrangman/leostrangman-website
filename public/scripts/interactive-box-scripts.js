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
                
                // Make it focusable and accessible
                if (!box.hasAttribute('tabindex')) {
                    box.setAttribute('tabindex', '0');
                }
                if (!box.hasAttribute('role')) {
                    box.setAttribute('role', 'button');
                }
               
                // Desktop hover events
                box.addEventListener('mouseenter', function () {
                    previewImage.style.backgroundImage = `url(${imageSrc})`;
                    previewImage.style.opacity = '1';
                    previewImage.classList.add('active');
                });
               
                box.addEventListener('mouseleave', function () {
                    previewImage.style.opacity = '0';
                    previewImage.classList.remove('active');
                });
                
                // Universal click handler (works for mouse, touch, and keyboard)
                box.addEventListener('click', function (e) {
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
                });
                
                // Keyboard accessibility
                box.addEventListener('keydown', function (e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            });
        });
    }
}

// To use it in the browser:
document.addEventListener('DOMContentLoaded', () => {
    const controller = new InteractiveBoxController();
    controller.init();
});