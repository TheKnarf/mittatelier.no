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

document.addEventListener('DOMContentLoaded', () => {
    const galleryDivs = document.querySelectorAll('.gallery');
    galleryDivs.forEach(galleryDiv => {
        const descDiv = galleryDiv.querySelector('.desc');
        const img = galleryDiv.querySelector('img');
        if (descDiv && img) {
            const descText = descDiv.innerText;
            const sizeMatch = descText.match(/(\d+)\s*x\s*(\d+)\s*cm/);
            if (sizeMatch && sizeMatch.length === 3) {
                const width = parseInt(sizeMatch[1], 10);
                const height = parseInt(sizeMatch[2], 10);
                
                const scalingFactor = 3.5;

                img.style.width = `${width * scalingFactor}px`;
                img.style.height = `${height * scalingFactor}px`;
            }
        }
    });
});
