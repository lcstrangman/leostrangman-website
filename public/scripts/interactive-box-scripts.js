class InteractiveBoxController {
    constructor() {}

    init() {
        const html = document.documentElement;
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || (navigator.msMaxTouchPoints > 0);
        html.classList.add(!isTouch ? 'is-desktop' : 'is-mobile');

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
                    box.addEventListener('touchstart', function () {
                        bulletBoxes.forEach(b => b.classList.remove('is-active'));
                        this.classList.add('is-active');
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