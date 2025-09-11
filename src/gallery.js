document.addEventListener('DOMContentLoaded', function () {
    const popup = document.getElementById('image-popup');
    const popupImg = document.getElementById('popup-img');
    const closeBtn = document.querySelector('.close-btn');

    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', function (e) {
            e.preventDefault();
            popup.style.display = 'block';
            popupImg.src = this.href;
        });
    });

    closeBtn.addEventListener('click', function () {
        popup.style.display = 'none';
    });

    window.addEventListener('click', function (e) {
        if (e.target == popup) {
            popup.style.display = 'none';
        }
    });
});
