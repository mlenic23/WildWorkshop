const CART_KEY = "divljaRadionaKosarica";

function dohvatiKosaricu() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
        return [];
    }
}

function spremiKosaricu(kosarica) {
    localStorage.setItem(CART_KEY, JSON.stringify(kosarica));
    azurirajBrojKosarice();
}

function azurirajBrojKosarice() {
    const cartCount = document.getElementById("cartCount");

    if (!cartCount) return;

    const kosarica = dohvatiKosaricu();

    const brojProizvoda = kosarica.reduce(
        (ukupno, proizvod) => ukupno + Number(proizvod.kolicina || 0),
        0
    );

    cartCount.textContent = brojProizvoda;
    cartCount.hidden = false;
}

window.dohvatiKosaricu = dohvatiKosaricu;
window.spremiKosaricu = spremiKosaricu;
window.azurirajBrojKosarice = azurirajBrojKosarice;

document.addEventListener("DOMContentLoaded", azurirajBrojKosarice);