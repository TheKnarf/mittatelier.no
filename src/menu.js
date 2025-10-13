
document.addEventListener('DOMContentLoaded', function () {
    const openMenuBtn = document.getElementById('open-menu');
    const closeMenuBtn = document.getElementById('close-menu');
    const menu = document.getElementById('meny');

    openMenuBtn.addEventListener('click', function () {
        menu.classList.add('menu-open');
    });

    closeMenuBtn.addEventListener('click', function () {
        menu.classList.remove('menu-open');
    });
});
