

// Preview of the newly selected profile image
document.getElementById("img").addEventListener("change", function () {
    const preview = document.getElementById("photoPreview");
    const file = this.files[0];

    if (!file) return (preview.style.display = "none");

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
});
