
document.addEventListener("DOMContentLoaded", function () {

    const cartItems = document.getElementById("cartItems");
    const cartProductCount = document.getElementById("cartProductCount");
    const quoteForm = document.getElementById("quoteForm");
    const formMessage = document.getElementById("formMessage");

    let sviProizvodi = [];

    const EMAIL_ADRESA = "divljaradiona@gmail.com";

    function siguranTekst(vrijednost) {
        return String(vrijednost ?? "").replace(/[&<>"']/g, znak => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[znak]);
    }

    fetch("podaci/proizvodi.json")
        .then(response => {
            if (!response.ok) {
                throw new Error("Nije moguće učitati proizvode.");
            }

            return response.json();
        })
        .then(proizvodi => {
            sviProizvodi = proizvodi;
            prikaziKosaricu();
        })
        .catch(error => {
            cartItems.textContent = error.message;
        });

    function prikaziKosaricu() {

        const kosarica = window.dohvatiKosaricu();

        const proizvodiUKosarici = kosarica.map(item => {
            const proizvod = sviProizvodi.find(
                p => String(p.id) === String(item.id)
            );

            return proizvod ? { ...proizvod, ...item } : null;
        }).filter(Boolean);

        const ukupanBroj = proizvodiUKosarici.reduce(
            (ukupno, proizvod) => ukupno + Number(proizvod.kolicina || 1),
            0
        );

        cartProductCount.textContent =
            `${ukupanBroj} ${ukupanBroj === 1 ? "proizvod" : "proizvoda"}`;

        if (proizvodiUKosarici.length === 0) {

            cartItems.innerHTML = `
                <div class="empty-cart">
                    <h3>Vaša košarica je prazna.</h3>
                    <p>Još niste odabrali nijedan proizvod.</p>
                    <a href="proizvodi.html">Pogledajte proizvode →</a>
                </div>
            `;

            quoteForm.hidden = true;
            window.azurirajBrojKosarice();
            return;
        }

        quoteForm.hidden = false;

        cartItems.innerHTML = proizvodiUKosarici.map(proizvod => {

            const cijena = proizvod.cijena != null && proizvod.cijena !== ""
                ? Number(proizvod.cijena).toLocaleString("hr-HR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }) + " €"
                : "Na upit";

            return `
                <article class="cart-item">

                    <img
                        src="${siguranTekst(proizvod.slika)}"
                        alt="${siguranTekst(proizvod.naziv)}"
                        class="cart-item-image"
                    >

                    <div class="cart-item-content">

                        <div class="cart-item-top">
                            <div>
                                <p class="cart-item-type">${siguranTekst(proizvod.tip)}</p>
                                <h3>${siguranTekst(proizvod.naziv)}</h3>
                            </div>

                            <button
                                type="button"
                                class="remove-cart-item"
                                data-remove="${siguranTekst(proizvod.id)}"
                                aria-label="Ukloni proizvod"
                            >×</button>
                        </div>

                        <p class="cart-item-price">${cijena} <span>/ kom</span></p>

                        <div class="cart-item-options">
                            <label>
                                Količina
                                <input
                                    type="number"
                                    min="1"
                                    value="${Number(proizvod.kolicina) || 1}"
                                    data-quantity="${siguranTekst(proizvod.id)}"
                                >
                            </label>
                        </div>

                        <label class="cart-note-label">
                            Kako želite prilagoditi ovaj proizvod?
                            <textarea
                                data-note="${siguranTekst(proizvod.id)}"
                                rows="3"
                                placeholder="Npr. želim određeni tekst, boju, gravuru, dimenzije..."
                            >${siguranTekst(proizvod.napomena || "")}</textarea>
                        </label>

                    </div>

                </article>
            `;
        }).join("");

        window.azurirajBrojKosarice();
    }

    cartItems.addEventListener("change", function (event) {

        if (event.target.matches("[data-quantity]")) {

            const id = event.target.dataset.quantity;
            const novaKolicina = Math.max(
                1,
                Number(event.target.value) || 1
            );

            const kosarica = window.dohvatiKosaricu();

            const proizvod = kosarica.find(
                item => String(item.id) === String(id)
            );

            if (proizvod) {
                proizvod.kolicina = novaKolicina;
                window.spremiKosaricu(kosarica);
                prikaziKosaricu();
            }
        }
    });

    cartItems.addEventListener("input", function (event) {

        if (event.target.matches("[data-note]")) {

            const id = event.target.dataset.note;
            const kosarica = window.dohvatiKosaricu();

            const proizvod = kosarica.find(
                item => String(item.id) === String(id)
            );

            if (proizvod) {
                proizvod.napomena = event.target.value;
                window.spremiKosaricu(kosarica);
            }
        }
    });

    cartItems.addEventListener("click", function (event) {

        const button = event.target.closest("[data-remove]");

        if (!button) return;

        const id = button.dataset.remove;

        const novaKosarica = window.dohvatiKosaricu().filter(
            item => String(item.id) !== String(id)
        );

        window.spremiKosaricu(novaKosarica);
        prikaziKosaricu();
    });

    quoteForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const kosarica = window.dohvatiKosaricu();

        if (kosarica.length === 0) {
            return;
        }

        if (EMAIL_ADRESA === "TVOJ_EMAIL@PRIMJER.HR") {
            formMessage.textContent =
                "Potrebno je postaviti e-mail adresu za primanje upita.";
            formMessage.className = "form-message error";
            return;
        }

        const podaci = new FormData(quoteForm);

        const ime = podaci.get("ime");
        const prezime = podaci.get("prezime");
        const email = podaci.get("email");
        const telefon = podaci.get("telefon");
        const opcenitaNapomena = podaci.get("opcenitaNapomena");

        let tekstProizvoda = "";

        kosarica.forEach((item, index) => {

            const proizvod = sviProizvodi.find(
                p => String(p.id) === String(item.id)
            );

            if (!proizvod) return;

            tekstProizvoda += `
PROIZVOD ${index + 1}
Naziv: ${proizvod.naziv}
Količina: ${item.kolicina}
Cijena po komadu: ${
                proizvod.cijena != null
                    ? proizvod.cijena + " €"
                    : "Na upit"
            }
Posebne želje i personalizacija:
${item.napomena || "Nisu navedene"}

----------------------------------------
`;
        });

        const predmet = "Novi upit za ponudu - Divlja Radiona";

        const poruka = `
Poštovani,

zaprimljen je novi upit putem web-stranice Divlja Radiona.

PODACI KUPCA
Ime: ${ime}
Prezime: ${prezime}
E-mail: ${email}
Broj mobitela: ${telefon}

ODABRANI PROIZVODI

${tekstProizvoda}

DODATNE INFORMACIJE
${opcenitaNapomena || "Nisu navedene"}

----------------------------------------
Upit je poslan putem web-stranice Divlja Radiona.
`;

        const gmailLink =
            `https://mail.google.com/mail/?view=cm&fs=1` +
            `&to=${encodeURIComponent(EMAIL_ADRESA)}` +
            `&su=${encodeURIComponent(predmet)}` +
            `&body=${encodeURIComponent(poruka)}`;

        window.open(gmailLink, "_blank");
    });

});
