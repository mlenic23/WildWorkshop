
document.addEventListener("DOMContentLoaded", function () {

    const productDetail = document.getElementById("productDetail");
    const addToCartContainer = document.getElementById("addToCartBelowGallery");

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");

    fetch("podaci/proizvodi.json")
        .then(function (response) {

            if (!response.ok) {
                throw new Error("Nije moguće učitati proizvodi.json.");
            }

            return response.json();

        })
        .then(function (products) {

            const product = products.find(function (item) {
                return String(item.id) === String(productId);
            });

            if (!product) {

                productDetail.innerHTML = `
                    <div class="product-not-found">
                        <h1>Proizvod nije pronađen.</h1>
                        <p>Proizvod s ovim ID-em ne postoji.</p>
                        <a href="proizvodi.html">
                            ← Natrag na proizvode
                        </a>
                    </div>
                `;

                return;
            }

            document.title = product.naziv + " | Divlja Radiona";

            const cijena =
                product.cijena != null &&
                product.cijena !== "" &&
                product.cijena !== "None"
                    ? Number(product.cijena).toLocaleString("hr-HR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }) + " €"
                    : "Na upit";

            const sveFotografije = [
                product.slika,
                ...(product.dodatne_slike || [])
            ].filter(Boolean);

            productDetail.innerHTML = `

                <div class="product-image-gallery">

                    <div class="product-thumbnails-container">

                        <button
                            class="thumbnail-arrow thumbnail-prev"
                            type="button"
                            aria-label="Prethodne fotografije"
                        >
                            ↑
                        </button>

                        <div
                            class="product-thumbnails"
                            id="productThumbnails"
                        ></div>

                        <button
                            class="thumbnail-arrow thumbnail-next"
                            type="button"
                            aria-label="Sljedeće fotografije"
                        >
                            ↓
                        </button>

                    </div>

                    <div class="product-main-image">

                        <img
                            src="${product.slika}"
                            alt="${product.naziv}"
                            id="mainProductImage"
                        >

                        <span class="product-detail-number">
                            ${String(product.id).padStart(2, "0")}
                        </span>

                    </div>

                </div>

                <div class="product-information">

                    <p class="product-detail-type">
                        ${product.tip || ""}
                    </p>

                    <h1>${product.naziv}</h1>

                    <div class="product-detail-line"></div>

                    <div class="product-description-row">
                        <p class="product-description">
                            ${product.opis || ""}
                        </p>
                    </div>

                    <div class="product-specifications">

                        <div class="product-specification">
                            <span>MATERIJAL</span>
                            <strong>${product.materijal || "Nije navedeno"}</strong>
                        </div>

                        <div class="product-specification">
                            <span>DIMENZIJE</span>
                            <strong>${product.dimenzije || "Nije navedeno"}</strong>
                        </div>

                        <div class="product-price">
                            <span>CIJENA</span>
                            <strong>${cijena}</strong>
                        </div>

                    </div>

                </div>

            `;

            const thumbnailsContainer =
                document.getElementById("productThumbnails");

            const mainProductImage =
                document.getElementById("mainProductImage");

            const thumbnailPrev =
                document.querySelector(".thumbnail-prev");

            const thumbnailNext =
                document.querySelector(".thumbnail-next");

            let selectedImage = 0;
            let thumbnailStart = 0;

            const maxVisibleThumbnails = 4;

            function renderThumbnails() {

                thumbnailsContainer.innerHTML = "";

                const visibleImages = sveFotografije.slice(
                    thumbnailStart,
                    thumbnailStart + maxVisibleThumbnails
                );

                visibleImages.forEach(function (image, index) {

                    const actualIndex = thumbnailStart + index;

                    const thumbnail = document.createElement("button");

                    thumbnail.type = "button";
                    thumbnail.className = "product-thumbnail";

                    if (actualIndex === selectedImage) {
                        thumbnail.classList.add("active");
                    }

                    thumbnail.innerHTML = `
                        <img
                            src="${image}"
                            alt="${product.naziv} - fotografija ${actualIndex + 1}"
                        >
                    `;

                    thumbnail.addEventListener("click", function () {

                        selectedImage = actualIndex;

                        mainProductImage.src = sveFotografije[selectedImage];

                        mainProductImage.alt =
                            product.naziv + " - fotografija " + (selectedImage + 1);

                        renderThumbnails();

                    });

                    thumbnailsContainer.appendChild(thumbnail);

                });

                const imaViseFotografija =
                    sveFotografije.length > maxVisibleThumbnails;

                thumbnailPrev.hidden = !imaViseFotografija;
                thumbnailNext.hidden = !imaViseFotografija;

                thumbnailPrev.disabled = thumbnailStart === 0;

                thumbnailNext.disabled =
                    thumbnailStart + maxVisibleThumbnails >= sveFotografije.length;

            }

            thumbnailPrev.addEventListener("click", function () {

                if (thumbnailStart > 0) {

                    thumbnailStart--;

                    renderThumbnails();

                }

            });

            thumbnailNext.addEventListener("click", function () {

                if (
                    thumbnailStart + maxVisibleThumbnails <
                    sveFotografije.length
                ) {

                    thumbnailStart++;

                    renderThumbnails();

                }

            });


            renderThumbnails();

            const addButton = document.createElement("button");

            addButton.className = "add-to-cart-button";
            addButton.id = "addToCartButton";
            addButton.type = "button";
            addButton.innerHTML = 'Dodaj u ponudu <span>+</span>';

            const productInformation = document.querySelector(".product-information");

            if (productInformation) {
                productInformation.appendChild(addButton);
            }

            const modal = document.createElement("div");

            modal.className = "customization-modal";
            modal.id = "customizationModal";

            modal.innerHTML = `

                <div class="customization-modal-content">

                    <button
                        type="button"
                        class="customization-close"
                        id="closeCustomization"
                        aria-label="Zatvori obrazac"
                    >
                        ×
                    </button>

                    <div class="customization-modal-inner">

                        <div class="customization-modal-header">

                            <span class="customization-label">
                                DIVLJA RADIONA · PERSONALIZACIJA
                            </span>

                            <h2>Stvorimo nešto posebno.</h2>

                            <p>
                                Svaki proizvod izrađujemo s posebnom pažnjom.
                                Recite nam kako želite da izgleda vaš.
                            </p>

                        </div>

                        <div class="customization-product-info">

                            <img
                                src="${product.slika}"
                                alt="${product.naziv}"
                            >

                            <div>
                                <span>ODABRANI PROIZVOD</span>

                                <h3>${product.naziv}</h3>

                                <p>
                                    ${cijena === "Na upit" ? "Cijena na upit" : cijena}
                                </p>
                            </div>

                        </div>

                        <form id="customizationForm">

                            <div class="customization-field">

                                <label for="engravingText">
                                    01 / Tekst za gravuru (za svaki dio proizvoda navedite željeni tekst)
                                </label>

                                <input
                                    type="text"
                                    id="engravingText"
                                    placeholder="Npr. Sretan rođendan! - na prednjem dijelu, Tvoj Marko - na stražnjem dijelu"
                                >

                            </div>

                            <div class="customization-field">

                                <label for="designDescription">
                                    02 / Kako zamišljate svoj proizvod?
                                </label>

                                <textarea
                                    id="designDescription"
                                    rows="5"
                                    placeholder="Opišite željene motive, boje, izgled, dimenzije i sve ostale detalje..."
                                    required
                                ></textarea>

                            </div>

                            <div class="customization-modal-note">
                                <span>✳</span>

                                Svaki detalj nam pomaže izraditi proizvod
                                baš prema vašim željama.
                            </div>

                            <button
                                type="submit"
                                class="add-to-cart-button customization-submit"
                            >
                                Spremi u ponudu <span>+</span>
                            </button>

                        </form>

                    </div>

                </div>

            `;

            document.body.appendChild(modal);

            addButton.addEventListener("click", function () {

                modal.classList.add("active");
                document.body.classList.add("modal-open");

            });

            const closeButton =
                document.getElementById("closeCustomization");

            function closeModal() {

                modal.classList.remove("active");
                document.body.classList.remove("modal-open");

            }

            closeButton.addEventListener("click", closeModal);

            modal.addEventListener("click", function (event) {

                if (event.target === modal) {
                    closeModal();
                }

            });

            document.addEventListener("keydown", function (event) {

                if (
                    event.key === "Escape" &&
                    modal.classList.contains("active")
                ) {
                    closeModal();
                }

            });

            const customizationForm =
                document.getElementById("customizationForm");

            customizationForm.addEventListener("submit", function (event) {

                event.preventDefault();

                const tekstGravure =
                    document.getElementById("engravingText").value.trim();

                const opisDizajna =
                    document.getElementById("designDescription").value.trim();

                const napomena = [

                    tekstGravure
                        ? "Tekst za gravuru: " + tekstGravure
                        : "",

                    "Željeni dizajn: " + opisDizajna

                ].filter(Boolean).join("\n\n");

                if (
                    typeof window.dohvatiKosaricu !== "function" ||
                    typeof window.spremiKosaricu !== "function"
                ) {

                    alert("Došlo je do greške. Košarica nije dostupna.");

                    return;
                }

                const kosarica = window.dohvatiKosaricu();

                const postojeciProizvod = kosarica.find(function (item) {

                    return String(item.id) === String(product.id);

                });


                if (postojeciProizvod) {

                    postojeciProizvod.kolicina += 1;
                    postojeciProizvod.napomena = napomena;

                } else {

                    kosarica.push({

                        id: product.id,
                        kolicina: 1,
                        napomena: napomena

                    });

                }

                window.spremiKosaricu(kosarica);
                closeModal();

                addButton.innerHTML = 'Dodano u ponudu <span>✓</span>';

                addButton.classList.add("added");

                customizationForm.reset();

                setTimeout(function () {

                    addButton.innerHTML = 'Dodaj u ponudu <span>+</span>';

                    addButton.classList.remove("added");

                }, 2200);

            });

            const lightbox =
                document.getElementById("imageLightbox");

            const lightboxImage =
                document.getElementById("lightboxImage");

            const lightboxClose =
                document.getElementById("lightboxClose");

            const lightboxPrev =
                document.getElementById("lightboxPrev");

            const lightboxNext =
                document.getElementById("lightboxNext");

            let currentImage = 0;

            function showImage(index) {

                currentImage =
                    (index + sveFotografije.length) % sveFotografije.length;

                lightboxImage.src = sveFotografije[currentImage];

                lightboxImage.alt =
                    product.naziv + " - fotografija " + (currentImage + 1);

                lightbox.classList.add("active");

                document.body.classList.add("lightbox-open");

            }

            mainProductImage.addEventListener("click", function () {

                showImage(selectedImage);

            });

            function closeLightbox() {

                lightbox.classList.remove("active");

                document.body.classList.remove("lightbox-open");

            }

            lightboxClose.addEventListener("click", closeLightbox);

            lightboxPrev.addEventListener("click", function () {

                showImage(currentImage - 1);

            });

            lightboxNext.addEventListener("click", function () {

                showImage(currentImage + 1);

            });

            lightbox.addEventListener("click", function (event) {

                if (event.target === lightbox) {
                    closeLightbox();
                }

            });

            document.addEventListener("keydown", function (event) {

                if (!lightbox.classList.contains("active")) {
                    return;
                }

                if (event.key === "Escape") {
                    closeLightbox();
                }

                if (event.key === "ArrowLeft") {
                    showImage(currentImage - 1);
                }

                if (event.key === "ArrowRight") {
                    showImage(currentImage + 1);
                }

            });

        })

        .catch(function (error) {

            console.error(error);

            if (productDetail) {

                productDetail.innerHTML = `
                    <div class="product-not-found">
                        <h1>Došlo je do pogreške.</h1>
                        <p>Proizvod trenutno nije moguće učitati.</p>
                        <a href="proizvodi.html">
                            ← Natrag na proizvode
                        </a>
                    </div>
                `;

            }

        });

});
