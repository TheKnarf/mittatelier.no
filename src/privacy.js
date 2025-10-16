
document.addEventListener('DOMContentLoaded', () => {
  const privacyLinks = document.querySelectorAll('.privacy-link');

  if (privacyLinks.length > 0) {
    const privacyPolicyHTML = `
      <div id="privacy-modal" class="modal" style="display:none;">
        <div class="modal-content">
          <span class="close-btn">&times;</span>
          <h2>Personvernerklæring for Mitt Atelier</h2>
          <p><strong>Sist oppdatert:</strong> 16. oktober 2025</p>
          <h3>1. Behandlingsansvarlig</h3>
          <p>Mitt Atelier ved eier Liv Grethe Bredland er behandlingsansvarlig for virksomhetens behandling av personopplysninger.</p>
          <p>Kontaktinformasjon:</p>
          <ul>
            <li>Liv Grethe Bredland</li>
            <li>E-post: <a href="mailto:livis@kleppnett.no">livis@kleppnett.no</a></li>
            <li>Telefon: 90 84 00 08</li>
          </ul>
          <h3>2. Hvilke opplysninger som samles inn</h3>
          <p>Vi samler inn personopplysninger på følgende måter:</p>
          <ul>
            <li><strong>E-post:</strong> Når du sender oss en e-post, lagrer vi din e-postadresse og korrespondansen for å kunne besvare din henvendelse.</li>
            <li><strong>Tredjepartstjenester (Google Maps):</strong> Vi bruker Google Maps på vår kontaktside for å vise vår beliggenhet. Bruk av denne tjenesten kan medføre at Google samler inn data som din IP-adresse og posisjon. For mer informasjon, se <a href="https://policies.google.com/privacy" target="_blank">Googles personvernerklæring</a>.</li>
          </ul>
          <h3>3. Formål og rettslig grunnlag</h3>
          <p>Opplysningene som samles inn via e-post brukes for å kommunisere med deg og besvare dine henvendelser. Behandlingen er basert på berettiget interesse (GDPR artikkel 6.1 f) i å yte service og kommunisere med interessenter.</p>
          <h3>4. Lagring av personopplysninger</h3>
          <p>Vi lagrer personopplysninger så lenge det er nødvendig for det formål personopplysningene ble samlet inn for. E-postkorrespondanse lagres så lenge det er relevant for kundeforholdet eller henvendelsen.</p>
          <h3>5. Dine rettigheter</h3>
          <p>Du har rett til innsyn i egne opplysninger. Du kan også be om retting eller sletting av uriktige eller ufullstendige opplysninger. Har du spørsmål om vår behandling av personopplysninger, kan du kontakte oss på e-post.</p>
          <p>Dersom du mener at vår behandling av personopplysninger ikke stemmer med det vi har beskrevet her eller at vi på andre måter bryter personvernlovgivningen, kan du klage til Datatilsynet.</p>
          <h3>6. Informasjonskapsler (Cookies) og lokal lagring</h3>
          <p>Denne nettsiden bruker ikke informasjonskapsler (cookies) for sporing eller analyse. Enkelte sider kan bruke nettleserens lokale lagring (localStorage) for å lagre data. Disse dataene lagres kun på din egen enhet og sendes ikke til oss.</p>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.innerHTML = `
      .modal {
        display: none;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        overflow: auto;
        background-color: rgba(0,0,0,0.5);
      }
      .modal-content {
        background-color: #fefefe;
        margin: 10% auto;
        padding: 20px;
        border: 1px solid #888;
        width: 80%;
        max-width: 700px;
        border-radius: 5px;
        position: relative;
      }
      .close-btn {
        color: #aaa;
        position: absolute;
        top: 10px;
        right: 25px;
        font-size: 35px;
        font-weight: bold;
        cursor: pointer;
      }
      .close-btn:hover,
      .close-btn:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
      }
    `;
    document.head.appendChild(style);
    document.body.insertAdjacentHTML('beforeend', privacyPolicyHTML);

    const modal = document.getElementById('privacy-modal');
    const closeBtn = modal.querySelector('.close-btn');

    privacyLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'block';
      });
    });

    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
      if (e.target == modal) {
        modal.style.display = 'none';
      }
    });
  }
});
