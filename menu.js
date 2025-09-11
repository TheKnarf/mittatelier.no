
document.addEventListener('DOMContentLoaded', function () {
    const openMenuBtn = document.getElementById('open-menu');
    const closeMenuBtn = document.getElementById('close-menu');
    const menu = document.getElementById('meny_aapen');

    openMenuBtn.addEventListener('click', function () {
        menu.style.display = 'initial';
    });

    closeMenuBtn.addEventListener('click', function () {
        menu.style.display = 'none';
    });
});
