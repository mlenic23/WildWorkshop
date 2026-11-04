
document.addEventListener("DOMContentLoaded", function () {

    const productsGrid =
        document.querySelector(".products-grid");

    if (!productsGrid) {
        console.error("Nije pronađen element .products-grid");
        return;
    }

    fetch("./podaci/proizvodi.json")
        .then(function (response) {

            if (!response.ok) {
                throw new Error(
                    "HTTP greška " + response.status +
                    " — provjeri putanju do proizvodi.json"
                );
            }

            return response.json();
        })
        .then(function (products) {

            if (!Array.isArray(products)) {
                throw new Error(
                    "JSON mora sadržavati niz proizvoda [ ... ]."
                );
            }

            productsGrid.innerHTML = "";

            products.forEach(function (product, index) {

                const card = document.createElement("a");

                card.href = "proizvod.html?id=" + product.id;

                card.className =
                    "product-card product-card-" +
                    ((index % 8) + 1);

                card.innerHTML = `
                    <div class="product-card-paper">
                        <div class="product-card-image">
                            <img
                                src="${product.slika}"
                                alt="${product.naziv}"
                            >
                            <span class="product-number">
                                ${String(product.id).padStart(2, "0")}
                            </span>
                        </div>

                        <div class="product-card-content">
                            <span class="product-card-type">
                                ${product.tip}
                            </span>

                            <h3>${product.naziv}</h3>

                            <span class="product-card-link">
                                Pogledaj proizvod
                                <span>→</span>
                            </span>
                        </div>
                    </div>
                `;

                productsGrid.appendChild(card);
            });

            console.log("Proizvodi uspješno učitani:", products);

        })
        .catch(function (error) {

            console.error("GREŠKA PRI UČITAVANJU:", error);

            productsGrid.innerHTML = `
                <p>
                    ${error.message}
                    Otvori konzolu preglednika za više detalja.
                </p>
            `;
        });

});
