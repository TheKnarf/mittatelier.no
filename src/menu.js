
document.addEventListener('DOMContentLoaded', function () {
    const openMenuBtn = document.getElementById('open-menu');
    const closeMenuBtn = document.getElementById('close-menu');
    const menu = document.getElementById('meny');
    const body = document.body;

    openMenuBtn.addEventListener('click', function () {
        menu.classList.add('menu-open');
        body.classList.add('menu-open-body-lock');
    });

    closeMenuBtn.addEventListener('click', function () {
        menu.classList.remove('menu-open');
        body.classList.remove('menu-open-body-lock');
    });
});
