// --- Hent elementene ---
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('meny');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks = document.querySelectorAll('#meny a');
const navWrapper = document.getElementById('navwrapper');

// --- Funksjon for å åpne/lukke meny ---
function toggleMenu() {
  mainNav.classList.toggle('active');
  menuOverlay.classList.toggle('active');
  menuToggle.classList.toggle('active');
  navWrapper.classList.toggle('menu-active');
}

// --- Funksjon for å lukke menyen helt ---
function closeMenu() {
  mainNav.classList.remove('active');
  menuOverlay.classList.remove('active');
  menuToggle.classList.remove('active');
  navWrapper.classList.remove('menu-active');
}

// --- Åpne/lukke meny når hamburgeren klikkes ---
menuToggle.addEventListener('click', toggleMenu);

// --- Lukk meny når man klikker på overlay (mørk bakgrunn) ---
menuOverlay.addEventListener('click', closeMenu);

// --- Lukk meny når man klikker på en lenke ---
menuLinks.forEach(link => {
  link.addEventListener('click', closeMenu);
});

// --- Lukk meny automatisk ved tilbakeknapp eller gjenopplasting ---
window.addEventListener('pageshow', () => {
  closeMenu();
});