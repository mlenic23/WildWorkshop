
document.addEventListener("DOMContentLoaded", function () {

    const productDetail =
        document.getElementById("productDetail");

    const productGallery =
        document.getElementById("productGallery");


    const urlParams =
        new URLSearchParams(window.location.search);

    const productId =
        urlParams.get("id");


    fetch("podaci/proizvodi.json")

        .then(function (response) {

            if (!response.ok) {
                throw new Error(
                    "Nije moguće učitati proizvodi.json."
                );
            }

            return response.json();

        })

        .then(function (products) {

            const product =
                products.find(function (item) {
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


            document.title =
                product.naziv + " | Divlja Radiona";

            productDetail.innerHTML = `

                <div class="product-main-image">

                    <img
                        src="${product.slika}"
                        alt="${product.naziv}"
                    >

                    <span class="product-detail-number">
                        ${String(product.id).padStart(2, "0")}
                    </span>

                </div>


                <div class="product-information">

                    <p class="product-detail-type">
                        ${product.tip}
                    </p>

                    <h1>${product.naziv}</h1>

                    <div class="product-detail-line"></div>

                    <div class="product-description-row">
                        <p class="product-description">
                            ${product.opis}
                        </p>
                    </div>

                    <div class="product-specifications">

                        <div class="product-specification">
                            <span>MATERIJAL</span>
                            <strong>${product.materijal}</strong>
                        </div>

                        <div class="product-specification">
                            <span>DIMENZIJE</span>
                            <strong>${product.dimenzije}</strong>
                        </div>

                        <div class="product-price">
                            <span>CIJENA</span>
                            <strong>
                                ${product.cijena != null && product.cijena !== "" && product.cijena !== "None"
                                    ? Number(product.cijena).toLocaleString("hr-HR", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }) + " €"
                                    : "Na upit"}
                            </strong>
                        </div>

                    </div>

                </div>

            `;

            if (
                product.dodatne_slike &&
                product.dodatne_slike.length > 0
            ) {

                let currentSlide = 0;

                productGallery.innerHTML = `

                    <button
                        class="gallery-slider-arrow gallery-prev"
                        type="button"
                        aria-label="Prethodna fotografija"
                    >
                        ‹
                    </button>

                    <div class="gallery-slider-stage"></div>

                    <button
                        class="gallery-slider-arrow gallery-next"
                        type="button"
                        aria-label="Sljedeća fotografija"
                    >
                        ›
                    </button>

                    <div class="gallery-slider-counter"></div>

                `;


                const galleryStage =
                    productGallery.querySelector(
                        ".gallery-slider-stage"
                    );

                const galleryCounter =
                    productGallery.querySelector(
                        ".gallery-slider-counter"
                    );

                const prevButton =
                    productGallery.querySelector(
                        ".gallery-prev"
                    );

                const nextButton =
                    productGallery.querySelector(
                        ".gallery-next"
                    );

                product.dodatne_slike.forEach(
                    function (image, index) {

                        const galleryItem =
                            document.createElement("div");

                        galleryItem.className =
                            "product-gallery-item";

                        galleryItem.innerHTML = `
                            <img
                                src="${image}"
                                alt="${product.naziv} - fotografija ${index + 1}"
                            >
                        `;

                        galleryStage.appendChild(galleryItem);

                    }
                );


                const galleryItems =
                    galleryStage.querySelectorAll(
                        ".product-gallery-item"
                    );

                const galleryImages =
                    galleryStage.querySelectorAll("img");

                function showSlide(index) {

                    currentSlide =
                        (index + galleryItems.length) %
                        galleryItems.length;

                    galleryItems.forEach(
                        function (item, itemIndex) {

                            item.classList.toggle(
                                "active",
                                itemIndex === currentSlide
                            );

                        }
                    );

                    galleryCounter.textContent =
                        (currentSlide + 1) +
                        " / " +
                        galleryItems.length;

                }


                showSlide(0);

                prevButton.addEventListener(
                    "click",
                    function () {
                        showSlide(currentSlide - 1);
                    }
                );

                nextButton.addEventListener(
                    "click",
                    function () {
                        showSlide(currentSlide + 1);
                    }
                );

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
                        (index + galleryImages.length) %
                        galleryImages.length;

                    lightboxImage.src =
                        galleryImages[currentImage].src;

                    lightboxImage.alt =
                        galleryImages[currentImage].alt;

                    lightbox.classList.add("active");

                    document.body.classList.add(
                        "lightbox-open"
                    );

                }


                function closeLightbox() {

                    lightbox.classList.remove("active");

                    document.body.classList.remove(
                        "lightbox-open"
                    );

                }


                galleryImages.forEach(
                    function (image, index) {

                        image.addEventListener(
                            "click",
                            function () {
                                showImage(index);
                            }
                        );

                    }
                );


                lightboxClose.addEventListener(
                    "click",
                    closeLightbox
                );


                lightboxPrev.addEventListener(
                    "click",
                    function () {
                        showImage(currentImage - 1);
                    }
                );


                lightboxNext.addEventListener(
                    "click",
                    function () {
                        showImage(currentImage + 1);
                    }
                );

                lightbox.addEventListener(
                    "click",
                    function (event) {

                        if (event.target === lightbox) {
                            closeLightbox();
                        }

                    }
                );

                document.addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            !lightbox.classList.contains("active")
                        ) {
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

                    }
                );

                let touchStartX = 0;

                galleryStage.addEventListener(
                    "touchstart",
                    function (event) {
                        touchStartX =
                            event.changedTouches[0].screenX;
                    }
                );

                galleryStage.addEventListener(
                    "touchend",
                    function (event) {

                        const touchEndX =
                            event.changedTouches[0].screenX;

                        const difference =
                            touchStartX - touchEndX;

                        if (Math.abs(difference) < 50) {
                            return;
                        }

                        if (difference > 0) {
                            showSlide(currentSlide + 1);
                        } else {
                            showSlide(currentSlide - 1);
                        }

                    }
                );

            } else {

                productGallery.innerHTML = `
                    <p class="no-gallery">
                        Dodatne fotografije trenutno nisu dostupne.
                    </p>
                `;

            }

        })

        .catch(function (error) {

            console.error(error);

            productDetail.innerHTML = `
                <div class="product-not-found">
                    <h1>Došlo je do greške.</h1>
                    <p>${error.message}</p>
                    <a href="proizvodi.html">
                        ← Natrag na proizvode
                    </a>
                </div>
            `;

        });

});
