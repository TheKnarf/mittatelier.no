// const menuToggle = document.getElementById("menuToggle");
// const mobileMenu = document.getElementById("mobileMenu");
// const menuOverlay = document.getElementById("menuOverlay");

// menuToggle.addEventListener("click", () => {
//   menuToggle.classList.toggle("active");
//   mobileMenu.classList.toggle("active");
//   menuOverlay.classList.toggle("active");
//   document.body.classList.toggle("no-scroll");
// });

// Valgfritt: lukk menyen hvis man trykker på overlayet
// menuOverlay.addEventListener("click", () => {
//   menuToggle.classList.remove("active");
//   mobileMenu.classList.remove("active");
//   menuOverlay.classList.remove("active");
//   document.body.classList.remove("no-scroll");
// });

// Lukk menyen når siden lastes (for å håndtere tilbakeknapp osv.)
// window.addEventListener('pageshow', () => {
//   closeMenu();
// });

// --- Hent elementene ---
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const menuOverlay = document.querySelector('.menu-overlay');
const menuLinks = document.querySelectorAll('.mobile-menu a');
const navWrapper = document.getElementById('navwrapper');

// --- Funksjon for å åpne/lukke meny ---
function toggleMenu() {
  mobileMenu.classList.toggle('active');
  menuOverlay.classList.toggle('active');
  menuToggle.classList.toggle('active');
  navWrapper.classList.toggle('menu-active');
}

// --- Funksjon for å lukke menyen helt ---
function closeMenu() {
  mobileMenu.classList.remove('active');
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
