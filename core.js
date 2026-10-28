// Add alt text to all images
document.querySelectorAll('img').forEach(img => {
    img.setAttribute('alt', 'naraine-images');
});

// Apply AOS animation attributes
document.querySelectorAll(
    '.info-section-common :is(h1, p, img, li, h6)'
).forEach(element => {
    element.setAttribute('data-aos', 'fade-down');
    element.setAttribute('data-aos-delay', '300');
    element.setAttribute('data-aos-duration', '500');
    element.setAttribute('data-aos-offset', '-100');
    element.setAttribute('data-aos-once', 'false');
});

AOS.init();