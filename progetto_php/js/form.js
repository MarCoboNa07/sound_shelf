// js/form.js
// file javascript per i form

// funzione per gestire la visibilità della password sul corrispondente input nei form
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-toggle-password]").forEach(toggle => {
        const form = toggle.closest("form"); // ottieni il formo utilizzato
        const passwordInputs = form.querySelectorAll("[data-password]"); // ottieni tutti gli input di tipo password

        if (!passwordInputs.length) return; // verifica se la password non è stata inserita

        // funzione per convertire il tipo di input da password a testo e viceversa
        toggle.addEventListener("change", () => {
            passwordInputs.forEach(input => {
                input.type = toggle.checked ? "text" : "password";
            });
        });
    });
});
